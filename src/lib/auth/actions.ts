"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import sql from "sql-template-tag";
import { z } from "zod";
import { one, oneOrNone } from "@/lib/db/queries";
import { UserRow } from "@/lib/db/schemas";
import {
    accessCookieOptions,
    ACCESS_COOKIE,
    clearedCookieOptions,
    refreshCookieOptions,
    REFRESH_COOKIE,
} from "./cookies";
import { signAccessToken } from "./jwt";
import { hashPassword, verifyPassword } from "./password";
import { issueRefreshToken, revokeRefreshTokenByRaw } from "./refresh";

export type FormState = {
    ok: boolean;
    formError?: string;
    fieldErrors?: Record<string, string[]>;
};

const RegisterSchema = z.object({
    email: z.string().email().max(254),
    displayName: z.string().trim().min(1).max(60),
    password: z.string().min(8).max(200),
});

const LoginSchema = z.object({
    email: z.string().email().max(254),
    password: z.string().min(1).max(200),
});

async function startSession(userId: string) {
    const headerList = await headers();
    const userAgent = headerList.get("user-agent");
    const accessToken = await signAccessToken(userId);
    const rawRefresh = await issueRefreshToken(userId, userAgent);
    const jar = await cookies();
    jar.set(ACCESS_COOKIE, accessToken, accessCookieOptions);
    jar.set(REFRESH_COOKIE, rawRefresh, refreshCookieOptions);
}

export async function registerAction(_: FormState, fd: FormData): Promise<FormState> {
    const parsed = RegisterSchema.safeParse({
        email: fd.get("email"),
        displayName: fd.get("displayName"),
        password: fd.get("password"),
    });
    if (!parsed.success) {
        return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const existing = await oneOrNone(
        sql`SELECT "userId" FROM users WHERE "email" = ${parsed.data.email}`,
        z.object({ userId: z.string().uuid() }),
    );
    if (existing) return { ok: false, formError: "Email already registered" };

    const passwordHash = await hashPassword(parsed.data.password);
    const inserted = await one(
        sql`
            INSERT INTO users ("email", "passwordHash", "displayName")
            VALUES (${parsed.data.email}, ${passwordHash}, ${parsed.data.displayName})
            RETURNING *
        `,
        UserRow,
    );
    await startSession(inserted.userId);
    redirect("/");
}

export async function loginAction(_: FormState, fd: FormData): Promise<FormState> {
    const parsed = LoginSchema.safeParse({
        email: fd.get("email"),
        password: fd.get("password"),
    });
    if (!parsed.success) {
        return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const user = await oneOrNone(
        sql`SELECT * FROM users WHERE "email" = ${parsed.data.email}`,
        UserRow,
    );
    if (!user) return { ok: false, formError: "Invalid email or password" };

    const valid = await verifyPassword(user.passwordHash, parsed.data.password);
    if (!valid) return { ok: false, formError: "Invalid email or password" };

    await startSession(user.userId);
    redirect("/");
}

export async function logoutAction() {
    const jar = await cookies();
    const raw = jar.get(REFRESH_COOKIE)?.value;
    if (raw) await revokeRefreshTokenByRaw(raw);
    jar.set(ACCESS_COOKIE, "", clearedCookieOptions);
    jar.set(REFRESH_COOKIE, "", clearedCookieOptions);
    redirect("/login");
}

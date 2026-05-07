import { cookies } from "next/headers";
import sql from "sql-template-tag";
import { oneOrNone } from "@/lib/db/queries";
import { PublicUser } from "@/lib/db/schemas";
import { ACCESS_COOKIE } from "./cookies";
import { verifyAccessToken } from "./jwt";

export async function getCurrentUser(): Promise<PublicUser | null> {
    const jar = await cookies();
    const token = jar.get(ACCESS_COOKIE)?.value;
    if (!token) return null;

    const payload = await verifyAccessToken(token);
    if (!payload) return null;

    const user = await oneOrNone(
        sql`SELECT "userId", "email", "displayName" FROM users WHERE "userId" = ${payload.userId}`,
        PublicUser,
    );
    return user ?? null;
}

export async function requireUser(): Promise<PublicUser> {
    const user = await getCurrentUser();
    if (!user) throw new Error("Not authenticated");
    return user;
}

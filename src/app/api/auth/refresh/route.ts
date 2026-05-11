import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import {
    accessCookieOptions,
    ACCESS_COOKIE,
    clearedCookieOptions,
    refreshCookieOptions,
    REFRESH_COOKIE,
} from "@/lib/auth/cookies";
import { signAccessToken } from "@/lib/auth/jwt";
import { rotateRefreshToken } from "@/lib/auth/refresh";

export async function POST() {
    const jar = await cookies();
    const raw = jar.get(REFRESH_COOKIE)?.value;
    if (!raw) {
        return NextResponse.json({ ok: false }, { status: 401 });
    }

    const headerList = await headers();
    const userAgent = headerList.get("user-agent");

    const result = await rotateRefreshToken(raw, userAgent);
    if (!result.ok) {
        const res = NextResponse.json({ ok: false, reason: result.reason }, { status: 401 });
        res.cookies.set(ACCESS_COOKIE, "", clearedCookieOptions);
        res.cookies.set(REFRESH_COOKIE, "", clearedCookieOptions);
        return res;
    }

    const accessToken = await signAccessToken(result.userId);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ACCESS_COOKIE, accessToken, accessCookieOptions);
    if (result.newRawToken !== null) {
        res.cookies.set(REFRESH_COOKIE, result.newRawToken, refreshCookieOptions);
    }
    return res;
}

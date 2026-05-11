import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/cookies";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { isMobileUserAgent } from "@/lib/device";

const PROTECTED_PATTERNS: RegExp[] = [
    /^\/recipes$/,
    /^\/recipes\/new(?:\/|$)/,
    /^\/recipes\/drafts(?:\/|$)/,
    /^\/collections(?:\/|$)/,
    /^\/account(?:\/|$)/,
    /^\/ingredients\/new(?:\/|$)/,
];

const isProtected = (pathname: string) => PROTECTED_PATTERNS.some((re) => re.test(pathname));

const PUBLIC_FILE = /\.[^/]+$/;

async function tryRefresh(req: NextRequest): Promise<Response | null> {
    const refreshCookie = req.cookies.get(REFRESH_COOKIE)?.value;
    if (!refreshCookie) return null;

    const base = process.env.INTERNAL_URL ?? req.url;
    const url = new URL("/api/auth/refresh", base);
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                cookie: req.headers.get("cookie") ?? "",
                "user-agent": req.headers.get("user-agent") ?? "",
            },
            redirect: "manual",
        });
        return res;
    } catch (err) {
        console.error("middleware refresh loopback failed", err);
        return null;
    }
}

function copySetCookies(from: Response, to: NextResponse) {
    for (const value of from.headers.getSetCookie()) {
        to.headers.append("set-cookie", value);
    }
}

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api/") ||
        pathname === "/favicon.ico" ||
        PUBLIC_FILE.test(pathname)
    ) {
        return NextResponse.next();
    }

    const userAgent = req.headers.get("user-agent");
    const isMobile = isMobileUserAgent(userAgent);

    if (!isMobile) {
        if (pathname === "/welcome") return NextResponse.next();
        const url = req.nextUrl.clone();
        url.pathname = "/welcome";
        return NextResponse.rewrite(url);
    }
    if (pathname === "/welcome") {
        const url = req.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
    }

    const accessToken = req.cookies.get(ACCESS_COOKIE)?.value;
    let userId: string | null = null;
    if (accessToken) {
        const payload = await verifyAccessToken(accessToken);
        if (payload) userId = payload.userId;
    }

    let refreshResponse: Response | null = null;
    if (!userId) {
        refreshResponse = await tryRefresh(req);
        if (refreshResponse?.ok) {
            const accessFromHeader = refreshResponse.headers.getSetCookie().find((c) =>
                c.startsWith(`${ACCESS_COOKIE}=`),
            );
            const newAccess = accessFromHeader?.split(";")[0]?.split("=")[1];
            if (newAccess) {
                const payload = await verifyAccessToken(newAccess);
                if (payload) userId = payload.userId;
            }
        }
    }

    const proceed = NextResponse.next();
    if (refreshResponse) copySetCookies(refreshResponse, proceed);

    if (!userId && isProtected(pathname)) {
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = "/login";
        loginUrl.searchParams.set("return", pathname + req.nextUrl.search);
        const redirect = NextResponse.redirect(loginUrl);
        if (refreshResponse) copySetCookies(refreshResponse, redirect);
        return redirect;
    }

    if (userId && (pathname === "/login" || pathname === "/register")) {
        const url = req.nextUrl.clone();
        url.pathname = "/";
        const redirect = NextResponse.redirect(url);
        if (refreshResponse) copySetCookies(refreshResponse, redirect);
        return redirect;
    }

    return proceed;
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

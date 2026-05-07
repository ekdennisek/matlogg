export const ACCESS_COOKIE = "access";
export const REFRESH_COOKIE = "refresh";

export const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;
export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;

const isProd = process.env.NODE_ENV === "production";

export const accessCookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: ACCESS_TOKEN_TTL_SECONDS,
};

export const refreshCookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: REFRESH_TOKEN_TTL_SECONDS,
};

export const clearedCookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
};

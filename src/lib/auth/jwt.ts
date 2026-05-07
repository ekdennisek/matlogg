import { jwtVerify, SignJWT } from "jose";

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;

function getSecret(): Uint8Array {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
        throw new Error("JWT_SECRET must be set and at least 32 characters");
    }
    return new TextEncoder().encode(secret);
}

export async function signAccessToken(userId: string): Promise<string> {
    return new SignJWT({ sub: userId })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
        .sign(getSecret());
}

export async function verifyAccessToken(token: string): Promise<{ userId: string } | null> {
    try {
        const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
        if (typeof payload.sub !== "string") return null;
        return { userId: payload.sub };
    } catch {
        return null;
    }
}

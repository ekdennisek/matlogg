import { createHash, randomBytes } from "node:crypto";
import sql from "sql-template-tag";
import { many, none, one, oneOrNone, tx } from "@/lib/db/queries";
import { RefreshTokenRow } from "@/lib/db/schemas";
import { REFRESH_TOKEN_TTL_SECONDS } from "./cookies";

export function generateRefreshToken(): string {
    return randomBytes(32).toString("base64url");
}

export function hashRefreshToken(rawToken: string): string {
    return createHash("sha256").update(rawToken).digest("hex");
}

export async function issueRefreshToken(userId: string, userAgent: string | null) {
    const rawToken = generateRefreshToken();
    const tokenHash = hashRefreshToken(rawToken);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);
    await one(
        sql`
            INSERT INTO refresh_tokens ("userId", "tokenHash", "expiresAt", "userAgent")
            VALUES (${userId}, ${tokenHash}, ${expiresAt}, ${userAgent})
            RETURNING *
        `,
        RefreshTokenRow,
    );
    return rawToken;
}

export async function revokeRefreshTokenByRaw(rawToken: string) {
    const tokenHash = hashRefreshToken(rawToken);
    await none(sql`
        UPDATE refresh_tokens
        SET "revokedAt" = now()
        WHERE "tokenHash" = ${tokenHash} AND "revokedAt" IS NULL
    `);
}

export async function revokeRefreshTokenById(refreshTokenId: string, userId: string) {
    return await none(sql`
        UPDATE refresh_tokens
        SET "revokedAt" = now()
        WHERE "refreshTokenId" = ${refreshTokenId}
          AND "userId" = ${userId}
          AND "revokedAt" IS NULL
    `);
}

export async function revokeAllForUser(userId: string) {
    await none(sql`
        UPDATE refresh_tokens
        SET "revokedAt" = now()
        WHERE "userId" = ${userId} AND "revokedAt" IS NULL
    `);
}

export async function listActiveSessions(userId: string) {
    return await many(
        sql`
            SELECT *
            FROM refresh_tokens
            WHERE "userId" = ${userId} AND "revokedAt" IS NULL AND "expiresAt" > now()
            ORDER BY "lastUsedAt" DESC NULLS LAST, "createdAt" DESC
        `,
        RefreshTokenRow,
    );
}

export type RotationResult =
    | { ok: true; userId: string; newRawToken: string | null }
    | { ok: false; reason: "missing" | "expired" | "reused" | "unknown" };

const REFRESH_RACE_GRACE_SECONDS = 30;

export async function rotateRefreshToken(
    rawToken: string,
    userAgent: string | null,
): Promise<RotationResult> {
    const tokenHash = hashRefreshToken(rawToken);
    return await tx(async () => {
        const existing = await oneOrNone(
            sql`SELECT * FROM refresh_tokens WHERE "tokenHash" = ${tokenHash} FOR UPDATE`,
            RefreshTokenRow,
        );
        if (!existing) return { ok: false, reason: "missing" } as const;

        if (existing.revokedAt !== null) {
            const revokedMsAgo = Date.now() - existing.revokedAt.getTime();
            if (
                revokedMsAgo <= REFRESH_RACE_GRACE_SECONDS * 1000 &&
                existing.replacedByTokenId !== null
            ) {
                const replacement = await oneOrNone(
                    sql`
                        SELECT * FROM refresh_tokens
                        WHERE "refreshTokenId" = ${existing.replacedByTokenId}
                    `,
                    RefreshTokenRow,
                );
                if (
                    replacement &&
                    replacement.revokedAt === null &&
                    replacement.expiresAt.getTime() > Date.now()
                ) {
                    return {
                        ok: true,
                        userId: existing.userId,
                        newRawToken: null,
                    } as const;
                }
            }

            await none(sql`
                UPDATE refresh_tokens
                SET "revokedAt" = now()
                WHERE "userId" = ${existing.userId} AND "revokedAt" IS NULL
            `);
            return { ok: false, reason: "reused" } as const;
        }

        if (existing.expiresAt.getTime() < Date.now()) {
            return { ok: false, reason: "expired" } as const;
        }

        const newRawToken = generateRefreshToken();
        const newHash = hashRefreshToken(newRawToken);
        const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);

        const inserted = await one(
            sql`
                INSERT INTO refresh_tokens ("userId", "tokenHash", "expiresAt", "userAgent")
                VALUES (${existing.userId}, ${newHash}, ${newExpiresAt}, ${userAgent})
                RETURNING *
            `,
            RefreshTokenRow,
        );

        await none(sql`
            UPDATE refresh_tokens
            SET "revokedAt" = now(),
                "lastUsedAt" = now(),
                "replacedByTokenId" = ${inserted.refreshTokenId}
            WHERE "refreshTokenId" = ${existing.refreshTokenId}
        `);

        return { ok: true, userId: existing.userId, newRawToken } as const;
    });
}

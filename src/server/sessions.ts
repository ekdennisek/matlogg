"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { revokeAllForUser, revokeRefreshTokenById } from "@/lib/auth/refresh";

export async function revokeSession(refreshTokenId: string) {
    const user = await requireUser();
    await revokeRefreshTokenById(refreshTokenId, user.userId);
    revalidatePath("/account");
}

export async function revokeAllSessions() {
    const user = await requireUser();
    await revokeAllForUser(user.userId);
    revalidatePath("/account");
}

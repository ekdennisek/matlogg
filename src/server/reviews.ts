"use server";

import { revalidatePath } from "next/cache";
import sql from "sql-template-tag";
import { z } from "zod";
import { many, none, oneOrNone } from "@/lib/db/queries";
import { ReviewRow } from "@/lib/db/schemas";
import { requireUser } from "@/lib/auth/session";

const UpsertSchema = z.object({
    recipeId: z.string().uuid(),
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().trim().max(2000).optional().transform((v) => (v ? v : null)),
});

export type ReviewState = {
    ok: boolean;
    formError?: string;
    fieldErrors?: Record<string, string[]>;
};

export async function upsertReview(_: ReviewState, fd: FormData): Promise<ReviewState> {
    const user = await requireUser();
    const parsed = UpsertSchema.safeParse({
        recipeId: fd.get("recipeId"),
        rating: fd.get("rating"),
        comment: fd.get("comment"),
    });
    if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };

    const recipe = await oneOrNone(
        sql`
            SELECT "userId", "isPublic", "isDraft" FROM recipes WHERE "recipeId" = ${parsed.data.recipeId}
        `,
        z.object({
            userId: z.string().uuid(),
            isPublic: z.boolean(),
            isDraft: z.boolean(),
        }),
    );
    if (!recipe || recipe.isDraft || !recipe.isPublic) {
        return { ok: false, formError: "Recipe is not available for reviews." };
    }
    if (recipe.userId === user.userId) {
        return { ok: false, formError: "You can't review your own recipe." };
    }

    await none(sql`
        INSERT INTO reviews ("recipeId", "userId", "rating", "comment")
        VALUES (${parsed.data.recipeId}, ${user.userId}, ${parsed.data.rating}, ${parsed.data.comment})
        ON CONFLICT ("recipeId", "userId")
        DO UPDATE SET "rating" = EXCLUDED."rating",
                      "comment" = EXCLUDED."comment",
                      "updatedAt" = now()
    `);
    revalidatePath(`/recipes/${parsed.data.recipeId}`);
    return { ok: true };
}

export async function deleteOwnReview(recipeId: string) {
    const user = await requireUser();
    await none(
        sql`DELETE FROM reviews WHERE "recipeId" = ${recipeId} AND "userId" = ${user.userId}`,
    );
    revalidatePath(`/recipes/${recipeId}`);
}

export type RecipeReviewWithAuthor = {
    review: ReviewRow;
    authorName: string;
};

const ReviewWithAuthor = z.object({
    reviewId: z.string().uuid(),
    recipeId: z.string().uuid(),
    userId: z.string().uuid(),
    rating: z.number().int(),
    comment: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    authorName: z.string(),
});

export async function getReviewsForRecipe(recipeId: string) {
    return await many(
        sql`
            SELECT rv.*, u."displayName" AS "authorName"
            FROM reviews rv
            JOIN users u ON u."userId" = rv."userId"
            WHERE rv."recipeId" = ${recipeId}
            ORDER BY rv."updatedAt" DESC
        `,
        ReviewWithAuthor,
    );
}

export async function getReviewSummary(recipeId: string) {
    const summary = await oneOrNone(
        sql`
            SELECT AVG("rating")::float AS "avgRating", COUNT(*)::int AS "reviewCount"
            FROM reviews
            WHERE "recipeId" = ${recipeId}
        `,
        z.object({ avgRating: z.number().nullable(), reviewCount: z.number().int() }),
    );
    return summary ?? { avgRating: null, reviewCount: 0 };
}

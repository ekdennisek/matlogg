"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import sql from "sql-template-tag";
import { z } from "zod";
import { getFormatter, getTranslations } from "next-intl/server";
import { many, none, one, oneOrNone, tx } from "@/lib/db/queries";
import { RecipeRow } from "@/lib/db/schemas";
import { getCurrentUser, requireUser } from "@/lib/auth/session";
import { parseLocaleNumber } from "@/lib/format";
import { buildZodErrorMap } from "@/i18n/zodErrors";

async function defaultDraftName(): Promise<string> {
    const t = await getTranslations("draft");
    const formatter = await getFormatter();
    const date = formatter.dateTime(new Date(), { month: "short", day: "numeric" });
    return t("defaultName", { date });
}

async function ensureOwnRecipe(recipeId: string, userId: string) {
    const row = await oneOrNone(
        sql`SELECT * FROM recipes WHERE "recipeId" = ${recipeId} AND "userId" = ${userId}`,
        RecipeRow,
    );
    if (!row) throw new Error("Recipe not found or not yours");
    return row;
}

export async function createDraft() {
    const user = await requireUser();
    const name = await defaultDraftName();
    const inserted = await one(
        sql`
            INSERT INTO recipes ("userId", "name")
            VALUES (${user.userId}, ${name})
            RETURNING *
        `,
        RecipeRow,
    );
    redirect(`/recipes/drafts/${inserted.recipeId}`);
}

export async function addScannedIngredientToDraft(recipeId: string, ingredientId: string) {
    const user = await requireUser();
    await tx(async () => {
        await ensureOwnRecipe(recipeId, user.userId);
        const positionRow = await oneOrNone(
            sql`SELECT COALESCE(MAX("position"), -1) + 1 AS "next" FROM recipe_ingredients WHERE "recipeId" = ${recipeId}`,
            z.object({ next: z.number().int() }),
        );
        const next = positionRow?.next ?? 0;
        await none(sql`
            INSERT INTO recipe_ingredients ("recipeId", "ingredientId", "position")
            VALUES (${recipeId}, ${ingredientId}, ${next})
        `);
        await none(sql`UPDATE recipes SET "updatedAt" = now() WHERE "recipeId" = ${recipeId}`);
    });
    revalidatePath(`/recipes/drafts/${recipeId}`);
}

export type FieldState = { ok: boolean; formError?: string };

export async function setIngredientGrams(_: FieldState, fd: FormData): Promise<FieldState> {
    const user = await requireUser();
    const tValidation = await getTranslations("validation");
    const tError = await getTranslations("errors.recipes");

    const SetGramsSchema = z.object({
        recipeIngredientId: z.string().uuid(),
        amountGrams: z
            .union([z.string(), z.number()])
            .transform(parseLocaleNumber)
            .refine(
                (v) => v === null || (Number.isFinite(v) && v >= 0),
                tValidation("mustBeNonNegative"),
            ),
    });

    const parsed = SetGramsSchema.safeParse(Object.fromEntries(fd), {
        errorMap: buildZodErrorMap(tValidation),
    });
    if (!parsed.success) return { ok: false, formError: tError("invalidAmount") };

    await tx(async () => {
        const row = await oneOrNone(
            sql`
                SELECT ri."recipeIngredientId", r."recipeId"
                FROM recipe_ingredients ri
                JOIN recipes r ON r."recipeId" = ri."recipeId"
                WHERE ri."recipeIngredientId" = ${parsed.data.recipeIngredientId}
                  AND r."userId" = ${user.userId}
            `,
            z.object({ recipeIngredientId: z.string().uuid(), recipeId: z.string().uuid() }),
        );
        if (!row) throw new Error("Not allowed");

        await none(sql`
            UPDATE recipe_ingredients
            SET "amountGrams" = ${parsed.data.amountGrams}
            WHERE "recipeIngredientId" = ${parsed.data.recipeIngredientId}
        `);
        await none(sql`UPDATE recipes SET "updatedAt" = now() WHERE "recipeId" = ${row.recipeId}`);
        revalidatePath(`/recipes/drafts/${row.recipeId}`);
    });
    return { ok: true };
}

export async function removeRecipeIngredient(recipeIngredientId: string) {
    const user = await requireUser();
    const row = await oneOrNone(
        sql`
            SELECT ri."recipeId"
            FROM recipe_ingredients ri
            JOIN recipes r ON r."recipeId" = ri."recipeId"
            WHERE ri."recipeIngredientId" = ${recipeIngredientId}
              AND r."userId" = ${user.userId}
        `,
        z.object({ recipeId: z.string().uuid() }),
    );
    if (!row) throw new Error("Not allowed");
    await none(
        sql`DELETE FROM recipe_ingredients WHERE "recipeIngredientId" = ${recipeIngredientId}`,
    );
    await none(sql`UPDATE recipes SET "updatedAt" = now() WHERE "recipeId" = ${row.recipeId}`);
    revalidatePath(`/recipes/drafts/${row.recipeId}`);
}

export async function renameRecipe(_: FieldState, fd: FormData): Promise<FieldState> {
    const user = await requireUser();
    const tValidation = await getTranslations("validation");
    const tError = await getTranslations("errors.recipes");

    const RenameSchema = z.object({
        recipeId: z.string().uuid(),
        name: z.string().trim().min(1).max(140),
    });

    const parsed = RenameSchema.safeParse(Object.fromEntries(fd), {
        errorMap: buildZodErrorMap(tValidation),
    });
    if (!parsed.success) return { ok: false, formError: tError("nameRequired") };
    await ensureOwnRecipe(parsed.data.recipeId, user.userId);
    await none(sql`
        UPDATE recipes
        SET "name" = ${parsed.data.name}, "updatedAt" = now()
        WHERE "recipeId" = ${parsed.data.recipeId}
    `);
    revalidatePath(`/recipes/drafts/${parsed.data.recipeId}`);
    revalidatePath(`/recipes/${parsed.data.recipeId}`);
    return { ok: true };
}

export type PublishState = {
    ok: boolean;
    formError?: string;
    fieldErrors?: Record<string, string[]>;
};

export async function publishDraft(_: PublishState, fd: FormData): Promise<PublishState> {
    const user = await requireUser();
    const tValidation = await getTranslations("validation");
    const tError = await getTranslations("errors.recipes");

    const PublishSchema = z.object({
        recipeId: z.string().uuid(),
        name: z.string().trim().min(1).max(140),
        isPublic: z.union([z.literal("on"), z.literal("true"), z.literal("")]).optional(),
    });

    const parsed = PublishSchema.safeParse(
        {
            recipeId: fd.get("recipeId"),
            name: fd.get("name"),
            isPublic: fd.get("isPublic") ?? "",
        },
        { errorMap: buildZodErrorMap(tValidation) },
    );
    if (!parsed.success) {
        return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
    }
    const isPublic = parsed.data.isPublic === "on" || parsed.data.isPublic === "true";

    await ensureOwnRecipe(parsed.data.recipeId, user.userId);
    const count = await oneOrNone(
        sql`SELECT COUNT(*)::int AS "count" FROM recipe_ingredients WHERE "recipeId" = ${parsed.data.recipeId}`,
        z.object({ count: z.number().int() }),
    );
    if (!count || count.count === 0) {
        return { ok: false, formError: tError("addOneIngredient") };
    }
    await none(sql`
        UPDATE recipes
        SET "name" = ${parsed.data.name},
            "isPublic" = ${isPublic},
            "isDraft" = FALSE,
            "updatedAt" = now()
        WHERE "recipeId" = ${parsed.data.recipeId}
    `);
    redirect(`/recipes/${parsed.data.recipeId}`);
}

export async function deleteRecipe(recipeId: string) {
    const user = await requireUser();
    await ensureOwnRecipe(recipeId, user.userId);
    await none(sql`DELETE FROM recipes WHERE "recipeId" = ${recipeId}`);
    redirect("/recipes");
}

const SearchSchema = z.object({
    q: z.string().trim().max(120).optional(),
    sort: z.enum(["recent", "rating"]).default("recent"),
});

export async function searchPublicRecipes(input: z.input<typeof SearchSchema>) {
    const parsed = SearchSchema.parse(input);
    const q = parsed.q ?? "";
    const orderBy = parsed.sort === "rating"
        ? sql`COALESCE(rv."avgRating", 0) DESC, r."updatedAt" DESC`
        : sql`r."updatedAt" DESC`;
    const where = q
        ? sql`WHERE r."isPublic" = TRUE AND r."isDraft" = FALSE AND to_tsvector('simple', r."name") @@ plainto_tsquery('simple', ${q})`
        : sql`WHERE r."isPublic" = TRUE AND r."isDraft" = FALSE`;
    return await many(
        sql`
            SELECT r."recipeId", r."name", r."updatedAt", r."userId", u."displayName" AS "authorName",
                   COALESCE(rv."avgRating", 0)::float AS "avgRating",
                   COALESCE(rv."reviewCount", 0)::int AS "reviewCount"
            FROM recipes r
            JOIN users u ON u."userId" = r."userId"
            LEFT JOIN (
                SELECT "recipeId", AVG("rating")::float AS "avgRating", COUNT(*)::int AS "reviewCount"
                FROM reviews
                GROUP BY "recipeId"
            ) rv ON rv."recipeId" = r."recipeId"
            ${where}
            ORDER BY ${orderBy}
            LIMIT 50
        `,
        z.object({
            recipeId: z.string().uuid(),
            name: z.string(),
            updatedAt: z.date(),
            userId: z.string().uuid(),
            authorName: z.string(),
            avgRating: z.number(),
            reviewCount: z.number().int(),
        }),
    );
}

export async function getMyRecipes() {
    const user = await getCurrentUser();
    if (!user) return { drafts: [], saved: [] };
    const rows = await many(
        sql`
            SELECT * FROM recipes
            WHERE "userId" = ${user.userId}
            ORDER BY "updatedAt" DESC
        `,
        RecipeRow,
    );
    return {
        drafts: rows.filter((r) => r.isDraft),
        saved: rows.filter((r) => !r.isDraft),
    };
}


"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import sql from "sql-template-tag";
import { z } from "zod";
import { many, none, one, oneOrNone } from "@/lib/db/queries";
import { CollectionRow } from "@/lib/db/schemas";
import { requireUser } from "@/lib/auth/session";

const CreateSchema = z.object({
    name: z.string().trim().min(1).max(120),
});

export type CollectionFormState = {
    ok: boolean;
    formError?: string;
    fieldErrors?: Record<string, string[]>;
};

export async function createCollection(
    _: CollectionFormState,
    fd: FormData,
): Promise<CollectionFormState> {
    const user = await requireUser();
    const parsed = CreateSchema.safeParse({ name: fd.get("name") });
    if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
    await one(
        sql`
            INSERT INTO collections ("userId", "name")
            VALUES (${user.userId}, ${parsed.data.name})
            RETURNING *
        `,
        CollectionRow,
    );
    revalidatePath("/collections");
    return { ok: true };
}

const RenameSchema = z.object({
    collectionId: z.string().uuid(),
    name: z.string().trim().min(1).max(120),
});

export async function renameCollection(
    _: CollectionFormState,
    fd: FormData,
): Promise<CollectionFormState> {
    const user = await requireUser();
    const parsed = RenameSchema.safeParse({
        collectionId: fd.get("collectionId"),
        name: fd.get("name"),
    });
    if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };

    await none(sql`
        UPDATE collections
        SET "name" = ${parsed.data.name}
        WHERE "collectionId" = ${parsed.data.collectionId}
          AND "userId" = ${user.userId}
    `);
    revalidatePath(`/collections/${parsed.data.collectionId}`);
    revalidatePath("/collections");
    return { ok: true };
}

export async function deleteCollection(collectionId: string) {
    const user = await requireUser();
    await none(sql`
        DELETE FROM collections
        WHERE "collectionId" = ${collectionId} AND "userId" = ${user.userId}
    `);
    redirect("/collections");
}

export async function addRecipeToCollection(collectionId: string, recipeId: string) {
    const user = await requireUser();
    const owns = await oneOrNone(
        sql`SELECT 1 AS "x" FROM collections WHERE "collectionId" = ${collectionId} AND "userId" = ${user.userId}`,
        z.object({ x: z.number() }),
    );
    if (!owns) throw new Error("Not your collection");

    const recipe = await oneOrNone(
        sql`SELECT "isPublic", "userId" FROM recipes WHERE "recipeId" = ${recipeId} AND "isDraft" = FALSE`,
        z.object({ isPublic: z.boolean(), userId: z.string().uuid() }),
    );
    if (!recipe) throw new Error("Recipe not found");
    if (!recipe.isPublic && recipe.userId !== user.userId) throw new Error("Cannot add another user's private recipe");

    await none(sql`
        INSERT INTO collection_recipes ("collectionId", "recipeId")
        VALUES (${collectionId}, ${recipeId})
        ON CONFLICT DO NOTHING
    `);
    revalidatePath(`/collections/${collectionId}`);
}

export async function removeRecipeFromCollection(collectionId: string, recipeId: string) {
    const user = await requireUser();
    const owns = await oneOrNone(
        sql`SELECT 1 AS "x" FROM collections WHERE "collectionId" = ${collectionId} AND "userId" = ${user.userId}`,
        z.object({ x: z.number() }),
    );
    if (!owns) throw new Error("Not your collection");

    await none(sql`
        DELETE FROM collection_recipes
        WHERE "collectionId" = ${collectionId} AND "recipeId" = ${recipeId}
    `);
    revalidatePath(`/collections/${collectionId}`);
}

export async function getMyCollections() {
    const user = await requireUser();
    return await many(
        sql`
            SELECT c.*, COALESCE(cnt."recipeCount", 0)::int AS "recipeCount"
            FROM collections c
            LEFT JOIN (
                SELECT "collectionId", COUNT(*) AS "recipeCount"
                FROM collection_recipes
                GROUP BY "collectionId"
            ) cnt ON cnt."collectionId" = c."collectionId"
            WHERE c."userId" = ${user.userId}
            ORDER BY c."createdAt" DESC
        `,
        CollectionRow.extend({ recipeCount: z.number().int() }),
    );
}

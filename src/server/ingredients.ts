"use server";

import { redirect } from "next/navigation";
import sql from "sql-template-tag";
import { z } from "zod";
import { one, oneOrNone, tx } from "@/lib/db/queries";
import { IngredientRow } from "@/lib/db/schemas";
import { getCurrentUser } from "@/lib/auth/session";
import { buildCreatedDiff, recordIngredientEvent } from "@/server/ingredientEvents";

export type IngredientLookup =
    | { found: true; ingredientId: string }
    | { found: false };

export async function lookupByBarcode(barcode: string): Promise<IngredientLookup> {
    const trimmed = barcode.trim();
    if (!trimmed) return { found: false };
    const row = await oneOrNone(
        sql`SELECT "ingredientId" FROM ingredients WHERE "barcode" = ${trimmed}`,
        z.object({ ingredientId: z.string().uuid() }),
    );
    return row ? { found: true, ingredientId: row.ingredientId } : { found: false };
}

const optionalNumber = z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((v) => {
        if (v === null || v === undefined || v === "") return null;
        const n = typeof v === "number" ? v : Number(v);
        return Number.isFinite(n) ? n : NaN;
    })
    .refine((v) => v === null || (Number.isFinite(v) && v >= 0), "Must be a non-negative number");

const CreateIngredientSchema = z.object({
    barcode: z.string().trim().min(1, "Barcode is required"),
    name: z.string().trim().min(1, "Name is required").max(200),
    energyKcal: optionalNumber,
    energyKj: optionalNumber,
    fatG: optionalNumber,
    saturatedFatG: optionalNumber,
    carbsG: optionalNumber,
    sugarsG: optionalNumber,
    proteinG: optionalNumber,
    saltG: optionalNumber,
    fiberG: optionalNumber,
});

export type CreateIngredientState = {
    ok: boolean;
    formError?: string;
    fieldErrors?: Record<string, string[]>;
};

export async function createIngredient(
    _: CreateIngredientState,
    fd: FormData,
): Promise<CreateIngredientState> {
    const user = await getCurrentUser();
    if (!user) return { ok: false, formError: "You must be logged in to add ingredients." };

    const raw = Object.fromEntries(fd);
    const parsed = CreateIngredientSchema.safeParse(raw);
    if (!parsed.success) {
        return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
    }
    const data = parsed.data;

    const result = await tx(async () => {
        const existing = await oneOrNone(
            sql`SELECT "ingredientId" FROM ingredients WHERE "barcode" = ${data.barcode}`,
            z.object({ ingredientId: z.string().uuid() }),
        );
        if (existing) {
            return { duplicate: true as const };
        }

        const inserted = await one(
            sql`
                INSERT INTO ingredients (
                    "barcode", "name",
                    "energyKcal", "energyKj",
                    "fatG", "saturatedFatG",
                    "carbsG", "sugarsG",
                    "proteinG", "saltG", "fiberG",
                    "createdByUserId"
                ) VALUES (
                    ${data.barcode}, ${data.name},
                    ${data.energyKcal}, ${data.energyKj},
                    ${data.fatG}, ${data.saturatedFatG},
                    ${data.carbsG}, ${data.sugarsG},
                    ${data.proteinG}, ${data.saltG}, ${data.fiberG},
                    ${user.userId}
                )
                RETURNING *
            `,
            IngredientRow,
        );

        await recordIngredientEvent({
            ingredientId: inserted.ingredientId,
            eventType: "created",
            actorUserId: user.userId,
            payload: buildCreatedDiff(data),
        });

        return { duplicate: false as const, inserted };
    });

    if (result.duplicate) {
        return { ok: false, formError: "This barcode is already registered." };
    }
    const inserted = result.inserted;

    const returnUrl = typeof raw.return === "string" ? raw.return : null;
    if (returnUrl && returnUrl.startsWith("/")) {
        const sep = returnUrl.includes("?") ? "&" : "?";
        redirect(`${returnUrl}${sep}createdIngredientId=${inserted.ingredientId}`);
    }
    redirect(`/ingredients/${inserted.ingredientId}`);
}

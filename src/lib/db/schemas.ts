import { z } from "zod";

export const UserRow = z.object({
    userId: z.string().uuid(),
    email: z.string(),
    passwordHash: z.string(),
    displayName: z.string(),
    createdAt: z.date(),
});
export type UserRow = z.infer<typeof UserRow>;

export const PublicUser = UserRow.pick({ userId: true, email: true, displayName: true });
export type PublicUser = z.infer<typeof PublicUser>;

export const RefreshTokenRow = z.object({
    refreshTokenId: z.string().uuid(),
    userId: z.string().uuid(),
    tokenHash: z.string(),
    expiresAt: z.date(),
    revokedAt: z.date().nullable(),
    replacedByTokenId: z.string().uuid().nullable(),
    userAgent: z.string().nullable(),
    createdAt: z.date(),
    lastUsedAt: z.date().nullable(),
});
export type RefreshTokenRow = z.infer<typeof RefreshTokenRow>;

export const IngredientRow = z.object({
    ingredientId: z.string().uuid(),
    barcode: z.string(),
    name: z.string(),
    energyKcal: z.number().nullable(),
    energyKj: z.number().nullable(),
    fatG: z.number().nullable(),
    saturatedFatG: z.number().nullable(),
    carbsG: z.number().nullable(),
    sugarsG: z.number().nullable(),
    proteinG: z.number().nullable(),
    saltG: z.number().nullable(),
    fiberG: z.number().nullable(),
    createdByUserId: z.string().uuid().nullable(),
    createdAt: z.date(),
});
export type IngredientRow = z.infer<typeof IngredientRow>;

export const MUTABLE_INGREDIENT_FIELDS = [
    "barcode",
    "name",
    "energyKcal",
    "energyKj",
    "fatG",
    "saturatedFatG",
    "carbsG",
    "sugarsG",
    "proteinG",
    "saltG",
    "fiberG",
] as const;
export type MutableIngredientField = (typeof MUTABLE_INGREDIENT_FIELDS)[number];

export const IngredientFieldValues = IngredientRow.pick({
    barcode: true,
    name: true,
    energyKcal: true,
    energyKj: true,
    fatG: true,
    saturatedFatG: true,
    carbsG: true,
    sugarsG: true,
    proteinG: true,
    saltG: true,
    fiberG: true,
});
export type IngredientFieldValues = z.infer<typeof IngredientFieldValues>;

const FieldDiff = z.object({
    before: z.union([z.string(), z.number(), z.null()]),
    after: z.union([z.string(), z.number(), z.null()]),
});
export type FieldDiff = z.infer<typeof FieldDiff>;

export const IngredientEventPayload = z.record(
    z.enum(MUTABLE_INGREDIENT_FIELDS),
    FieldDiff,
);
export type IngredientEventPayload = z.infer<typeof IngredientEventPayload>;

export const IngredientEventRow = z.object({
    ingredientEventId: z.string().uuid(),
    ingredientId: z.string().uuid(),
    eventType: z.enum(["created", "updated"]),
    actorUserId: z.string().uuid(),
    occurredAt: z.date(),
    payload: IngredientEventPayload,
});
export type IngredientEventRow = z.infer<typeof IngredientEventRow>;

export const RecipeRow = z.object({
    recipeId: z.string().uuid(),
    userId: z.string().uuid(),
    name: z.string(),
    isDraft: z.boolean(),
    isPublic: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
});
export type RecipeRow = z.infer<typeof RecipeRow>;

export const RecipeIngredientRow = z.object({
    recipeIngredientId: z.string().uuid(),
    recipeId: z.string().uuid(),
    ingredientId: z.string().uuid(),
    amountGrams: z.number().nullable(),
    position: z.number().int(),
});
export type RecipeIngredientRow = z.infer<typeof RecipeIngredientRow>;

export const CollectionRow = z.object({
    collectionId: z.string().uuid(),
    userId: z.string().uuid(),
    name: z.string(),
    createdAt: z.date(),
});
export type CollectionRow = z.infer<typeof CollectionRow>;

export const ReviewRow = z.object({
    reviewId: z.string().uuid(),
    recipeId: z.string().uuid(),
    userId: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
    comment: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});
export type ReviewRow = z.infer<typeof ReviewRow>;

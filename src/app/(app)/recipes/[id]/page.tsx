import { notFound } from "next/navigation";
import sql from "sql-template-tag";
import { z } from "zod";
import { getLocale, getTranslations } from "next-intl/server";
import { Card, Page, PageHeader, Row, Stack } from "@/components/Layout";
import { StarRating } from "@/components/StarRating";
import { Body, Caption, H3 } from "@/components/Typography";
import { many, oneOrNone } from "@/lib/db/queries";
import { RecipeRow } from "@/lib/db/schemas";
import { getCurrentUser } from "@/lib/auth/session";
import { formatDate, formatNumber, NUTRIENT_FIELDS, type NutrientKey } from "@/lib/format";
import { getReviewsForRecipe, getReviewSummary } from "@/server/reviews";
import { ReviewForm } from "./ReviewForm";
import { AddToCollectionButton } from "./AddToCollectionButton";
import { OwnerActions } from "./OwnerActions";

type Props = {
    params: Promise<{ id: string }>;
};

const RecipeIngredientView = z.object({
    recipeIngredientId: z.string().uuid(),
    ingredientId: z.string().uuid(),
    name: z.string(),
    barcode: z.string(),
    amountGrams: z.number().nullable(),
    energyKcal: z.number().nullable(),
    energyKj: z.number().nullable(),
    fatG: z.number().nullable(),
    saturatedFatG: z.number().nullable(),
    carbsG: z.number().nullable(),
    sugarsG: z.number().nullable(),
    proteinG: z.number().nullable(),
    saltG: z.number().nullable(),
    fiberG: z.number().nullable(),
    position: z.number().int(),
});
type RecipeIngredientView = z.infer<typeof RecipeIngredientView>;

function totalsFor(ingredients: RecipeIngredientView[]) {
    const totals: Record<string, number | null> = Object.fromEntries(
        NUTRIENT_FIELDS.map((f) => [f.key, null] as const),
    );
    let anyKnown = false;
    for (const ing of ingredients) {
        if (ing.amountGrams === null) continue;
        const factor = ing.amountGrams / 100;
        for (const f of NUTRIENT_FIELDS) {
            const v = ing[f.key];
            if (v === null) continue;
            totals[f.key] = (totals[f.key] ?? 0) + v * factor;
            anyKnown = true;
        }
    }
    return { totals, anyKnown };
}

export default async function RecipePage({ params }: Props) {
    const { id } = await params;
    const t = await getTranslations("recipes.detail");
    const tCommon = await getTranslations("common");
    const tNutrients = await getTranslations("nutrients");
    const locale = await getLocale();
    const me = await getCurrentUser();

    const recipe = await oneOrNone(
        sql`
            SELECT r.*, u."displayName" AS "authorName"
            FROM recipes r
            JOIN users u ON u."userId" = r."userId"
            WHERE r."recipeId" = ${id}
        `,
        RecipeRow.extend({ authorName: z.string() }),
    );
    if (!recipe || recipe.isDraft) notFound();

    const isOwner = me?.userId === recipe.userId;
    if (!recipe.isPublic && !isOwner) notFound();

    const ingredients = await many(
        sql`
            SELECT
                ri."recipeIngredientId", ri."ingredientId", ri."amountGrams", ri."position",
                i."name", i."barcode",
                i."energyKcal", i."energyKj", i."fatG", i."saturatedFatG",
                i."carbsG", i."sugarsG", i."proteinG", i."saltG", i."fiberG"
            FROM recipe_ingredients ri
            JOIN ingredients i ON i."ingredientId" = ri."ingredientId"
            WHERE ri."recipeId" = ${id}
            ORDER BY ri."position" ASC
        `,
        RecipeIngredientView,
    );

    const { totals, anyKnown } = totalsFor(ingredients);

    const reviews = recipe.isPublic ? await getReviewsForRecipe(id) : [];
    const summary = recipe.isPublic ? await getReviewSummary(id) : { avgRating: null, reviewCount: 0 };
    const myReview = me ? reviews.find((r) => r.userId === me.userId) ?? null : null;

    return (
        <Page>
            <PageHeader title={recipe.name} />
            <Caption>
                {t("authorLine", {
                    author: recipe.authorName,
                    visibility: recipe.isPublic ? tCommon("publicLabel") : tCommon("privateLabel"),
                    date: formatDate(recipe.updatedAt, locale),
                })}
            </Caption>

            {recipe.isPublic && summary.reviewCount > 0 && (
                <Row gap={2}>
                    <StarRating value={Math.round(summary.avgRating ?? 0)} />
                    <Caption>
                        {t("reviewsSummary", {
                            rating: (summary.avgRating ?? 0).toFixed(1),
                            count: summary.reviewCount,
                        })}
                    </Caption>
                </Row>
            )}

            {me && !isOwner && <AddToCollectionButton recipeId={recipe.recipeId} />}
            {isOwner && <OwnerActions recipeId={recipe.recipeId} />}

            <Card>
                <H3>{t("ingredientsHeading")}</H3>
                {ingredients.length === 0 ? (
                    <Body muted>{t("noIngredients")}</Body>
                ) : (
                    <Stack gap={2}>
                        {ingredients.map((ing) => (
                            <Row key={ing.recipeIngredientId} justify="space-between">
                                <Body>{ing.name}</Body>
                                <Body muted>
                                    {ing.amountGrams !== null ? `${ing.amountGrams} g` : "—"}
                                </Body>
                            </Row>
                        ))}
                    </Stack>
                )}
            </Card>

            {anyKnown && (
                <Card>
                    <H3>{t("totalNutrientsHeading")}</H3>
                    <Caption>{t("totalNutrientsCaption")}</Caption>
                    <Stack gap={2}>
                        {NUTRIENT_FIELDS.map((f) => (
                            <Row key={f.key} justify="space-between">
                                <Body muted>{tNutrients(f.key as NutrientKey)}</Body>
                                <Body>{formatNumber(totals[f.key], f.suffix)}</Body>
                            </Row>
                        ))}
                    </Stack>
                </Card>
            )}

            {recipe.isPublic && me && !isOwner && (
                <ReviewForm
                    recipeId={recipe.recipeId}
                    initialRating={myReview?.rating ?? 0}
                    initialComment={myReview?.comment ?? ""}
                    isEdit={Boolean(myReview)}
                />
            )}

            {recipe.isPublic && reviews.length > 0 && (
                <Stack gap={2}>
                    <H3>{t("reviewsHeading")}</H3>
                    {reviews.map((rv) => (
                        <Card key={rv.reviewId}>
                            <Row justify="space-between">
                                <Body style={{ fontWeight: 600 }}>{rv.authorName}</Body>
                                <StarRating value={rv.rating} />
                            </Row>
                            {rv.comment && <Body>{rv.comment}</Body>}
                            <Caption>{formatDate(rv.updatedAt, locale)}</Caption>
                        </Card>
                    ))}
                </Stack>
            )}
        </Page>
    );
}

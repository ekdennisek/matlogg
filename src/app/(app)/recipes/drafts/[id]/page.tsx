import { notFound, redirect } from "next/navigation";
import sql from "sql-template-tag";
import { z } from "zod";
import { getTranslations } from "next-intl/server";
import { Page, PageHeader } from "@/components/Layout";
import { many, oneOrNone } from "@/lib/db/queries";
import { RecipeRow } from "@/lib/db/schemas";
import { getCurrentUser } from "@/lib/auth/session";
import { DraftEditor } from "./DraftEditor";

type Props = {
    params: Promise<{ id: string }>;
};

const DraftIngredientRow = z.object({
    recipeIngredientId: z.string().uuid(),
    ingredientId: z.string().uuid(),
    name: z.string(),
    barcode: z.string(),
    amountGrams: z.number().nullable(),
    position: z.number().int(),
});

export default async function DraftEditorPage({ params }: Props) {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const t = await getTranslations("recipes.draft");
    const { id } = await params;

    const recipe = await oneOrNone(
        sql`SELECT * FROM recipes WHERE "recipeId" = ${id} AND "userId" = ${user.userId}`,
        RecipeRow,
    );
    if (!recipe) notFound();
    if (!recipe.isDraft) redirect(`/recipes/${recipe.recipeId}`);

    const ingredients = await many(
        sql`
            SELECT
                ri."recipeIngredientId",
                ri."ingredientId",
                ri."amountGrams",
                ri."position",
                i."name",
                i."barcode"
            FROM recipe_ingredients ri
            JOIN ingredients i ON i."ingredientId" = ri."ingredientId"
            WHERE ri."recipeId" = ${id}
            ORDER BY ri."position" ASC
        `,
        DraftIngredientRow,
    );

    return (
        <Page>
            <PageHeader title={t("pageTitle")} />
            <DraftEditor
                recipeId={recipe.recipeId}
                initialName={recipe.name}
                ingredients={ingredients}
            />
        </Page>
    );
}

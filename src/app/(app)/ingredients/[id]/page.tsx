import { notFound } from "next/navigation";
import sql from "sql-template-tag";
import { getTranslations } from "next-intl/server";
import { Card, Page, PageHeader, Row, Stack } from "@/components/Layout";
import { Body, Caption, H3 } from "@/components/Typography";
import { oneOrNone } from "@/lib/db/queries";
import { IngredientRow } from "@/lib/db/schemas";
import { formatNumber, NUTRIENT_FIELDS, type NutrientKey } from "@/lib/format";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function IngredientPage({ params }: Props) {
    const { id } = await params;
    const t = await getTranslations("ingredients.detail");
    const tNutrients = await getTranslations("nutrients");
    const ingredient = await oneOrNone(
        sql`SELECT * FROM ingredients WHERE "ingredientId" = ${id}`,
        IngredientRow,
    );
    if (!ingredient) notFound();

    return (
        <Page>
            <PageHeader title={ingredient.name} />
            <Caption>{t("barcodeLine", { barcode: ingredient.barcode })}</Caption>
            <Card>
                <H3>{t("per100g")}</H3>
                <Stack gap={2}>
                    {NUTRIENT_FIELDS.map((field) => (
                        <Row key={field.key} justify="space-between">
                            <Body muted>{tNutrients(field.key as NutrientKey)}</Body>
                            <Body>{formatNumber(ingredient[field.key], field.suffix)}</Body>
                        </Row>
                    ))}
                </Stack>
            </Card>
        </Page>
    );
}

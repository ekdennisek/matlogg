import { notFound } from "next/navigation";
import sql from "sql-template-tag";
import { z } from "zod";
import { Card, CardLink, Page, PageHeader, Row, Stack } from "@/components/Layout";
import { Body, Caption, H3 } from "@/components/Typography";
import { many, oneOrNone } from "@/lib/db/queries";
import { CollectionRow } from "@/lib/db/schemas";
import { requireUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { CollectionActions } from "./CollectionActions";
import { RecipeRowControls } from "./RecipeRowControls";

type Props = {
    params: Promise<{ id: string }>;
};

const CollectionRecipe = z.object({
    recipeId: z.string().uuid(),
    name: z.string(),
    isPublic: z.boolean(),
    updatedAt: z.date(),
    authorName: z.string(),
});

export default async function CollectionPage({ params }: Props) {
    const user = await requireUser();
    const { id } = await params;

    const collection = await oneOrNone(
        sql`SELECT * FROM collections WHERE "collectionId" = ${id} AND "userId" = ${user.userId}`,
        CollectionRow,
    );
    if (!collection) notFound();

    const recipes = await many(
        sql`
            SELECT r."recipeId", r."name", r."isPublic", r."updatedAt", u."displayName" AS "authorName"
            FROM collection_recipes cr
            JOIN recipes r ON r."recipeId" = cr."recipeId"
            JOIN users u ON u."userId" = r."userId"
            WHERE cr."collectionId" = ${id}
            ORDER BY cr."addedAt" DESC
        `,
        CollectionRecipe,
    );

    return (
        <Page>
            <PageHeader title={collection.name} />
            <CollectionActions collectionId={collection.collectionId} initialName={collection.name} />

            {recipes.length === 0 ? (
                <Card>
                    <Body muted>This collection is empty. Add recipes from a recipe page.</Body>
                </Card>
            ) : (
                <Stack gap={2}>
                    {recipes.map((r) => (
                        <Card key={r.recipeId}>
                            <Row justify="space-between" align="flex-start" gap={3}>
                                <CardLink href={`/recipes/${r.recipeId}`}>
                                    <H3>{r.name}</H3>
                                    <Caption>
                                        by {r.authorName} · {formatDate(r.updatedAt)}
                                    </Caption>
                                </CardLink>
                                <RecipeRowControls
                                    collectionId={collection.collectionId}
                                    recipeId={r.recipeId}
                                />
                            </Row>
                        </Card>
                    ))}
                </Stack>
            )}
        </Page>
    );
}

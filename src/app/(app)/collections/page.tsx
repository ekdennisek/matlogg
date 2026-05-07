import { CardLink, Page, PageHeader, Stack } from "@/components/Layout";
import { Body, Caption, H3 } from "@/components/Typography";
import { getMyCollections } from "@/server/collections";
import { NewCollectionForm } from "./NewCollectionForm";

export default async function CollectionsPage() {
    const collections = await getMyCollections();

    return (
        <Page>
            <PageHeader title="Collections" />
            <NewCollectionForm />
            {collections.length === 0 ? (
                <Body muted>You haven't created any collections yet.</Body>
            ) : (
                <Stack gap={2}>
                    {collections.map((c) => (
                        <CardLink key={c.collectionId} href={`/collections/${c.collectionId}`}>
                            <H3>{c.name}</H3>
                            <Caption>
                                {c.recipeCount} recipe{c.recipeCount === 1 ? "" : "s"}
                            </Caption>
                        </CardLink>
                    ))}
                </Stack>
            )}
        </Page>
    );
}

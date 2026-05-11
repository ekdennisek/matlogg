import { getTranslations } from "next-intl/server";
import { CardLink, Page, PageHeader, Stack } from "@/components/Layout";
import { Body, Caption, H3 } from "@/components/Typography";
import { getMyCollections } from "@/server/collections";
import { NewCollectionForm } from "./NewCollectionForm";

export default async function CollectionsPage() {
    const t = await getTranslations("collections.list");
    const collections = await getMyCollections();

    return (
        <Page>
            <PageHeader title={t("title")} />
            <NewCollectionForm />
            {collections.length === 0 ? (
                <Body muted>{t("empty")}</Body>
            ) : (
                <Stack gap={2}>
                    {collections.map((c) => (
                        <CardLink key={c.collectionId} href={`/collections/${c.collectionId}`}>
                            <H3>{c.name}</H3>
                            <Caption>{t("recipeCount", { count: c.recipeCount })}</Caption>
                        </CardLink>
                    ))}
                </Stack>
            )}
        </Page>
    );
}

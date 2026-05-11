import { getLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/Button";
import { LinkButton } from "@/components/LinkButton";
import { Card, CardLink, Page, PageHeader, Stack } from "@/components/Layout";
import { Body, Caption, H3 } from "@/components/Typography";
import { createDraft, getMyRecipes } from "@/server/recipes";
import { formatDate } from "@/lib/format";

export default async function MyRecipesPage() {
    const t = await getTranslations("recipes.list");
    const tCommon = await getTranslations("common");
    const locale = await getLocale();
    const { drafts, saved } = await getMyRecipes();

    return (
        <Page>
            <PageHeader
                title={t("title")}
                actions={
                    <form action={createDraft}>
                        <Button type="submit">{t("newRecipe")}</Button>
                    </form>
                }
            />

            <LinkButton href="/recipes/browse" variant="secondary" fullWidth>
                {t("browseLink")}
            </LinkButton>

            {drafts.length > 0 && (
                <Stack gap={2}>
                    <H3>{t("draftsHeading")}</H3>
                    <Stack gap={2}>
                        {drafts.map((d) => (
                            <CardLink key={d.recipeId} href={`/recipes/drafts/${d.recipeId}`}>
                                <H3>{d.name}</H3>
                                <Caption>
                                    {t("lastEdited", { date: formatDate(d.updatedAt, locale) })}
                                </Caption>
                            </CardLink>
                        ))}
                    </Stack>
                </Stack>
            )}

            <Stack gap={2}>
                <H3>{t("savedHeading")}</H3>
                {saved.length === 0 ? (
                    <Card>
                        <Body muted>{t("emptySaved")}</Body>
                    </Card>
                ) : (
                    <Stack gap={2}>
                        {saved.map((r) => (
                            <CardLink key={r.recipeId} href={`/recipes/${r.recipeId}`}>
                                <H3>{r.name}</H3>
                                <Caption>
                                    {t("savedMeta", {
                                        visibility: r.isPublic
                                            ? tCommon("publicLabel")
                                            : tCommon("privateLabel"),
                                        date: formatDate(r.updatedAt, locale),
                                    })}
                                </Caption>
                            </CardLink>
                        ))}
                    </Stack>
                )}
            </Stack>
        </Page>
    );
}

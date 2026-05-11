import { getTranslations } from "next-intl/server";
import { LinkButton } from "@/components/LinkButton";
import { Card, CardLink, Page, PageHeader, Stack } from "@/components/Layout";
import { Body, Caption, H3 } from "@/components/Typography";
import { getCurrentUser } from "@/lib/auth/session";

export default async function HomePage() {
    const t = await getTranslations("home");
    const user = await getCurrentUser();
    return (
        <Page>
            <PageHeader title={t("title")} />
            <Card>
                <H3>{t("scan.title")}</H3>
                <Body muted>{t("scan.body")}</Body>
                <LinkButton href="/scan" fullWidth>
                    {t("scan.cta")}
                </LinkButton>
            </Card>
            {user ? (
                <Stack gap={3}>
                    <CardLink href="/recipes">
                        <H3>{t("myRecipes.title")}</H3>
                        <Caption>{t("myRecipes.body")}</Caption>
                    </CardLink>
                    <CardLink href="/recipes/browse">
                        <H3>{t("browse.title")}</H3>
                        <Caption>{t("browse.body")}</Caption>
                    </CardLink>
                    <CardLink href="/collections">
                        <H3>{t("collections.title")}</H3>
                        <Caption>{t("collections.body")}</Caption>
                    </CardLink>
                </Stack>
            ) : (
                <Card>
                    <H3>{t("guest.title")}</H3>
                    <Body muted>{t("guest.body")}</Body>
                    <Stack gap={2}>
                        <LinkButton href="/login" fullWidth>
                            {t("guest.login")}
                        </LinkButton>
                        <LinkButton href="/register" variant="secondary" fullWidth>
                            {t("guest.register")}
                        </LinkButton>
                    </Stack>
                </Card>
            )}
        </Page>
    );
}

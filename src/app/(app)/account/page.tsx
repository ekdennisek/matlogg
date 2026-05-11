import { getLocale, getTranslations } from "next-intl/server";
import { Card, Page, PageHeader, Row, Stack } from "@/components/Layout";
import { Body, Caption, H3 } from "@/components/Typography";
import { logoutAction } from "@/lib/auth/actions";
import { requireUser } from "@/lib/auth/session";
import { listActiveSessions } from "@/lib/auth/refresh";
import { Button } from "@/components/Button";
import { formatDate } from "@/lib/format";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";
import { SessionsList } from "./SessionsList";
import { RevokeAllButton } from "./RevokeAllButton";
import { LanguageSwitcher } from "./LanguageSwitcher";

export default async function AccountPage() {
    const t = await getTranslations("account");
    const locale = await getLocale();
    const currentLocale: Locale = isLocale(locale) ? locale : defaultLocale;
    const user = await requireUser();
    const sessions = await listActiveSessions(user.userId);

    return (
        <Page>
            <PageHeader title={t("title")} />
            <Card>
                <H3>{user.displayName}</H3>
                <Caption>{user.email}</Caption>
            </Card>

            <LanguageSwitcher current={currentLocale} />

            <Row justify="space-between">
                <H3>{t("activeSessions")}</H3>
                <RevokeAllButton />
            </Row>
            {sessions.length === 0 ? (
                <Body muted>{t("noOtherSessions")}</Body>
            ) : (
                <SessionsList
                    sessions={sessions.map((s) => ({
                        refreshTokenId: s.refreshTokenId,
                        userAgent: s.userAgent,
                        createdAt: formatDate(s.createdAt, locale),
                        lastUsedAt: s.lastUsedAt ? formatDate(s.lastUsedAt, locale) : null,
                    }))}
                />
            )}

            <form action={logoutAction}>
                <Button type="submit" variant="secondary" fullWidth>
                    {t("logOut")}
                </Button>
            </form>
        </Page>
    );
}

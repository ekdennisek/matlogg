import { Card, Page, PageHeader, Row, Stack } from "@/components/Layout";
import { Body, Caption, H3 } from "@/components/Typography";
import { logoutAction } from "@/lib/auth/actions";
import { requireUser } from "@/lib/auth/session";
import { listActiveSessions } from "@/lib/auth/refresh";
import { Button } from "@/components/Button";
import { formatDate } from "@/lib/format";
import { SessionsList } from "./SessionsList";
import { RevokeAllButton } from "./RevokeAllButton";

export default async function AccountPage() {
    const user = await requireUser();
    const sessions = await listActiveSessions(user.userId);

    return (
        <Page>
            <PageHeader title="Account" />
            <Card>
                <H3>{user.displayName}</H3>
                <Caption>{user.email}</Caption>
            </Card>

            <Row justify="space-between">
                <H3>Active sessions</H3>
                <RevokeAllButton />
            </Row>
            {sessions.length === 0 ? (
                <Body muted>No other active sessions.</Body>
            ) : (
                <SessionsList
                    sessions={sessions.map((s) => ({
                        refreshTokenId: s.refreshTokenId,
                        userAgent: s.userAgent,
                        createdAt: formatDate(s.createdAt),
                        lastUsedAt: s.lastUsedAt ? formatDate(s.lastUsedAt) : null,
                    }))}
                />
            )}

            <form action={logoutAction}>
                <Button type="submit" variant="secondary" fullWidth>
                    Log out
                </Button>
            </form>
        </Page>
    );
}

"use client";

import { useTransition } from "react";
import { Button } from "@/components/Button";
import { Card, Row, Stack } from "@/components/Layout";
import { Body, Caption } from "@/components/Typography";
import { revokeSession } from "@/server/sessions";

type Session = {
    refreshTokenId: string;
    userAgent: string | null;
    createdAt: string;
    lastUsedAt: string | null;
};

type Props = {
    sessions: Session[];
};

export function SessionsList({ sessions }: Props) {
    const [pending, startTransition] = useTransition();
    return (
        <Stack gap={2}>
            {sessions.map((s) => (
                <Card key={s.refreshTokenId}>
                    <Row justify="space-between" align="flex-start" gap={3}>
                        <Stack gap={1}>
                            <Body>{s.userAgent ?? "Unknown device"}</Body>
                            <Caption>
                                Created {s.createdAt}
                                {s.lastUsedAt ? ` · last used ${s.lastUsedAt}` : ""}
                            </Caption>
                        </Stack>
                        <Button
                            variant="danger"
                            disabled={pending}
                            onClick={() =>
                                startTransition(async () => {
                                    await revokeSession(s.refreshTokenId);
                                })
                            }
                        >
                            Sign out
                        </Button>
                    </Row>
                </Card>
            ))}
        </Stack>
    );
}

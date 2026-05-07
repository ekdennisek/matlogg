"use client";

import { useTransition } from "react";
import { Button } from "@/components/Button";
import { revokeAllSessions } from "@/server/sessions";

export function RevokeAllButton() {
    const [pending, startTransition] = useTransition();
    return (
        <Button
            variant="secondary"
            disabled={pending}
            onClick={() => startTransition(() => revokeAllSessions())}
        >
            Sign out everywhere
        </Button>
    );
}

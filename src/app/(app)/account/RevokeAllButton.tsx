"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/Button";
import { revokeAllSessions } from "@/server/sessions";

export function RevokeAllButton() {
    const t = useTranslations("account");
    const [pending, startTransition] = useTransition();
    return (
        <Button
            variant="secondary"
            disabled={pending}
            onClick={() => startTransition(() => revokeAllSessions())}
        >
            {t("signOutEverywhere")}
        </Button>
    );
}

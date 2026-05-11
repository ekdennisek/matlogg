"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/Button";
import { Dialog } from "@/components/Dialog";
import { Row, Stack } from "@/components/Layout";
import { Body } from "@/components/Typography";
import { deleteRecipe } from "@/server/recipes";
import { AddToCollectionButton } from "./AddToCollectionButton";

type Props = {
    recipeId: string;
};

export function OwnerActions({ recipeId }: Props) {
    const t = useTranslations("recipes.owner");
    const tCommon = useTranslations("common");
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pending, startTransition] = useTransition();

    function handleDelete() {
        startTransition(async () => {
            await deleteRecipe(recipeId);
        });
    }

    return (
        <Row gap={2}>
            <AddToCollectionButton recipeId={recipeId} />
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>
                {t("deleteButton")}
            </Button>
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} title={t("deleteDialogTitle")}>
                <Stack gap={3}>
                    <Body>{t("deleteDialogBody")}</Body>
                    <Stack gap={2}>
                        <Button variant="danger" fullWidth onClick={handleDelete} disabled={pending}>
                            {pending ? tCommon("deleting") : t("deleteConfirm")}
                        </Button>
                        <Button
                            variant="secondary"
                            fullWidth
                            onClick={() => setConfirmOpen(false)}
                            disabled={pending}
                        >
                            {tCommon("cancel")}
                        </Button>
                    </Stack>
                </Stack>
            </Dialog>
        </Row>
    );
}

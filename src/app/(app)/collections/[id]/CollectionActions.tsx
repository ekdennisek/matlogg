"use client";

import { useActionState, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Dialog } from "@/components/Dialog";
import { Row, Stack } from "@/components/Layout";
import { Body } from "@/components/Typography";
import {
    CollectionFormState,
    deleteCollection,
    renameCollection,
} from "@/server/collections";

const initial: CollectionFormState = { ok: false };

type Props = {
    collectionId: string;
    initialName: string;
};

export function CollectionActions({ collectionId, initialName }: Props) {
    const t = useTranslations("collections.actions");
    const tCommon = useTranslations("common");
    const [renameOpen, setRenameOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [state, formAction, pending] = useActionState(renameCollection, initial);
    const [deletePending, startDelete] = useTransition();

    function handleDelete() {
        startDelete(async () => {
            await deleteCollection(collectionId);
        });
    }

    return (
        <Row gap={2}>
            <Button variant="secondary" onClick={() => setRenameOpen(true)}>
                {t("rename")}
            </Button>
            <Button variant="danger" onClick={() => setDeleteOpen(true)}>
                {t("deleteButton")}
            </Button>

            <Dialog open={renameOpen} onClose={() => setRenameOpen(false)} title={t("renameDialogTitle")}>
                <form action={formAction}>
                    <input type="hidden" name="collectionId" value={collectionId} />
                    <Stack gap={3}>
                        <Input
                            label={t("nameLabel")}
                            name="name"
                            defaultValue={initialName}
                            required
                            error={state.fieldErrors?.name?.[0]}
                        />
                        <Stack gap={2}>
                            <Button type="submit" fullWidth disabled={pending}>
                                {pending ? tCommon("saving") : tCommon("save")}
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                fullWidth
                                onClick={() => setRenameOpen(false)}
                            >
                                {tCommon("cancel")}
                            </Button>
                        </Stack>
                    </Stack>
                </form>
            </Dialog>

            <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} title={t("deleteDialogTitle")}>
                <Stack gap={3}>
                    <Body>{t("deleteDialogBody")}</Body>
                    <Stack gap={2}>
                        <Button
                            variant="danger"
                            fullWidth
                            onClick={handleDelete}
                            disabled={deletePending}
                        >
                            {deletePending ? tCommon("deleting") : t("deleteConfirm")}
                        </Button>
                        <Button
                            variant="secondary"
                            fullWidth
                            onClick={() => setDeleteOpen(false)}
                        >
                            {tCommon("cancel")}
                        </Button>
                    </Stack>
                </Stack>
            </Dialog>
        </Row>
    );
}

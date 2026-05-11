"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Dialog } from "@/components/Dialog";
import { Stack } from "@/components/Layout";
import { useSnackbar } from "@/components/Snackbar";
import { Body } from "@/components/Typography";
import { addRecipeToCollection, createCollection, getMyCollections } from "@/server/collections";

type Collection = { collectionId: string; name: string; recipeCount: number };

type Props = {
    recipeId: string;
};

export function AddToCollectionButton({ recipeId }: Props) {
    const t = useTranslations("recipes.addToCollection");
    const tCommon = useTranslations("common");
    const [open, setOpen] = useState(false);
    const [collections, setCollections] = useState<Collection[] | null>(null);
    const [newName, setNewName] = useState("");
    const [pending, startTransition] = useTransition();
    const snackbar = useSnackbar();

    useEffect(() => {
        if (!open) return;
        getMyCollections().then((rows) =>
            setCollections(
                rows.map((r) => ({
                    collectionId: r.collectionId,
                    name: r.name,
                    recipeCount: r.recipeCount,
                })),
            ),
        );
    }, [open]);

    function add(collectionId: string) {
        startTransition(async () => {
            await addRecipeToCollection(collectionId, recipeId);
            snackbar.show(t("added"));
            setOpen(false);
        });
    }

    function createAndAdd() {
        const trimmed = newName.trim();
        if (!trimmed) return;
        startTransition(async () => {
            const fd = new FormData();
            fd.set("name", trimmed);
            const result = await createCollection({ ok: false }, fd);
            if (!result.ok) {
                snackbar.show(t("createError"));
                return;
            }
            const refreshed = await getMyCollections();
            const created = refreshed.find((c) => c.name === trimmed);
            if (created) await addRecipeToCollection(created.collectionId, recipeId);
            snackbar.show(t("addedToNew"));
            setOpen(false);
        });
    }

    return (
        <>
            <Button variant="secondary" onClick={() => setOpen(true)}>
                {t("button")}
            </Button>
            <Dialog open={open} onClose={() => setOpen(false)} title={t("dialogTitle")}>
                <Stack gap={3}>
                    {collections === null ? (
                        <Body muted>{tCommon("loading")}</Body>
                    ) : collections.length === 0 ? (
                        <Body muted>{t("noCollections")}</Body>
                    ) : (
                        <Stack gap={2}>
                            {collections.map((c) => (
                                <Button
                                    key={c.collectionId}
                                    variant="secondary"
                                    fullWidth
                                    onClick={() => add(c.collectionId)}
                                    disabled={pending}
                                >
                                    {c.name} ({c.recipeCount})
                                </Button>
                            ))}
                        </Stack>
                    )}
                    <Stack gap={2}>
                        <Input
                            label={t("createLabel")}
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder={t("createPlaceholder")}
                        />
                        <Button onClick={createAndAdd} disabled={pending || !newName.trim()}>
                            {t("createAndAdd")}
                        </Button>
                    </Stack>
                </Stack>
            </Dialog>
        </>
    );
}

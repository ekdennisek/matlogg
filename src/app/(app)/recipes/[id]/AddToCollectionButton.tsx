"use client";

import { useEffect, useState, useTransition } from "react";
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
            snackbar.show("Added to collection");
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
                snackbar.show("Could not create collection");
                return;
            }
            const refreshed = await getMyCollections();
            const created = refreshed.find((c) => c.name === trimmed);
            if (created) await addRecipeToCollection(created.collectionId, recipeId);
            snackbar.show("Added to new collection");
            setOpen(false);
        });
    }

    return (
        <>
            <Button variant="secondary" onClick={() => setOpen(true)}>
                Add to collection
            </Button>
            <Dialog open={open} onClose={() => setOpen(false)} title="Add to collection">
                <Stack gap={3}>
                    {collections === null ? (
                        <Body muted>Loading…</Body>
                    ) : collections.length === 0 ? (
                        <Body muted>You don't have any collections yet.</Body>
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
                            label="Or create a new collection"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Collection name"
                        />
                        <Button onClick={createAndAdd} disabled={pending || !newName.trim()}>
                            Create and add
                        </Button>
                    </Stack>
                </Stack>
            </Dialog>
        </>
    );
}

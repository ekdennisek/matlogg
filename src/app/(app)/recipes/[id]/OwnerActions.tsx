"use client";

import { useState, useTransition } from "react";
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
                Delete
            </Button>
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Delete recipe?">
                <Stack gap={3}>
                    <Body>This permanently removes the recipe and any reviews.</Body>
                    <Stack gap={2}>
                        <Button variant="danger" fullWidth onClick={handleDelete} disabled={pending}>
                            {pending ? "Deleting…" : "Delete recipe"}
                        </Button>
                        <Button
                            variant="secondary"
                            fullWidth
                            onClick={() => setConfirmOpen(false)}
                            disabled={pending}
                        >
                            Cancel
                        </Button>
                    </Stack>
                </Stack>
            </Dialog>
        </Row>
    );
}

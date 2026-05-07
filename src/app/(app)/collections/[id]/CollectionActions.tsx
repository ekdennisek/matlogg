"use client";

import { useActionState, useState, useTransition } from "react";
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
                Rename
            </Button>
            <Button variant="danger" onClick={() => setDeleteOpen(true)}>
                Delete
            </Button>

            <Dialog open={renameOpen} onClose={() => setRenameOpen(false)} title="Rename collection">
                <form action={formAction}>
                    <input type="hidden" name="collectionId" value={collectionId} />
                    <Stack gap={3}>
                        <Input
                            label="Name"
                            name="name"
                            defaultValue={initialName}
                            required
                            error={state.fieldErrors?.name?.[0]}
                        />
                        <Stack gap={2}>
                            <Button type="submit" fullWidth disabled={pending}>
                                {pending ? "Saving…" : "Save"}
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                fullWidth
                                onClick={() => setRenameOpen(false)}
                            >
                                Cancel
                            </Button>
                        </Stack>
                    </Stack>
                </form>
            </Dialog>

            <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete collection?">
                <Stack gap={3}>
                    <Body>The recipes inside won't be deleted, just the collection itself.</Body>
                    <Stack gap={2}>
                        <Button
                            variant="danger"
                            fullWidth
                            onClick={handleDelete}
                            disabled={deletePending}
                        >
                            {deletePending ? "Deleting…" : "Delete collection"}
                        </Button>
                        <Button
                            variant="secondary"
                            fullWidth
                            onClick={() => setDeleteOpen(false)}
                        >
                            Cancel
                        </Button>
                    </Stack>
                </Stack>
            </Dialog>
        </Row>
    );
}

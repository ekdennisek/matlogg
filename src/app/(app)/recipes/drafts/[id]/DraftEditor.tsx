"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/Button";
import { Checkbox, Input } from "@/components/Input";
import { Dialog } from "@/components/Dialog";
import { Card, Stack } from "@/components/Layout";
import { useSnackbar } from "@/components/Snackbar";
import { Body, Caption, H3 } from "@/components/Typography";
import {
    publishDraft,
    PublishState,
    removeRecipeIngredient,
    renameRecipe,
    setIngredientGrams,
} from "@/server/recipes";
import { useActionState } from "react";
import styles from "./DraftEditor.module.css";

type Ingredient = {
    recipeIngredientId: string;
    ingredientId: string;
    name: string;
    barcode: string;
    amountGrams: number | null;
    position: number;
};

type Props = {
    recipeId: string;
    initialName: string;
    ingredients: Ingredient[];
};

const publishInitial: PublishState = { ok: false };

export function DraftEditor({ recipeId, initialName, ingredients }: Props) {
    const router = useRouter();
    const snackbar = useSnackbar();
    const [name, setName] = useState(initialName);
    const [pendingTransition, startTransition] = useTransition();
    const [saveOpen, setSaveOpen] = useState(false);

    const [publishState, publishAction, publishing] = useActionState(publishDraft, publishInitial);

    function commitName() {
        if (name.trim() === initialName) return;
        const fd = new FormData();
        fd.set("recipeId", recipeId);
        fd.set("name", name.trim());
        startTransition(async () => {
            const result = await renameRecipe({ ok: false }, fd);
            if (!result.ok) snackbar.show(result.formError ?? "Could not rename");
        });
    }

    function commitGrams(recipeIngredientId: string, value: string) {
        const fd = new FormData();
        fd.set("recipeIngredientId", recipeIngredientId);
        fd.set("amountGrams", value);
        startTransition(async () => {
            const result = await setIngredientGrams({ ok: false }, fd);
            if (!result.ok) snackbar.show(result.formError ?? "Could not save amount");
        });
    }

    function remove(recipeIngredientId: string) {
        startTransition(async () => {
            await removeRecipeIngredient(recipeIngredientId);
        });
    }

    return (
        <div className={styles.editor}>
            <input
                aria-label="Draft name"
                className={styles.nameInput}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={commitName}
            />

            {ingredients.length === 0 ? (
                <Card>
                    <Body muted>No ingredients yet. Tap "Scan to add" below.</Body>
                </Card>
            ) : (
                <Stack gap={2}>
                    <H3>Ingredients</H3>
                    {ingredients.map((ing) => (
                        <div key={ing.recipeIngredientId} className={styles.row}>
                            <div className={styles.rowMain}>
                                <div className={styles.rowName}>{ing.name}</div>
                                <div className={styles.rowMeta}>{ing.barcode}</div>
                            </div>
                            <input
                                aria-label={`Grams for ${ing.name}`}
                                className={styles.gramsInput}
                                type="text"
                                inputMode="decimal"
                                placeholder="g"
                                defaultValue={ing.amountGrams ?? ""}
                                onBlur={(e) => commitGrams(ing.recipeIngredientId, e.target.value)}
                            />
                            <button
                                type="button"
                                aria-label={`Remove ${ing.name}`}
                                className={styles.removeButton}
                                onClick={() => remove(ing.recipeIngredientId)}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </Stack>
            )}

            <div className={styles.stickyActions}>
                <Button
                    fullWidth
                    onClick={() =>
                        router.push(`/scan?into=${encodeURIComponent(`draft:${recipeId}`)}`)
                    }
                >
                    Scan to add
                </Button>
                <Button
                    fullWidth
                    variant="secondary"
                    onClick={() => setSaveOpen(true)}
                    disabled={ingredients.length === 0 || pendingTransition}
                >
                    Save recipe
                </Button>
            </div>

            <Dialog open={saveOpen} onClose={() => setSaveOpen(false)} title="Save recipe">
                <form action={publishAction}>
                    <input type="hidden" name="recipeId" value={recipeId} />
                    <Stack gap={4}>
                        <Input
                            label="Recipe name"
                            name="name"
                            defaultValue={name}
                            required
                            error={publishState.fieldErrors?.name?.[0]}
                        />
                        <Checkbox name="isPublic" value="on" label="Make public — anyone can find and review this recipe" />
                        {publishState.formError && <Caption error>{publishState.formError}</Caption>}
                        <Stack gap={2}>
                            <Button type="submit" fullWidth disabled={publishing}>
                                {publishing ? "Saving…" : "Save"}
                            </Button>
                            <Button type="button" variant="secondary" fullWidth onClick={() => setSaveOpen(false)}>
                                Cancel
                            </Button>
                        </Stack>
                    </Stack>
                </form>
            </Dialog>
        </div>
    );
}

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/Button";
import { Checkbox, Input } from "@/components/Input";
import { Dialog } from "@/components/Dialog";
import { Card, Stack } from "@/components/Layout";
import { useSnackbar } from "@/components/Snackbar";
import { Body, Caption, H3 } from "@/components/Typography";
import {
    deleteRecipe,
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
    const t = useTranslations("recipes.draft");
    const tCommon = useTranslations("common");
    const tErrors = useTranslations("errors.recipes");
    const router = useRouter();
    const snackbar = useSnackbar();
    const [name, setName] = useState(initialName);
    const [pendingTransition, startTransition] = useTransition();
    const [pendingDelete, startDeleteTransition] = useTransition();
    const [saveOpen, setSaveOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const [publishState, publishAction, publishing] = useActionState(publishDraft, publishInitial);

    function commitName() {
        if (name.trim() === initialName) return;
        const fd = new FormData();
        fd.set("recipeId", recipeId);
        fd.set("name", name.trim());
        startTransition(async () => {
            const result = await renameRecipe({ ok: false }, fd);
            if (!result.ok) snackbar.show(result.formError ?? tErrors("couldNotRename"));
        });
    }

    function commitGrams(recipeIngredientId: string, value: string) {
        const fd = new FormData();
        fd.set("recipeIngredientId", recipeIngredientId);
        fd.set("amountGrams", value);
        startTransition(async () => {
            const result = await setIngredientGrams({ ok: false }, fd);
            if (!result.ok) snackbar.show(result.formError ?? tErrors("couldNotSaveAmount"));
        });
    }

    function remove(recipeIngredientId: string) {
        startTransition(async () => {
            await removeRecipeIngredient(recipeIngredientId);
        });
    }

    function handleDelete() {
        startDeleteTransition(async () => {
            await deleteRecipe(recipeId);
        });
    }

    return (
        <div className={styles.editor}>
            <input
                aria-label={t("nameAriaLabel")}
                className={styles.nameInput}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={commitName}
            />

            {ingredients.length === 0 ? (
                <Card>
                    <Body muted>{t("emptyIngredients")}</Body>
                </Card>
            ) : (
                <Stack gap={2}>
                    <H3>{t("ingredientsHeading")}</H3>
                    {ingredients.map((ing) => (
                        <div key={ing.recipeIngredientId} className={styles.row}>
                            <div className={styles.rowMain}>
                                <div className={styles.rowName}>{ing.name}</div>
                                <div className={styles.rowMeta}>{ing.barcode}</div>
                            </div>
                            <input
                                aria-label={t("gramsAriaLabel", { ingredient: ing.name })}
                                className={styles.gramsInput}
                                type="text"
                                inputMode="decimal"
                                placeholder="g"
                                defaultValue={ing.amountGrams ?? ""}
                                onBlur={(e) => commitGrams(ing.recipeIngredientId, e.target.value)}
                            />
                            <button
                                type="button"
                                aria-label={t("removeAriaLabel", { ingredient: ing.name })}
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
                    {t("scanToAdd")}
                </Button>
                <Button
                    fullWidth
                    variant="secondary"
                    onClick={() => setSaveOpen(true)}
                    disabled={ingredients.length === 0 || pendingTransition}
                >
                    {t("saveRecipe")}
                </Button>
                <Button
                    fullWidth
                    variant="danger"
                    onClick={() => setDeleteOpen(true)}
                    disabled={pendingTransition || pendingDelete}
                >
                    {t("deleteButton")}
                </Button>
            </div>

            <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} title={t("deleteDialogTitle")}>
                <Stack gap={3}>
                    <Body>{t("deleteDialogBody")}</Body>
                    <Stack gap={2}>
                        <Button variant="danger" fullWidth onClick={handleDelete} disabled={pendingDelete}>
                            {pendingDelete ? tCommon("deleting") : t("deleteConfirm")}
                        </Button>
                        <Button
                            variant="secondary"
                            fullWidth
                            onClick={() => setDeleteOpen(false)}
                            disabled={pendingDelete}
                        >
                            {tCommon("cancel")}
                        </Button>
                    </Stack>
                </Stack>
            </Dialog>

            <Dialog open={saveOpen} onClose={() => setSaveOpen(false)} title={t("dialogTitle")}>
                <form action={publishAction}>
                    <input type="hidden" name="recipeId" value={recipeId} />
                    <Stack gap={4}>
                        <Input
                            label={t("nameLabel")}
                            name="name"
                            defaultValue={name}
                            required
                            error={publishState.fieldErrors?.name?.[0]}
                        />
                        <Checkbox name="isPublic" value="on" label={t("publicCheckbox")} />
                        {publishState.formError && <Caption error>{publishState.formError}</Caption>}
                        <Stack gap={2}>
                            <Button type="submit" fullWidth disabled={publishing}>
                                {publishing ? tCommon("saving") : tCommon("save")}
                            </Button>
                            <Button type="button" variant="secondary" fullWidth onClick={() => setSaveOpen(false)}>
                                {tCommon("cancel")}
                            </Button>
                        </Stack>
                    </Stack>
                </form>
            </Dialog>
        </div>
    );
}

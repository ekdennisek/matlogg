"use client";

import { useTransition } from "react";
import { removeRecipeFromCollection } from "@/server/collections";

type Props = {
    collectionId: string;
    recipeId: string;
};

export function RecipeRowControls({ collectionId, recipeId }: Props) {
    const [pending, startTransition] = useTransition();
    return (
        <button
            type="button"
            aria-label="Remove from collection"
            disabled={pending}
            onClick={() =>
                startTransition(async () => {
                    await removeRecipeFromCollection(collectionId, recipeId);
                })
            }
            style={{
                background: "transparent",
                border: "none",
                color: "var(--color-danger)",
                cursor: "pointer",
                fontSize: 18,
                width: 32,
                height: 32,
            }}
        >
            ✕
        </button>
    );
}

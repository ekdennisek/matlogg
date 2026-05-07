"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSnackbar } from "@/components/Snackbar";
import { createBarcodeReader } from "@/lib/barcode";
import { lookupByBarcode } from "@/server/ingredients";
import { addScannedIngredientToDraft } from "@/server/recipes";
import styles from "./ScannerView.module.css";

type Props = {
    into: string | null;
};

export function ScannerView({ into }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const snackbar = useSnackbar();
    const handlingRef = useRef(false);
    const lastUnknownRef = useRef<{ code: string; until: number } | null>(null);
    const SNACK_DURATION_MS = 6000;

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const reader = createBarcodeReader();
        let cancelled = false;

        (async () => {
            try {
                await reader.start(video, async (text) => {
                    if (handlingRef.current || cancelled) return;
                    handlingRef.current = true;
                    await handleScan(text);
                    handlingRef.current = false;
                });
            } catch (err) {
                console.error(err);
                setError("Could not access the camera. Check browser permissions.");
            }
        })();

        return () => {
            cancelled = true;
            reader.stop();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function handleScan(rawCode: string) {
        const code = rawCode.trim();
        const result = await lookupByBarcode(code);
        const draftId = into?.startsWith("draft:") ? into.slice("draft:".length) : null;

        if (result.found) {
            if (draftId) {
                await addScannedIngredientToDraft(draftId, result.ingredientId);
                router.push(`/recipes/drafts/${draftId}`);
            } else {
                router.push(`/ingredients/${result.ingredientId}`);
            }
            return;
        }

        const now = Date.now();
        if (
            lastUnknownRef.current &&
            lastUnknownRef.current.code === code &&
            lastUnknownRef.current.until > now
        ) {
            return;
        }
        lastUnknownRef.current = { code, until: now + SNACK_DURATION_MS };

        const newIngredientPath = draftId
            ? `/ingredients/new?barcode=${encodeURIComponent(code)}&return=${encodeURIComponent(`/recipes/drafts/${draftId}`)}`
            : `/ingredients/new?barcode=${encodeURIComponent(code)}`;

        snackbar.show("This barcode isn't in the database yet.", {
            durationMs: SNACK_DURATION_MS,
            action: {
                label: "Add it",
                onClick: () => router.push(newIngredientPath),
            },
        });
    }

    return (
        <div className={styles.scanner}>
            <video ref={videoRef} className={styles.video} playsInline muted autoPlay />
            <div className={styles.frame} />
            <div className={styles.hint}>Align the barcode inside the frame</div>
            {error && <div className={styles.error}>{error}</div>}
        </div>
    );
}

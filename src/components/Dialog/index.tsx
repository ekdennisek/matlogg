"use client";

import { ReactNode, useEffect } from "react";
import styles from "./Dialog.module.css";

type Props = {
    open: boolean;
    onClose: () => void;
    title?: ReactNode;
    children: ReactNode;
};

export function Dialog({ open, onClose, title, children }: Props) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className={styles.backdrop}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            role="dialog"
            aria-modal="true"
        >
            <div className={styles.dialog}>
                {title && <h2 className={styles.title}>{title}</h2>}
                {children}
            </div>
        </div>
    );
}

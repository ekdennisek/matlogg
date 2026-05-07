"use client";

import { useState } from "react";
import styles from "./StarRating.module.css";

type Props = {
    value: number;
    onChange?: (value: number) => void;
    name?: string;
    size?: number;
};

export function StarRating({ value, onChange, name, size }: Props) {
    const [hover, setHover] = useState<number | null>(null);
    const readonly = !onChange;
    const display = hover ?? value;

    return (
        <div
            className={[styles.rating, readonly && styles.readonly].filter(Boolean).join(" ")}
            style={size ? { fontSize: size } : undefined}
            onMouseLeave={() => setHover(null)}
        >
            {name && <input type="hidden" name={name} value={value} />}
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                    onMouseEnter={() => !readonly && setHover(n)}
                    onClick={() => onChange?.(n)}
                    disabled={readonly}
                    className={[styles.star, n <= display && styles.filled].filter(Boolean).join(" ")}
                >
                    ★
                </button>
            ))}
        </div>
    );
}

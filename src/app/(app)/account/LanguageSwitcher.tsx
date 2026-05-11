"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { setLocale } from "@/i18n/setLocale";
import { isLocale, type Locale } from "@/i18n/config";

type Props = {
    current: Locale;
};

export function LanguageSwitcher({ current }: Props) {
    const t = useTranslations("account");
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    const labelId = "language-switcher-label";

    function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const next = e.target.value;
        if (!isLocale(next) || next === current) return;
        startTransition(async () => {
            await setLocale(next);
            router.refresh();
        });
    }

    return (
        <label htmlFor={labelId} style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
            <span>{t("languageLabel")}</span>
            <select
                id={labelId}
                value={current}
                onChange={onChange}
                disabled={pending}
                style={{
                    padding: "var(--space-3)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    minHeight: 44,
                    background: "var(--color-surface, white)",
                }}
            >
                <option value="sv">{t("languageSv")}</option>
                <option value="en">{t("languageEn")}</option>
            </select>
        </label>
    );
}

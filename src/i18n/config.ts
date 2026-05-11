export const locales = ["sv", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "sv";
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: unknown): value is Locale {
    return typeof value === "string" && (locales as readonly string[]).includes(value);
}

export function pickFromAcceptLanguage(header: string | null): Locale {
    if (!header) return defaultLocale;
    const parts = header
        .split(",")
        .map((part) => {
            const [tag, ...rest] = part.trim().split(";");
            const q = rest.find((r) => r.trim().startsWith("q="));
            const quality = q ? Number(q.trim().slice(2)) : 1;
            return { tag: tag.toLowerCase(), quality: Number.isFinite(quality) ? quality : 1 };
        })
        .sort((a, b) => b.quality - a.quality);

    for (const { tag } of parts) {
        const primary = tag.split("-")[0];
        if (isLocale(primary)) return primary;
    }
    return defaultLocale;
}

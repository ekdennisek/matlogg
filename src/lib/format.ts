export function formatNumber(value: number | null | undefined, suffix = ""): string {
    if (value === null || value === undefined) return "—";
    const rounded = Math.round(value * 10) / 10;
    return `${rounded}${suffix}`;
}

export function parseLocaleNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === "") return null;
    if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
    if (typeof value !== "string") return NaN;
    const normalized = value.trim().replace(",", ".");
    if (normalized === "") return null;
    const n = Number(normalized);
    return Number.isFinite(n) ? n : NaN;
}

export function formatDate(value: Date, locale: string): string {
    return value.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
}

export type NutrientKey =
    | "energyKcal"
    | "energyKj"
    | "fatG"
    | "saturatedFatG"
    | "carbsG"
    | "sugarsG"
    | "proteinG"
    | "saltG"
    | "fiberG";

export type NutrientField = {
    key: NutrientKey;
    suffix: string;
};

export const NUTRIENT_FIELDS: NutrientField[] = [
    { key: "energyKcal", suffix: " kcal" },
    { key: "energyKj", suffix: " kJ" },
    { key: "fatG", suffix: " g" },
    { key: "saturatedFatG", suffix: " g" },
    { key: "carbsG", suffix: " g" },
    { key: "sugarsG", suffix: " g" },
    { key: "fiberG", suffix: " g" },
    { key: "proteinG", suffix: " g" },
    { key: "saltG", suffix: " g" },
];

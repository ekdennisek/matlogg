export function formatNumber(value: number | null | undefined, suffix = ""): string {
    if (value === null || value === undefined) return "—";
    const rounded = Math.round(value * 10) / 10;
    return `${rounded}${suffix}`;
}

export function formatDate(value: Date): string {
    return value.toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" });
}

export type NutrientField = {
    key:
        | "energyKcal"
        | "energyKj"
        | "fatG"
        | "saturatedFatG"
        | "carbsG"
        | "sugarsG"
        | "proteinG"
        | "saltG"
        | "fiberG";
    label: string;
    suffix: string;
};

export const NUTRIENT_FIELDS: NutrientField[] = [
    { key: "energyKcal", label: "Energy", suffix: " kcal" },
    { key: "energyKj", label: "Energy", suffix: " kJ" },
    { key: "fatG", label: "Fat", suffix: " g" },
    { key: "saturatedFatG", label: "of which saturated", suffix: " g" },
    { key: "carbsG", label: "Carbohydrates", suffix: " g" },
    { key: "sugarsG", label: "of which sugars", suffix: " g" },
    { key: "fiberG", label: "Fiber", suffix: " g" },
    { key: "proteinG", label: "Protein", suffix: " g" },
    { key: "saltG", label: "Salt", suffix: " g" },
];

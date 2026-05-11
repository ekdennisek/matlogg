"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card, Stack } from "@/components/Layout";
import { Caption, H3 } from "@/components/Typography";
import { createIngredient, CreateIngredientState } from "@/server/ingredients";
import { NUTRIENT_FIELDS, type NutrientKey } from "@/lib/format";

const initial: CreateIngredientState = { ok: false };

type Props = {
    barcode: string;
    returnUrl: string | null;
};

export function NewIngredientForm({ barcode, returnUrl }: Props) {
    const t = useTranslations("ingredients.new");
    const tNutrients = useTranslations("nutrients");
    const [state, formAction, pending] = useActionState(createIngredient, initial);

    return (
        <form action={formAction}>
            <Stack gap={4}>
                <Input label={t("barcodeLabel")} name="barcode" defaultValue={barcode} readOnly required />
                <Input
                    label={t("nameLabel")}
                    name="name"
                    required
                    placeholder={t("namePlaceholder")}
                    error={state.fieldErrors?.name?.[0]}
                />
                {returnUrl && <input type="hidden" name="return" value={returnUrl} />}

                <Card>
                    <H3>{t("nutrientsHeading")}</H3>
                    <Caption>{t("nutrientsCaption")}</Caption>
                    <Stack gap={3}>
                        {NUTRIENT_FIELDS.map((field) => (
                            <Input
                                key={field.key}
                                label={t("nutrientLabel", {
                                    label: tNutrients(field.key as NutrientKey),
                                    suffix: field.suffix,
                                })}
                                name={field.key}
                                type="text"
                                inputMode="decimal"
                                error={state.fieldErrors?.[field.key]?.[0]}
                            />
                        ))}
                    </Stack>
                </Card>

                {state.formError && <Caption error>{state.formError}</Caption>}

                <Button type="submit" fullWidth disabled={pending}>
                    {pending ? t("submitting") : t("submit")}
                </Button>
            </Stack>
        </form>
    );
}

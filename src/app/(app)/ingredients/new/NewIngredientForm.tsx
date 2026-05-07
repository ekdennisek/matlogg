"use client";

import { useActionState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card, Stack } from "@/components/Layout";
import { Caption, H3 } from "@/components/Typography";
import { createIngredient, CreateIngredientState } from "@/server/ingredients";
import { NUTRIENT_FIELDS } from "@/lib/format";

const initial: CreateIngredientState = { ok: false };

type Props = {
    barcode: string;
    returnUrl: string | null;
};

export function NewIngredientForm({ barcode, returnUrl }: Props) {
    const [state, formAction, pending] = useActionState(createIngredient, initial);

    return (
        <form action={formAction}>
            <Stack gap={4}>
                <Input label="Barcode" name="barcode" defaultValue={barcode} readOnly required />
                <Input
                    label="Product name"
                    name="name"
                    required
                    placeholder="e.g. Whole milk"
                    error={state.fieldErrors?.name?.[0]}
                />
                {returnUrl && <input type="hidden" name="return" value={returnUrl} />}

                <Card>
                    <H3>Nutrients per 100 g</H3>
                    <Caption>All fields are optional — fill in only what you know.</Caption>
                    <Stack gap={3}>
                        {NUTRIENT_FIELDS.map((field) => (
                            <Input
                                key={field.key}
                                label={`${field.label}${field.suffix}`}
                                name={field.key}
                                type="number"
                                min={0}
                                step="any"
                                inputMode="decimal"
                                error={state.fieldErrors?.[field.key]?.[0]}
                            />
                        ))}
                    </Stack>
                </Card>

                {state.formError && <Caption error>{state.formError}</Caption>}

                <Button type="submit" fullWidth disabled={pending}>
                    {pending ? "Saving…" : "Save ingredient"}
                </Button>
            </Stack>
        </form>
    );
}

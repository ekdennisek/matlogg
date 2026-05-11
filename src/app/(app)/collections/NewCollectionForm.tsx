"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Row } from "@/components/Layout";
import { createCollection, CollectionFormState } from "@/server/collections";

const initial: CollectionFormState = { ok: false };

export function NewCollectionForm() {
    const t = useTranslations("collections.new");
    const [state, formAction, pending] = useActionState(createCollection, initial);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state.ok) formRef.current?.reset();
    }, [state]);

    return (
        <form ref={formRef} action={formAction}>
            <Row gap={2} align="flex-end">
                <div style={{ flex: 1 }}>
                    <Input
                        label={t("label")}
                        name="name"
                        placeholder={t("placeholder")}
                        required
                        error={state.fieldErrors?.name?.[0]}
                    />
                </div>
                <Button type="submit" disabled={pending}>
                    {t("submit")}
                </Button>
            </Row>
        </form>
    );
}

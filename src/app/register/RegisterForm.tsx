"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Stack } from "@/components/Layout";
import { Caption } from "@/components/Typography";
import { registerAction, FormState } from "@/lib/auth/actions";

const initial: FormState = { ok: false };

export function RegisterForm() {
    const t = useTranslations("auth.register");
    const [state, formAction, pending] = useActionState(registerAction, initial);
    return (
        <form action={formAction}>
            <Stack gap={4}>
                <Input
                    label={t("displayNameLabel")}
                    name="displayName"
                    autoComplete="nickname"
                    required
                    error={state.fieldErrors?.displayName?.[0]}
                />
                <Input
                    label={t("emailLabel")}
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    error={state.fieldErrors?.email?.[0]}
                />
                <Input
                    label={t("passwordLabel")}
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    error={state.fieldErrors?.password?.[0]}
                />
                {state.formError && <Caption error>{state.formError}</Caption>}
                <Button type="submit" fullWidth disabled={pending}>
                    {pending ? t("submitting") : t("submit")}
                </Button>
            </Stack>
        </form>
    );
}

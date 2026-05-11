import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { RegisterForm } from "./RegisterForm";
import { Body, H1 } from "@/components/Typography";
import { Stack } from "@/components/Layout";
import styles from "../login/auth.module.css";

export default async function RegisterPage() {
    const t = await getTranslations("auth.register");
    return (
        <main className={styles.authPage}>
            <div className={styles.authCard}>
                <Stack gap={5}>
                    <Stack gap={2}>
                        <H1>{t("title")}</H1>
                        <Body muted>{t("subtitle")}</Body>
                    </Stack>
                    <RegisterForm />
                    <Body>
                        {t("haveAccount")} <Link href="/login">{t("loginLink")}</Link>
                    </Body>
                </Stack>
            </div>
        </main>
    );
}

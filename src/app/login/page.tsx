import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "./LoginForm";
import { Body, H1 } from "@/components/Typography";
import { Stack } from "@/components/Layout";
import styles from "./auth.module.css";

export default async function LoginPage() {
    const t = await getTranslations("auth.login");
    return (
        <main className={styles.authPage}>
            <div className={styles.authCard}>
                <Stack gap={5}>
                    <Stack gap={2}>
                        <H1>{t("title")}</H1>
                        <Body muted>{t("subtitle")}</Body>
                    </Stack>
                    <LoginForm />
                    <Body>
                        {t("newHere")} <Link href="/register">{t("createAccountLink")}</Link>
                    </Body>
                </Stack>
            </div>
        </main>
    );
}

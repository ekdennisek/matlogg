import { getTranslations } from "next-intl/server";
import { H1, Body } from "@/components/Typography";
import styles from "./welcome.module.css";

export default async function WelcomePage() {
    const t = await getTranslations("welcome");
    return (
        <main className={styles.welcome}>
            <div className={styles.card}>
                <H1>{t("title")}</H1>
                <Body muted>{t("body")}</Body>
            </div>
        </main>
    );
}

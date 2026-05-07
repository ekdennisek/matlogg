import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { Body, H1 } from "@/components/Typography";
import { Stack } from "@/components/Layout";
import styles from "./auth.module.css";

export default function LoginPage() {
    return (
        <main className={styles.authPage}>
            <div className={styles.authCard}>
                <Stack gap={5}>
                    <Stack gap={2}>
                        <H1>Welcome back</H1>
                        <Body muted>Log in to create recipes and reviews.</Body>
                    </Stack>
                    <LoginForm />
                    <Body>
                        New here? <Link href="/register">Create an account</Link>
                    </Body>
                </Stack>
            </div>
        </main>
    );
}

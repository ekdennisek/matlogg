import Link from "next/link";
import { RegisterForm } from "./RegisterForm";
import { Body, H1 } from "@/components/Typography";
import { Stack } from "@/components/Layout";
import styles from "../login/auth.module.css";

export default function RegisterPage() {
    return (
        <main className={styles.authPage}>
            <div className={styles.authCard}>
                <Stack gap={5}>
                    <Stack gap={2}>
                        <H1>Create account</H1>
                        <Body muted>Set up your account to build and share recipes.</Body>
                    </Stack>
                    <RegisterForm />
                    <Body>
                        Already have an account? <Link href="/login">Log in</Link>
                    </Body>
                </Stack>
            </div>
        </main>
    );
}

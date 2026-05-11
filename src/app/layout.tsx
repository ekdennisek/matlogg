import { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { SnackbarProvider } from "@/components/Snackbar";
import "./globals.css";

export async function generateMetadata() {
    const t = await getTranslations("metadata");
    return {
        title: t("title"),
        description: t("description"),
    };
}

export const viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
    const locale = await getLocale();
    const messages = await getMessages();
    return (
        <html lang={locale}>
            <body>
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <SnackbarProvider>{children}</SnackbarProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}

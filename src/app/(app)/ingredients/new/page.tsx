import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Page, PageHeader } from "@/components/Layout";
import { Body } from "@/components/Typography";
import { getCurrentUser } from "@/lib/auth/session";
import { NewIngredientForm } from "./NewIngredientForm";

type Props = {
    searchParams: Promise<{ barcode?: string; return?: string }>;
};

export default async function NewIngredientPage({ searchParams }: Props) {
    const user = await getCurrentUser();
    if (!user) redirect("/login?return=/ingredients/new");

    const t = await getTranslations("ingredients.new");
    const { barcode, return: returnUrl } = await searchParams;
    if (!barcode) {
        return (
            <Page>
                <PageHeader title={t("title")} />
                <Body>{t("noBarcodeBody")}</Body>
            </Page>
        );
    }

    return (
        <Page>
            <PageHeader title={t("title")} />
            <Body muted>{t("intro")}</Body>
            <NewIngredientForm barcode={barcode} returnUrl={returnUrl ?? null} />
        </Page>
    );
}

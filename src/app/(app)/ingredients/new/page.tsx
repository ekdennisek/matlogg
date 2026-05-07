import { redirect } from "next/navigation";
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

    const { barcode, return: returnUrl } = await searchParams;
    if (!barcode) {
        return (
            <Page>
                <PageHeader title="Add ingredient" />
                <Body>
                    Ingredients are created from a scan. Open the scanner and scan a barcode that
                    isn't yet in the database.
                </Body>
            </Page>
        );
    }

    return (
        <Page>
            <PageHeader title="Add ingredient" />
            <Body muted>
                Fill in the product name and any nutrients you can find on the label. All nutrient
                fields are optional.
            </Body>
            <NewIngredientForm barcode={barcode} returnUrl={returnUrl ?? null} />
        </Page>
    );
}

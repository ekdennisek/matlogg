import { Page, PageHeader } from "@/components/Layout";
import { ScannerView } from "./ScannerView";

type Props = {
    searchParams: Promise<{ into?: string }>;
};

export default async function ScanPage({ searchParams }: Props) {
    const { into } = await searchParams;
    return (
        <Page flush>
            <ScannerView into={into ?? null} />
        </Page>
    );
}

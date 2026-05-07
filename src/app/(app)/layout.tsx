import { ReactNode } from "react";
import { BottomNav } from "@/components/BottomNav";

export default function AppLayout({ children }: { children: ReactNode }) {
    return (
        <>
            {children}
            <BottomNav />
        </>
    );
}

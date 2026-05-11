"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import styles from "./BottomNav.module.css";

const tabs = [
    { href: "/", key: "home", icon: "⌂", match: (p: string) => p === "/" },
    { href: "/scan", key: "scan", icon: "▣", match: (p: string) => p.startsWith("/scan") },
    {
        href: "/recipes",
        key: "recipes",
        icon: "✎",
        match: (p: string) => p === "/recipes" || p.startsWith("/recipes/"),
    },
    {
        href: "/collections",
        key: "collections",
        icon: "☰",
        match: (p: string) => p.startsWith("/collections"),
    },
    {
        href: "/account",
        key: "account",
        icon: "◉",
        match: (p: string) => p.startsWith("/account") || p === "/login" || p === "/register",
    },
] as const;

export function BottomNav() {
    const t = useTranslations("nav");
    const pathname = usePathname();
    return (
        <nav className={styles.nav}>
            {tabs.map((tab) => {
                const active = tab.match(pathname);
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={[styles.tab, active && styles.active].filter(Boolean).join(" ")}
                    >
                        <span className={styles.icon} aria-hidden>
                            {tab.icon}
                        </span>
                        {t(tab.key)}
                    </Link>
                );
            })}
        </nav>
    );
}

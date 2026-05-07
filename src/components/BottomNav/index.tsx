"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./BottomNav.module.css";

const tabs = [
    { href: "/", label: "Home", icon: "⌂", match: (p: string) => p === "/" },
    { href: "/scan", label: "Scan", icon: "▣", match: (p: string) => p.startsWith("/scan") },
    {
        href: "/recipes",
        label: "Recipes",
        icon: "✎",
        match: (p: string) => p === "/recipes" || p.startsWith("/recipes/"),
    },
    {
        href: "/collections",
        label: "Collections",
        icon: "☰",
        match: (p: string) => p.startsWith("/collections"),
    },
    {
        href: "/account",
        label: "Account",
        icon: "◉",
        match: (p: string) => p.startsWith("/account") || p === "/login" || p === "/register",
    },
] as const;

export function BottomNav() {
    const pathname = usePathname();
    return (
        <nav className={styles.nav}>
            {tabs.map((t) => {
                const active = t.match(pathname);
                return (
                    <Link
                        key={t.href}
                        href={t.href}
                        className={[styles.tab, active && styles.active].filter(Boolean).join(" ")}
                    >
                        <span className={styles.icon} aria-hidden>
                            {t.icon}
                        </span>
                        {t.label}
                    </Link>
                );
            })}
        </nav>
    );
}

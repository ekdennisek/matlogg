import Link from "next/link";
import { CSSProperties, HTMLAttributes, ReactNode } from "react";
import styles from "./Layout.module.css";

type Spacing = 1 | 2 | 3 | 4 | 5 | 6 | 7;

const space = (n: Spacing) => `var(--space-${n})`;

type StackProps = HTMLAttributes<HTMLDivElement> & {
    gap?: Spacing;
    children: ReactNode;
};

export function Stack({ gap = 3, children, style, ...rest }: StackProps) {
    return (
        <div className={styles.stack} style={{ gap: space(gap), ...style }} {...rest}>
            {children}
        </div>
    );
}

type RowProps = HTMLAttributes<HTMLDivElement> & {
    gap?: Spacing;
    justify?: CSSProperties["justifyContent"];
    align?: CSSProperties["alignItems"];
    children: ReactNode;
};

export function Row({ gap = 3, justify, align, children, style, ...rest }: RowProps) {
    return (
        <div
            className={styles.row}
            style={{ gap: space(gap), justifyContent: justify, alignItems: align, ...style }}
            {...rest}
        >
            {children}
        </div>
    );
}

type PageProps = {
    children: ReactNode;
    flush?: boolean;
};

export function Page({ children, flush }: PageProps) {
    return <main className={flush ? styles.pageNoPad : styles.page}>{children}</main>;
}

type PageHeaderProps = {
    title: ReactNode;
    actions?: ReactNode;
};

export function PageHeader({ title, actions }: PageHeaderProps) {
    return (
        <div className={styles.pageHeader}>
            {typeof title === "string" ? <h1 style={{ margin: 0, fontSize: "var(--font-size-h1)" }}>{title}</h1> : title}
            {actions}
        </div>
    );
}

type CardProps = HTMLAttributes<HTMLDivElement> & {
    children: ReactNode;
};

export function Card({ children, className, ...rest }: CardProps) {
    return (
        <div className={[styles.card, className].filter(Boolean).join(" ")} {...rest}>
            {children}
        </div>
    );
}

type CardLinkProps = {
    href: string;
    children: ReactNode;
};

export function CardLink({ href, children }: CardLinkProps) {
    return (
        <Link href={href} className={styles.cardLink}>
            {children}
        </Link>
    );
}

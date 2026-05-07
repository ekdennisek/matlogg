import Link, { LinkProps } from "next/link";
import { ReactNode } from "react";
import styles from "./LinkButton.module.css";

type Props = LinkProps & {
    variant?: "primary" | "secondary" | "ghost";
    fullWidth?: boolean;
    className?: string;
    children: ReactNode;
};

export function LinkButton({ variant = "primary", fullWidth, className, children, ...rest }: Props) {
    const cls = [styles.linkButton, styles[variant], fullWidth && styles.fullWidth, className]
        .filter(Boolean)
        .join(" ");
    return (
        <Link className={cls} {...rest}>
            {children}
        </Link>
    );
}

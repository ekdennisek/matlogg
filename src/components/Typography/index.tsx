import { HTMLAttributes, ReactNode } from "react";
import styles from "./Typography.module.css";

type TextProps = HTMLAttributes<HTMLElement> & {
    muted?: boolean;
    error?: boolean;
    children?: ReactNode;
};

function build(base: string, { muted, error, className, ...rest }: TextProps) {
    return {
        className: [base, muted && styles.muted, error && styles.error, className]
            .filter(Boolean)
            .join(" "),
        rest,
    };
}

export function H1(props: TextProps) {
    const { className, rest } = build(styles.h1, props);
    return <h1 className={className} {...rest} />;
}
export function H2(props: TextProps) {
    const { className, rest } = build(styles.h2, props);
    return <h2 className={className} {...rest} />;
}
export function H3(props: TextProps) {
    const { className, rest } = build(styles.h3, props);
    return <h3 className={className} {...rest} />;
}
export function Body(props: TextProps) {
    const { className, rest } = build(styles.body, props);
    return <p className={className} {...rest} />;
}
export function Caption(props: TextProps) {
    const { className, rest } = build(styles.caption, props);
    return <p className={className} {...rest} />;
}

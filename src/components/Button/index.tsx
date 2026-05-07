import { ButtonHTMLAttributes, forwardRef } from "react";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    fullWidth?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
    { variant = "primary", fullWidth, className, type = "button", ...rest },
    ref,
) {
    const cls = [styles.button, styles[variant], fullWidth && styles.fullWidth, className]
        .filter(Boolean)
        .join(" ");
    return <button ref={ref} type={type} className={cls} {...rest} />;
});

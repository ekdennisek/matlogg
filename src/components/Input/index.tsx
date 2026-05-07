import {
    forwardRef,
    InputHTMLAttributes,
    ReactNode,
    TextareaHTMLAttributes,
    useId,
} from "react";
import styles from "./Input.module.css";

type FieldProps = {
    label?: ReactNode;
    error?: string;
    required?: boolean;
    children: (id: string, invalid: boolean) => ReactNode;
};

function Field({ label, error, required, children }: FieldProps) {
    const id = useId();
    const invalid = Boolean(error);
    return (
        <div className={styles.field}>
            {label && (
                <label htmlFor={id} className={[styles.label, required && styles.required].filter(Boolean).join(" ")}>
                    {label}
                </label>
            )}
            {children(id, invalid)}
            {error && <span className={styles.error}>{error}</span>}
        </div>
    );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    label?: ReactNode;
    error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
    { label, error, required, ...rest },
    ref,
) {
    return (
        <Field label={label} error={error} required={required}>
            {(id, invalid) => (
                <input
                    ref={ref}
                    id={id}
                    required={required}
                    className={[styles.input, invalid && styles.invalid].filter(Boolean).join(" ")}
                    {...rest}
                />
            )}
        </Field>
    );
});

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: ReactNode;
    error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
    { label, error, required, ...rest },
    ref,
) {
    return (
        <Field label={label} error={error} required={required}>
            {(id, invalid) => (
                <textarea
                    ref={ref}
                    id={id}
                    required={required}
                    className={[styles.textarea, invalid && styles.invalid].filter(Boolean).join(" ")}
                    {...rest}
                />
            )}
        </Field>
    );
});

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
    label: ReactNode;
};

export function Checkbox({ label, ...rest }: CheckboxProps) {
    const id = useId();
    return (
        <div className={styles.checkboxRow}>
            <input id={id} type="checkbox" className={styles.checkbox} {...rest} />
            <label htmlFor={id}>{label}</label>
        </div>
    );
}

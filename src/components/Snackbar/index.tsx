"use client";

import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import styles from "./Snackbar.module.css";

type SnackbarAction = { label: string; onClick: () => void };
type Snack = {
    id: number;
    message: string;
    action?: SnackbarAction;
    durationMs: number;
};

type ShowOptions = {
    action?: SnackbarAction;
    durationMs?: number;
};

type SnackbarContextValue = {
    show: (message: string, options?: ShowOptions) => void;
};

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

export function SnackbarProvider({ children }: { children: ReactNode }) {
    const [snacks, setSnacks] = useState<Snack[]>([]);

    const dismiss = useCallback((id: number) => {
        setSnacks((current) => current.filter((s) => s.id !== id));
    }, []);

    const show = useCallback<SnackbarContextValue["show"]>((message, options) => {
        const id = Date.now() + Math.random();
        const durationMs = options?.durationMs ?? 4000;
        setSnacks((current) => [...current, { id, message, action: options?.action, durationMs }]);
    }, []);

    useEffect(() => {
        if (snacks.length === 0) return;
        const timers = snacks.map((s) => window.setTimeout(() => dismiss(s.id), s.durationMs));
        return () => timers.forEach(window.clearTimeout);
    }, [snacks, dismiss]);

    const value = useMemo(() => ({ show }), [show]);

    return (
        <SnackbarContext.Provider value={value}>
            {children}
            <div className={styles.host}>
                {snacks.map((s) => (
                    <div key={s.id} className={styles.toast}>
                        <span className={styles.message}>{s.message}</span>
                        {s.action && (
                            <button
                                className={styles.actionButton}
                                onClick={() => {
                                    s.action?.onClick();
                                    dismiss(s.id);
                                }}
                            >
                                {s.action.label}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </SnackbarContext.Provider>
    );
}

export function useSnackbar(): SnackbarContextValue {
    const ctx = useContext(SnackbarContext);
    if (!ctx) throw new Error("useSnackbar must be used within SnackbarProvider");
    return ctx;
}

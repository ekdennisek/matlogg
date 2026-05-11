import { z, ZodErrorMap, ZodIssueCode } from "zod";

type Translator = (key: string, values?: Record<string, string | number>) => string;

export function buildZodErrorMap(t: Translator): ZodErrorMap {
    return (issue, ctx) => {
        switch (issue.code) {
            case ZodIssueCode.invalid_type:
                if (issue.received === "undefined" || issue.received === "null") {
                    return { message: t("required") };
                }
                return { message: t("invalidType") };
            case ZodIssueCode.too_small:
                if (issue.type === "string") {
                    if (issue.minimum === 1) return { message: t("required") };
                    return { message: t("tooShort", { min: Number(issue.minimum) }) };
                }
                if (issue.type === "number") {
                    return { message: t("numberTooSmall", { min: Number(issue.minimum) }) };
                }
                return { message: ctx.defaultError };
            case ZodIssueCode.too_big:
                if (issue.type === "string") {
                    return { message: t("tooLong", { max: Number(issue.maximum) }) };
                }
                if (issue.type === "number") {
                    return { message: t("numberTooBig", { max: Number(issue.maximum) }) };
                }
                return { message: ctx.defaultError };
            case ZodIssueCode.invalid_string:
                if (issue.validation === "email") return { message: t("invalidEmail") };
                if (issue.validation === "uuid") return { message: t("invalidUuid") };
                return { message: ctx.defaultError };
            case ZodIssueCode.invalid_enum_value:
                return { message: t("invalidEnum") };
            default:
                return { message: ctx.defaultError };
        }
    };
}

export function installZodErrorMap(t: Translator): void {
    z.setErrorMap(buildZodErrorMap(t));
}

import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { isLocale, LOCALE_COOKIE, pickFromAcceptLanguage, type Locale } from "./config";

export default getRequestConfig(async () => {
    const cookieStore = await cookies();
    const stored = cookieStore.get(LOCALE_COOKIE)?.value;

    let locale: Locale;
    if (isLocale(stored)) {
        locale = stored;
    } else {
        const headerList = await headers();
        locale = pickFromAcceptLanguage(headerList.get("accept-language"));
    }

    const messages = (await import(`../../messages/${locale}.json`)).default;

    return { locale, messages };
});

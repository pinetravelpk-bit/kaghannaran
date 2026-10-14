import "server-only";
import { cookies } from "next/headers";
import { DICTIONARIES, type Locale } from "./dictionaries";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return store.get("locale")?.value === "ur" ? "ur" : "en";
}

export async function getDict() {
  const locale = await getLocale();
  return { locale, t: DICTIONARIES[locale], dir: locale === "ur" ? ("rtl" as const) : ("ltr" as const) };
}

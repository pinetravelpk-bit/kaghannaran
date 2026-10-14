"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function setLocale(locale: "en" | "ur") {
  const store = await cookies();
  store.set("locale", locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  revalidatePath("/", "layout");
}

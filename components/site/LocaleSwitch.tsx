"use client";
import { useTransition } from "react";
import { setLocale } from "@/lib/i18n/actions";
import { clsx } from "clsx";

export function LocaleSwitch({ locale }: { locale: "en" | "ur" }) {
  const [pending, start] = useTransition();
  return (
    <div role="group" aria-label="Language" className={clsx("flex items-center gap-1", pending && "opacity-60")}>
      <button type="button" aria-pressed={locale === "en"} onClick={() => start(() => setLocale("en"))} className={clsx("rounded px-2 py-1", locale === "en" ? "bg-pine text-white" : "text-mist hover:text-white")}>
        English
      </button>
      <button type="button" aria-pressed={locale === "ur"} onClick={() => start(() => setLocale("ur"))} className={clsx("rounded px-2 py-1 font-urdu", locale === "ur" ? "bg-pine text-white" : "text-mist hover:text-white")} lang="ur">
        اردو
      </button>
    </div>
  );
}

"use client";
import { useState } from "react";
import { Check } from "lucide-react";

export function AlertSignup({ label, button }: { label: string; button: string }) {
  const [done, setDone] = useState(false);
  return (
    <form
      className="flex w-full max-w-md flex-wrap gap-2.5"
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true); // TODO: connect to your WhatsApp / SMS provider
      }}
    >
      <label className="flex min-w-60 flex-1 flex-col gap-1.5">
        <span className="text-[13px] text-fog">{label}</span>
        <input type="tel" required placeholder="03XX XXXXXXX" className="min-h-13 rounded-xl border border-[#3C5A55] bg-board px-4 text-ground placeholder:text-[#7F9893]" />
      </label>
      <button type="submit" className="flex min-h-13 items-center gap-2 self-end rounded-xl bg-amber px-6 font-semibold text-ink transition hover:bg-signal">
        {done ? <><Check className="size-4" aria-hidden /> Subscribed</> : button}
      </button>
    </form>
  );
}

"use client";
import { useFormStatus } from "react-dom";
import { clsx } from "clsx";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

type Opt = string | [string, string];

export function Field({ label, name, type = "text", as = "input", options, required, placeholder, defaultValue, hint }: {
  label: string; name: string; type?: string; as?: "input" | "select" | "textarea"; options?: Opt[]; required?: boolean; placeholder?: string; defaultValue?: string | number; hint?: string;
}) {
  const cls = "w-full rounded-xl border border-line-2 bg-white px-4 py-3 text-[16px] outline-none transition focus:border-ink focus:ring-4 focus:ring-signal/40";
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold">{label}{required ? <span className="text-maroon"> *</span> : null}</span>
      {as === "select" ? (
        <select name={name} required={required} defaultValue={defaultValue} className={cls}>
          {options?.map((o) => { const [v, l] = Array.isArray(o) ? o : [o, o]; return <option key={v} value={v}>{l}</option>; })}
        </select>
      ) : as === "textarea" ? (
        <textarea name={name} required={required} placeholder={placeholder} defaultValue={defaultValue} rows={5} className={cls} />
      ) : (
        <input name={name} type={type} required={required} placeholder={placeholder} defaultValue={defaultValue} className={cls} />
      )}
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function Submit({ children, className }: { children: ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className={clsx("flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-ink px-7 font-semibold text-ground transition hover:bg-maroon disabled:opacity-60", className)}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}{children}
    </button>
  );
}

export function Notice({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <div role="status" className={clsx("flex items-start gap-2 rounded-xl px-4 py-3 font-medium", ok ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-900")}>
      {ok ? <CheckCircle2 className="mt-0.5 size-5 shrink-0" /> : <AlertCircle className="mt-0.5 size-5 shrink-0" />}{children}
    </div>
  );
}

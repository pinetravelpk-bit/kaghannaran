"use client";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronLeft, ChevronRight, FileUp, ImagePlus, X, PartyPopper } from "lucide-react";
import { clsx } from "clsx";
import type { BusinessType, Listing } from "@/lib/types";
import { submitListing } from "@/lib/actions/listings";
import { Icon } from "@/components/ui/Icon";
import { Notice, Submit } from "./Field";

const input = "w-full rounded-xl border border-line-2 bg-white px-4 py-3 text-[16px] outline-none transition focus:border-ink focus:ring-4 focus:ring-signal/40";

function FilePick({ name, label, required, hint, multiple, accept, icon = "doc" }: { name: string; label: string; required?: boolean; hint?: string; multiple?: boolean; accept?: string; icon?: "doc" | "img" }) {
  const [files, setFiles] = useState<File[]>([]);
  const ref = useRef<HTMLInputElement>(null);
  const I = icon === "img" ? ImagePlus : FileUp;
  return (
    <div className={clsx("flex flex-col gap-2 rounded-2xl border-2 border-dashed p-4 transition", files.length ? "border-emerald-600 bg-emerald-50" : "border-line-2 bg-ground")}>
      <label className="flex cursor-pointer items-center gap-3">
        <span className={clsx("flex size-11 shrink-0 items-center justify-center rounded-xl", files.length ? "bg-emerald-600 text-white" : "bg-white text-pine")}>{files.length ? <Check className="size-5" /> : <I className="size-5" />}</span>
        <span className="flex flex-col">
          <span className="font-semibold">{label} {required ? <span className="text-maroon">*</span> : <span className="text-sm font-normal text-muted">(optional)</span>}</span>
          <span className="text-sm text-muted">{files.length ? files.map((f) => f.name).join(", ") : hint ?? "JPG, PNG or PDF, up to 8 MB"}</span>
        </span>
        <input ref={ref} type="file" name={name} multiple={multiple} accept={accept ?? "image/*,application/pdf"} className="sr-only" onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
      </label>
      {files.length ? (
        <button type="button" onClick={() => { if (ref.current) ref.current.value = ""; setFiles([]); }} className="flex items-center gap-1 self-start text-sm text-muted underline"><X className="size-3.5" />Remove</button>
      ) : null}
    </div>
  );
}

export function ListingForm({ types, stops, initialType, listing }: { types: BusinessType[]; stops: { slug: string; name: string }[]; initialType?: string; listing?: Listing }) {
  const [state, action] = useActionState(submitListing, null);
  const [typeSlug, setTypeSlug] = useState(listing?.type ?? initialType ?? "");
  const type = types.find((t) => t.slug === typeSlug);
  const [step, setStep] = useState(typeSlug ? 1 : 0);
  const steps = ["Type", "Basics", type?.individual ? "Your profile" : "Details", "Documents & photos", "Review"];
  const formRef = useRef<HTMLFormElement>(null);
  const [summary, setSummary] = useState<[string, string][]>([]);

  useEffect(() => { if (state?.ok) window.scrollTo({ top: 0, behavior: "smooth" }); }, [state]);

  const goto = (n: number) => {
    // validate visible required inputs before moving forward
    if (n > step && formRef.current) {
      const panel = formRef.current.querySelector<HTMLElement>(`[data-step="${step}"]`);
      const bad = panel ? Array.from(panel.querySelectorAll<HTMLInputElement>("input,select,textarea")).find((el) => !el.checkValidity()) : undefined;
      if (bad) { bad.reportValidity(); return; }
    }
    if (n === 4 && formRef.current) {
      const fd = new FormData(formRef.current);
      const rows: [string, string][] = [];
      ["name", "phone", "whatsapp", "address", "priceFrom"].forEach((k) => { const v = fd.get(k); if (v) rows.push([k, String(v)]); });
      rows.push(["stop", stops.find((s) => s.slug === fd.get("stop"))?.name ?? ""]);
      type?.fields.forEach((f) => { const v = f.type === "multiselect" ? fd.getAll(`attr_${f.key}`).join(", ") : f.type === "boolean" ? (fd.get(`attr_${f.key}`) ? "Yes" : "No") : fd.get(`attr_${f.key}`); if (v) rows.push([f.label, String(v)]); });
      type?.documents.forEach((d) => { const n = fd.getAll(`doc_${d.key}`).filter((x) => x instanceof File && x.size > 0).length; rows.push([d.label, n ? `${n} file(s)` : d.required && !listing ? "MISSING" : "—"]); });
      setSummary(rows);
    }
    setStep(n);
  };

  if (state?.ok) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-5 rounded-3xl border border-line bg-white p-10 text-center">
        <motion.span initial={{ rotate: -20, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 14 }} className="flex size-20 items-center justify-center rounded-full bg-amber"><PartyPopper className="size-9" /></motion.span>
        <h2 className="font-display text-4xl font-extrabold">{listing ? "Changes sent" : "Submitted for review"}</h2>
        <p className="max-w-md text-lg text-muted">{state.message}</p>
        <ol className="flex flex-wrap justify-center gap-2 text-sm">
          {["Submitted", "In review", "Phone check", "Live"].map((s, i) => <li key={s} className={clsx("rounded-full px-3 py-1.5 font-semibold", i === 0 ? "bg-emerald-600 text-white" : "bg-ground text-muted")}>{s}</li>)}
        </ol>
        <Link href="/dashboard" className="rounded-full bg-ink px-7 py-3.5 font-semibold text-ground">Go to my listings</Link>
      </motion.div>
    );
  }

  const a = listing?.attributes ?? {};
  return (
    <form ref={formRef} action={action} className="flex flex-col gap-6" encType="multipart/form-data">
      {listing ? <input type="hidden" name="id" value={listing.id} /> : null}
      <input type="hidden" name="type" value={typeSlug} />

      {/* progress */}
      <ol className="grid grid-cols-5 gap-2" aria-label="Progress">
        {steps.map((s, i) => (
          <li key={s} className="flex flex-col gap-2">
            <span className="h-1.5 overflow-hidden rounded-full bg-line-2"><motion.span className="block h-full bg-maroon" animate={{ width: i <= step ? "100%" : "0%" }} transition={{ duration: 0.4 }} /></span>
            <span className={clsx("hidden text-xs font-semibold sm:block", i === step ? "text-ink" : "text-muted")}>{i + 1}. {s}</span>
          </li>
        ))}
      </ol>

      {state && !state.ok ? <Notice ok={false}>{state.message}</Notice> : null}

      <div className="relative rounded-3xl border border-line bg-white p-6 md:p-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
            <h2 className="mb-5 font-display text-3xl font-extrabold">{steps[step]}</h2>
          </motion.div>
        </AnimatePresence>

        {/* All steps stay mounted (hidden) so inputs keep their values and submit together. */}
        <div data-step="0" hidden={step !== 0} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {types.filter((t) => !t.adminOnly).map((t) => (
            <button key={t.slug} type="button" disabled={!!listing} onClick={() => { setTypeSlug(t.slug); setStep(1); }} aria-pressed={typeSlug === t.slug} className={clsx("flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition rtl:text-right", typeSlug === t.slug ? "border-ink bg-ground" : "border-line hover:border-ink")}>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-pine text-signal"><Icon name={t.icon} className="size-5" /></span>
              <span><span className="block font-semibold">{t.name}</span><span className="text-sm text-muted">{t.description}</span></span>
            </button>
          ))}
        </div>

        <div data-step="1" hidden={step !== 1} className="grid gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 sm:col-span-2"><span className="text-sm font-semibold">{type?.individual ? "Your full name" : "Business name"} <span className="text-maroon">*</span></span><input name="name" required minLength={2} defaultValue={listing?.name} className={input} /></label>
          <label className="flex flex-col gap-1.5"><span className="text-sm font-semibold">Phone <span className="text-maroon">*</span></span><input name="phone" type="tel" required minLength={7} defaultValue={listing?.phone} placeholder="03XX XXXXXXX" className={input} /></label>
          <label className="flex flex-col gap-1.5"><span className="text-sm font-semibold">WhatsApp</span><input name="whatsapp" type="tel" defaultValue={listing?.whatsapp} className={input} /></label>
          <label className="flex flex-col gap-1.5"><span className="text-sm font-semibold">Nearest stop <span className="text-maroon">*</span></span>
            <select name="stop" required defaultValue={listing?.stop ?? ""} className={input}><option value="" disabled>Choose…</option>{stops.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}</select>
          </label>
          <label className="flex flex-col gap-1.5"><span className="text-sm font-semibold">{type?.individual ? "Daily rate from (PKR)" : "Price from (PKR)"}</span><input name="priceFrom" type="number" min={0} defaultValue={listing?.priceFrom} className={input} /></label>
          <label className="flex flex-col gap-1.5 sm:col-span-2"><span className="text-sm font-semibold">Address / landmark <span className="text-maroon">*</span></span><input name="address" required defaultValue={listing?.address} placeholder="e.g. Main Bazaar, near the jeep stand" className={input} /></label>
          <label className="flex flex-col gap-1.5 sm:col-span-2"><span className="text-sm font-semibold">Description <span className="text-maroon">*</span></span><textarea name="description" required minLength={20} rows={5} defaultValue={listing?.description} className={input} placeholder="What makes it worth visiting? Rooms, menu, routes, experience…" /></label>
        </div>

        <div data-step="2" hidden={step !== 2} className="grid gap-5 sm:grid-cols-2">
          {type?.fields.map((f) => {
            const v = a[f.key];
            if (f.type === "multiselect") return (
              <fieldset key={f.key} className="flex flex-col gap-2 sm:col-span-2">
                <legend className="mb-2 text-sm font-semibold">{f.label}{f.required ? <span className="text-maroon"> *</span> : null}</legend>
                <div className="flex flex-wrap gap-2">
                  {f.options?.map((o) => (
                    <label key={o} className="cursor-pointer">
                      <input type="checkbox" name={`attr_${f.key}`} value={o} defaultChecked={Array.isArray(v) && v.includes(o)} className="peer sr-only" />
                      <span className="block rounded-full border border-line-2 px-4 py-2 text-sm font-medium transition peer-checked:border-ink peer-checked:bg-ink peer-checked:text-ground peer-focus-visible:ring-4 peer-focus-visible:ring-signal">{o}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            );
            if (f.type === "boolean") return (
              <label key={f.key} className="flex items-center gap-3 rounded-xl bg-ground px-4 py-3"><input type="checkbox" name={`attr_${f.key}`} defaultChecked={v === true} className="size-5 accent-maroon" /><span className="font-semibold">{f.label}</span></label>
            );
            if (f.type === "select") return (
              <label key={f.key} className="flex flex-col gap-1.5"><span className="text-sm font-semibold">{f.label}{f.required ? <span className="text-maroon"> *</span> : null}</span>
                <select name={`attr_${f.key}`} required={f.required} defaultValue={typeof v === "string" ? v : ""} className={input}><option value="">Choose…</option>{f.options?.map((o) => <option key={o}>{o}</option>)}</select>
              </label>
            );
            return (
              <label key={f.key} className={clsx("flex flex-col gap-1.5", f.type === "textarea" && "sm:col-span-2")}><span className="text-sm font-semibold">{f.label}{f.required ? <span className="text-maroon"> *</span> : null}</span>
                {f.type === "textarea" ? <textarea name={`attr_${f.key}`} required={f.required} defaultValue={v as string} className={input} /> : <input name={`attr_${f.key}`} type={f.type === "number" ? "number" : "text"} min={0} required={f.required} placeholder={f.placeholder} defaultValue={v as string | number | undefined} className={input} />}
              </label>
            );
          })}
        </div>

        <div data-step="3" hidden={step !== 3} className="flex flex-col gap-3">
          <p className="text-muted">Documents are private: only you and our moderators can see them. They’re used only to verify your listing.</p>
          {type?.documents.map((d) => <FilePick key={d.key} name={`doc_${d.key}`} label={d.label} required={d.required && !listing} hint={d.hint} multiple={d.key.includes("photo")} />)}
          <FilePick name="photos" label="Public photos for your listing" hint="Shown on the site. The first photo is the cover. Up to 12." multiple accept="image/*" icon="img" />
        </div>

        <div data-step="4" hidden={step !== 4} className="flex flex-col gap-4">
          <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
            <div className="flex justify-between gap-3 border-b border-line py-2"><dt className="text-muted">Type</dt><dd className="font-semibold">{type?.name}</dd></div>
            {summary.map(([k, v]) => <div key={k} className="flex justify-between gap-3 border-b border-line py-2"><dt className="text-muted capitalize">{k}</dt><dd className={clsx("text-right font-semibold", v === "MISSING" && "text-maroon")}>{v}</dd></div>)}
          </dl>
          <label className="flex items-start gap-3 rounded-xl bg-ground p-4"><input type="checkbox" required className="mt-1 size-5 accent-maroon" /><span>I confirm the details are true and I’m allowed to list this {type?.individual ? "profile" : "business"}. I agree that Kaghan Naran may call me to verify it.</span></label>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => goto(Math.max(0, step - 1))} disabled={step === 0 || (step === 1 && !!listing)} className="flex min-h-13 items-center gap-2 rounded-2xl border border-line-2 bg-white px-6 font-semibold disabled:opacity-40"><ChevronLeft className="size-4 rtl:rotate-180" />Back</button>
        {step < 4 ? (
          <button type="button" disabled={!type} onClick={() => goto(step + 1)} className="flex min-h-13 items-center gap-2 rounded-2xl bg-ink px-7 font-semibold text-ground disabled:opacity-40">Next<ChevronRight className="size-4 rtl:rotate-180" /></button>
        ) : (
          <Submit>{listing ? "Send changes for review" : "Submit for review"}</Submit>
        )}
      </div>
    </form>
  );
}

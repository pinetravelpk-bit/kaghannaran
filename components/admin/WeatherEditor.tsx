"use client";
import { useState, useTransition } from "react";
import { clsx } from "clsx";
import { Plus, Trash2, Save, CloudSun, Home } from "lucide-react";
import type { WeatherArea } from "@/lib/types";
import { saveWeatherArea, deleteWeatherArea } from "@/lib/actions/admin";
import { useToast } from "./Toast";

export type LiveView = { temp?: number; label: string };

const LEVELS = [
  { v: "info", l: "Info", c: "bg-sage text-ink" },
  { v: "warning", l: "Warning", c: "bg-amber text-ink" },
  { v: "danger", l: "Danger", c: "bg-maroon text-white" },
] as const;
const KEEP = [{ v: "6", l: "6 hours" }, { v: "24", l: "24 hours" }, { v: "72", l: "3 days" }, { v: "", l: "Until I clear it" }];
const field = "rounded-xl border border-line-2 px-3 py-2.5 font-normal";
const num = (v: string) => (v.trim() === "" ? undefined : Number(v));
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const active = (a: WeatherArea) => (a.overrideLabel || a.overrideTemp !== undefined) && (!a.overrideUntil || new Date(a.overrideUntil).getTime() > Date.now());

export function WeatherEditor({ initial, live }: { initial: WeatherArea[]; live: Record<string, LiveView> }) {
  const [rows, setRows] = useState(initial.map((a) => ({ ...a, key: a.slug, saved: a.slug as string | undefined })));
  const [keep, setKeep] = useState<Record<string, string>>({});
  const [, start] = useTransition();
  const toast = useToast();
  type Row = (typeof rows)[number];
  const set = (i: number, p: Partial<Row>) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...p } : x)));

  const save = (i: number, clearOverride = false) => start(async () => {
    const { key: _k, saved, ...a } = rows[i];
    const slug = a.slug || slugify(a.name);
    if (!slug || !a.name.trim()) return toast({ ok: false, message: "Give the area a name first." });
    const hasOverride = !clearOverride && (a.overrideLabel || a.overrideTemp !== undefined);
    const hours = keep[rows[i].key] ?? "24";
    const area: WeatherArea = {
      ...a, slug, sort: i,
      overrideLabel: hasOverride ? a.overrideLabel : undefined,
      overrideTemp: hasOverride ? a.overrideTemp : undefined,
      overrideUntil: hasOverride ? (hours ? new Date(Date.now() + Number(hours) * 3600_000).toISOString() : undefined) : undefined,
    };
    const res = await saveWeatherArea(area, saved);
    toast(res);
    if (res.ok) set(i, { ...area, saved: slug });
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 lg:grid-cols-2">
        {rows.map((a, i) => {
          const l = a.saved ? live[a.saved] : undefined;
          return (
            <div key={a.key} className="flex flex-col gap-4 rounded-3xl border border-line bg-white p-5">
              <div className="flex flex-wrap items-end gap-3">
                <label className="flex min-w-40 flex-1 flex-col gap-1 text-sm font-semibold">Area name<input value={a.name} onChange={(e) => set(i, { name: e.target.value, ...(a.saved ? {} : { slug: slugify(e.target.value) }) })} className={field} /></label>
                <button type="button" aria-pressed={a.onHome} onClick={() => set(i, { onHome: !a.onHome })} className={clsx("flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold", a.onHome ? "bg-ink text-ground" : "bg-ground text-ink-2")}>
                  <Home className="size-4" aria-hidden />{a.onHome ? "On home page" : "Show on home"}
                </button>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-board px-4 py-3 font-mono text-ground">
                <CloudSun className="size-5 shrink-0 text-signal" aria-hidden />
                <span className="flex flex-col">
                  <span className="text-[11px] tracking-widest text-[#7F9893]">LIVE FORECAST{active(a) ? " (OVERRIDDEN)" : ""}</span>
                  <span className="text-sm">{l ? `${l.temp !== undefined ? `${Math.round(l.temp)}° · ` : ""}${l.label}` : "Save the area to load its forecast."}</span>
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold">Advisory for travellers</span>
                <textarea value={a.advisory} onChange={(e) => set(i, { advisory: e.target.value })} rows={2} placeholder="e.g. Heavy snowfall expected tonight. Carry chains above Naran." className={field} />
                <div role="radiogroup" aria-label="Advisory level" className="flex gap-1.5">
                  {LEVELS.map((x) => (
                    <button key={x.v} type="button" role="radio" aria-checked={a.advisoryLevel === x.v} onClick={() => set(i, { advisoryLevel: x.v })} className={clsx("min-h-9 rounded-full px-4 text-sm font-semibold", a.advisoryLevel === x.v ? x.c : "bg-ground text-ink-2")}>{x.l}</button>
                  ))}
                </div>
              </div>

              <fieldset className="flex flex-col gap-2 rounded-2xl border border-dashed border-line-2 p-4">
                <legend className="px-1 text-sm font-semibold">Override conditions <span className="font-normal text-muted">(optional, from a local report)</span></legend>
                <div className="grid gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1.3fr)]">
                  <input value={a.overrideLabel ?? ""} onChange={(e) => set(i, { overrideLabel: e.target.value || undefined })} placeholder="e.g. Snowing" aria-label="Conditions" className={field} />
                  <input inputMode="decimal" value={a.overrideTemp ?? ""} onChange={(e) => set(i, { overrideTemp: num(e.target.value) })} placeholder="°C" aria-label="Temperature in °C" className={field} />
                  <select value={keep[a.key] ?? "24"} onChange={(e) => setKeep((k) => ({ ...k, [a.key]: e.target.value }))} aria-label="Keep override for" className={field}>
                    {KEEP.map((k) => <option key={k.v} value={k.v}>{k.l}</option>)}
                  </select>
                </div>
                {active(a) ? <button type="button" onClick={() => save(i, true)} className="self-start text-sm font-semibold text-maroon underline">Clear override and use live forecast</button> : null}
              </fieldset>

              <details className="rounded-2xl bg-ground px-4 py-3 text-sm">
                <summary className="cursor-pointer font-semibold">Location</summary>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <label className="flex flex-col gap-1 font-semibold">Latitude<input inputMode="decimal" value={a.lat} onChange={(e) => set(i, { lat: num(e.target.value) ?? 0 })} className={clsx(field, "bg-white")} /></label>
                  <label className="flex flex-col gap-1 font-semibold">Longitude<input inputMode="decimal" value={a.lon} onChange={(e) => set(i, { lon: num(e.target.value) ?? 0 })} className={clsx(field, "bg-white")} /></label>
                  <label className="flex flex-col gap-1 font-semibold">Altitude (m)<input inputMode="numeric" value={a.alt} onChange={(e) => set(i, { alt: num(e.target.value) ?? 0 })} className={clsx(field, "bg-white")} /></label>
                </div>
              </details>

              <div className="flex justify-end gap-2">
                <button aria-label={`Remove ${a.name}`} onClick={() => start(async () => { if (a.saved) { const res = await deleteWeatherArea(a.saved); toast(res); if (!res.ok) return; } setRows((x) => x.filter((_, j) => j !== i)); })} className="flex size-10 items-center justify-center rounded-full text-maroon hover:bg-red-50"><Trash2 className="size-4" /></button>
                <button onClick={() => save(i)} className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-ground"><Save className="size-4" />Save</button>
              </div>
            </div>
          );
        })}
      </div>
      <button onClick={() => setRows((r) => [...r, { key: `new-${Date.now()}`, saved: undefined, slug: "", name: "", lat: 34.909, lon: 73.651, alt: 0, sort: r.length, onHome: false, advisory: "", advisoryLevel: "info" }])} className="flex items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-line-2 p-5 font-semibold text-muted hover:border-ink hover:text-ink"><Plus className="size-4" />Add area</button>
    </div>
  );
}

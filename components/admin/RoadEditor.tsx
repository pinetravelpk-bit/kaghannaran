"use client";
import { useState, useTransition } from "react";
import { clsx } from "clsx";
import { Plus, Trash2, Send, Radio, Hand, MapPin } from "lucide-react";
import type { RoadSegment, RoadStatus } from "@/lib/types";
import { saveRoadSegment, deleteRoadSegment } from "@/lib/actions/admin";
import { RoadBadge } from "@/components/ui/StatusBadge";
import { useToast } from "./Toast";

const STATUSES: { v: RoadStatus; l: string; c: string }[] = [
  { v: "open", l: "Open", c: "bg-emerald-700 text-white" },
  { v: "caution", l: "Caution", c: "bg-amber text-ink" },
  { v: "seasonal", l: "Seasonal", c: "bg-[#F2B48A] text-ink" },
  { v: "closed", l: "Closed", c: "bg-maroon text-white" },
];
const KEEP = [{ v: "6", l: "6 hours" }, { v: "24", l: "24 hours" }, { v: "72", l: "3 days" }, { v: "", l: "Until I switch back" }];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** The automatic reading for a segment, computed on the server. */
export type AutoView = { status: RoadStatus; note: string } | null;

const field = "rounded-xl border border-line-2 px-3 py-2.5 font-normal";
const num = (v: string) => (v.trim() === "" ? undefined : Number(v));
const until = (iso?: string) => (iso ? new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Karachi" }) : "");

export function RoadEditor({ initial, auto, google }: { initial: RoadSegment[]; auto: Record<string, AutoView>; google: boolean }) {
  const [rows, setRows] = useState(initial);
  const [keep, setKeep] = useState<Record<string, string>>({});
  const [, start] = useTransition();
  const toast = useToast();
  const set = (i: number, p: Partial<RoadSegment>) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...p } : x)));
  const publish = (i: number) => start(async () => {
    const r = rows[i];
    const hours = keep[r.id] ?? "24";
    const manualUntil = r.mode === "manual" && hours ? new Date(Date.now() + Number(hours) * 3600_000).toISOString() : undefined;
    const { id, updatedAt: _u, ...rest } = r;
    const res = await saveRoadSegment({ ...rest, id: id.startsWith("new-") ? undefined : id, manualUntil, sort: i });
    toast(res);
    if (res.ok) set(i, { updatedAt: new Date().toISOString(), id: res.id ?? r.id, manualUntil });
  });
  const shown = (r: RoadSegment) => (r.mode === "auto" && auto[r.id] ? auto[r.id]! : { status: r.status, note: r.note });

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-3">
        <p className={clsx("rounded-2xl px-4 py-3 text-sm", google ? "bg-emerald-50 text-emerald-900" : "bg-amber/20 text-ink")}>
          {google
            ? "Google Maps is connected. Automatic segments are checked every hour for live traffic and detours, plus weather and season."
            : "Google Maps is not connected, so automatic segments use only the weather forecast and the pass season. Add GOOGLE_MAPS_API_KEY on the server to include live traffic and detours."}
        </p>
        {rows.map((r, i) => {
          const a = auto[r.id];
          return (
            <div key={r.id} className="flex flex-col gap-4 rounded-3xl border border-line bg-white p-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <label className="flex min-w-60 flex-1 flex-col gap-1 text-sm font-semibold">Segment<input value={r.segment} onChange={(e) => set(i, { segment: e.target.value })} className={field} /></label>
                <div role="radiogroup" aria-label="Mode" className="flex rounded-full bg-ground p-1">
                  {([["auto", "Automatic", Radio], ["manual", "Manual override", Hand]] as const).map(([v, l, I]) => (
                    <button key={v} role="radio" aria-checked={r.mode === v} onClick={() => set(i, { mode: v })} className={clsx("flex min-h-9 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition", r.mode === v ? "bg-ink text-ground" : "text-ink-2")}>
                      <I className="size-4" aria-hidden />{l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-board px-4 py-3 font-mono text-ground">
                <Radio className="mt-0.5 size-4 shrink-0 text-signal" aria-hidden />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-[11px] tracking-widest text-[#7F9893]">LIVE CHECK {r.mode === "manual" ? "(IGNORED WHILE MANUAL)" : ""}</span>
                  <span className="text-sm">{a ? a.note : r.from && r.to ? "No live data right now. Showing your manual status." : "Add map points below to enable live checks."}</span>
                </span>
                {a ? <RoadBadge status={a.status} /> : null}
              </div>

              {r.mode === "manual" ? (
                <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-line-2 p-4">
                  <div role="radiogroup" aria-label="Status" className="flex flex-wrap gap-1.5">
                    {STATUSES.map((s) => (
                      <button key={s.v} role="radio" aria-checked={r.status === s.v} onClick={() => set(i, { status: s.v })} className={clsx("min-h-10 rounded-full px-4 text-sm font-semibold transition", r.status === s.v ? s.c : "bg-ground text-ink-2 hover:bg-sage")}>{s.l}</button>
                    ))}
                  </div>
                  <label className="flex flex-col gap-1 text-sm font-semibold">Note for travellers<input value={r.note} onChange={(e) => set(i, { note: e.target.value })} placeholder="e.g. Landslide at Mahandri, one lane open" className={field} /></label>
                  <label className="flex flex-col gap-1 text-sm font-semibold sm:max-w-xs">Keep this override for
                    <select value={keep[r.id] ?? "24"} onChange={(e) => setKeep((k) => ({ ...k, [r.id]: e.target.value }))} className={field}>
                      {KEEP.map((k) => <option key={k.v} value={k.v}>{k.l}</option>)}
                    </select>
                  </label>
                  {r.manualUntil ? <span className="text-xs text-muted">Currently set until {until(r.manualUntil)}, then it goes back to automatic.</span> : null}
                </div>
              ) : (
                <label className="flex flex-col gap-1 text-sm font-semibold">Fallback note <span className="font-normal text-muted">(shown only if no live data is available)</span><input value={r.note} onChange={(e) => set(i, { note: e.target.value })} className={field} /></label>
              )}

              <details className="rounded-2xl bg-ground px-4 py-3 text-sm">
                <summary className="flex cursor-pointer items-center gap-2 font-semibold"><MapPin className="size-4" aria-hidden />Map points & season</summary>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {(["from", "to"] as const).map((k) => (
                    <fieldset key={k} className="flex flex-col gap-1">
                      <legend className="pb-1 font-semibold">{k === "from" ? "Start" : "End"} (lat, lon)</legend>
                      <div className="flex gap-2">
                        <input inputMode="decimal" aria-label={`${k} latitude`} value={r[k]?.lat ?? ""} onChange={(e) => set(i, { [k]: { lat: num(e.target.value) ?? 0, lon: r[k]?.lon ?? 0 } })} className={clsx(field, "w-full bg-white")} placeholder="34.909" />
                        <input inputMode="decimal" aria-label={`${k} longitude`} value={r[k]?.lon ?? ""} onChange={(e) => set(i, { [k]: { lat: r[k]?.lat ?? 0, lon: num(e.target.value) ?? 0 } })} className={clsx(field, "w-full bg-white")} placeholder="73.651" />
                      </div>
                    </fieldset>
                  ))}
                  <label className="flex flex-col gap-1 font-semibold">Usual distance (km)<input inputMode="decimal" value={r.normalKm ?? ""} onChange={(e) => set(i, { normalKm: num(e.target.value) })} className={clsx(field, "bg-white")} /></label>
                  <fieldset className="flex flex-col gap-1">
                    <legend className="pb-1 font-semibold">Open months <span className="font-normal text-muted">(leave empty if open all year)</span></legend>
                    <div className="flex flex-wrap gap-1">
                      {MONTHS.map((m, j) => {
                        const on = r.openMonths?.includes(j + 1);
                        return <button key={m} type="button" aria-pressed={on} onClick={() => set(i, { openMonths: on ? r.openMonths!.filter((x) => x !== j + 1) : [...(r.openMonths ?? []), j + 1] })} className={clsx("min-h-8 rounded-full px-2.5 text-xs font-semibold", on ? "bg-ink text-ground" : "bg-white text-ink-2")}>{m}</button>;
                      })}
                    </div>
                  </fieldset>
                </div>
              </details>

              <div className="flex justify-end gap-2">
                <button aria-label="Remove segment" onClick={() => start(async () => { const res = await deleteRoadSegment(r.id); toast(res); if (res.ok) setRows((x) => x.filter((_, j) => j !== i)); })} className="flex size-10 items-center justify-center rounded-full text-maroon hover:bg-red-50"><Trash2 className="size-4" /></button>
                <button onClick={() => publish(i)} className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-ground"><Send className="size-4" />Publish</button>
              </div>
            </div>
          );
        })}
        <button onClick={() => setRows((r) => [...r, { id: `new-${Date.now()}`, segment: "New segment", note: "", status: "open", mode: "manual", updatedAt: new Date().toISOString() }])} className="flex items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-line-2 p-5 font-semibold text-muted hover:border-ink hover:text-ink"><Plus className="size-4" />Add segment</button>
      </div>
      <div className="flex flex-col gap-2 rounded-3xl bg-board p-6 font-mono text-ground xl:sticky xl:top-6 xl:self-start">
        <span className="text-sm font-semibold tracking-[0.16em] text-signal">WHAT VISITORS SEE</span>
        {rows.map((r) => {
          const v = shown(r);
          return <div key={r.id} className="flex items-center justify-between gap-2 border-b border-[#1C3330] py-3"><span className="flex flex-col"><span className="text-sm font-semibold uppercase">{r.segment}</span><span className="text-xs text-[#7F9893]">{v.note}</span><span className="text-[10px] tracking-widest text-[#5E7571]">{r.mode === "auto" && auto[r.id] ? "LIVE" : "TEAM"}</span></span><RoadBadge status={v.status} /></div>;
        })}
      </div>
    </div>
  );
}

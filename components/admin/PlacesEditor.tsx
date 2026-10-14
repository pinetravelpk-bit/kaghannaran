"use client";
import { useState, useTransition } from "react";
import { clsx } from "clsx";
import { Plus, Trash2, Save, ArrowUp, ArrowDown } from "lucide-react";
import type { Place, Stop } from "@/lib/types";
import { saveStop } from "@/lib/actions/admin";
import { Photo } from "@/components/ui/Photo";
import { useToast } from "./Toast";

const inp = "w-full rounded-xl border border-line-2 bg-white px-3 py-2.5 outline-none focus:border-ink";

export function PlacesEditor({ initial }: { initial: Stop[] }) {
  const [stops, setStops] = useState(initial);
  const [sel, setSel] = useState(initial.findIndex((s) => s.slug === "naran") >= 0 ? initial.findIndex((s) => s.slug === "naran") : 0);
  const [, start] = useTransition();
  const toast = useToast();
  const s = stops[sel];
  const patch = (p: Partial<Stop>) => setStops((x) => x.map((y, i) => (i === sel ? { ...y, ...p } : y)));
  const setPlace = (j: number, p: Partial<Place>) => patch({ places: s.places.map((x, k) => (k === j ? { ...x, ...p } : x)) });
  const move = (j: number, d: -1 | 1) => { const arr = [...s.places]; const t = arr[j + d]; if (!t) return; arr[j + d] = arr[j]; arr[j] = t; patch({ places: arr }); };

  return (
    <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
      <ol className="no-scrollbar flex gap-1.5 overflow-x-auto rounded-3xl border border-line bg-white p-2 xl:max-h-[78vh] xl:flex-col xl:overflow-y-auto">
        {stops.map((x, i) => (
          <li key={x.slug} className="shrink-0">
            <button onClick={() => setSel(i)} className={clsx("flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition", i === sel ? "bg-ink text-ground" : "hover:bg-ground")}>
              <span className={clsx("flex size-8 shrink-0 items-center justify-center rounded-full font-mono text-xs", i === sel ? "bg-amber text-ink" : "bg-ground")}>{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0"><b className="block truncate">{x.name}</b><span className="text-xs opacity-70">{x.places.length} {x.places.length === 1 ? "place" : "places"}{x.sideTrip ? " · side trip" : ""}</span></span>
            </button>
          </li>
        ))}
      </ol>
      <div className="flex flex-col gap-4">
        <section className="grid gap-4 rounded-3xl border border-line bg-white p-5 md:grid-cols-[220px_minmax(0,1fr)]">
          <Photo src={s.image} alt={s.name} className="aspect-[4/3] rounded-2xl" />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm font-semibold">Name<input className={inp} value={s.name} onChange={(e) => patch({ name: e.target.value })} /></label>
            <label className="flex flex-col gap-1 text-sm font-semibold">Name in Urdu<input className={clsx(inp, "font-urdu")} dir="rtl" lang="ur" value={s.nameUr ?? ""} onChange={(e) => patch({ nameUr: e.target.value })} /></label>
            <label className="flex flex-col gap-1 text-sm font-semibold">Kind<input className={inp} value={s.kind} onChange={(e) => patch({ kind: e.target.value })} /></label>
            <label className="flex flex-col gap-1 text-sm font-semibold">Altitude (m, approx.)<input type="number" className={inp} value={s.altitude ?? ""} onChange={(e) => patch({ altitude: e.target.value ? Number(e.target.value) : undefined })} /></label>
            <label className="flex flex-col gap-1 text-sm font-semibold sm:col-span-2">Cover image URL<input className={inp} value={s.image ?? ""} onChange={(e) => patch({ image: e.target.value })} placeholder="https://…" /></label>
            <label className="flex flex-col gap-1 text-sm font-semibold sm:col-span-2">Description<textarea rows={2} className={inp} value={s.desc} onChange={(e) => patch({ desc: e.target.value })} /></label>
            <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={!!s.sideTrip} onChange={(e) => patch({ sideTrip: e.target.checked })} className="size-5 accent-maroon" />Side trip off the N-15</label>
          </div>
        </section>
        <section className="flex flex-col gap-3 rounded-3xl border border-line bg-white p-5">
          <div className="flex items-center justify-between"><h2 className="font-display text-xl font-bold">Places at {s.name}</h2><button onClick={() => patch({ places: [...s.places, { name: "New place", isNew: true }] })} className="flex items-center gap-1.5 rounded-full border border-line-2 px-4 py-2 text-sm font-semibold"><Plus className="size-4" />Add place</button></div>
          {s.places.map((p, j) => (
            <div key={j} className="grid gap-2 rounded-2xl bg-ground p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)_auto]">
              <input aria-label="Place name" className={inp} value={p.name} onChange={(e) => setPlace(j, { name: e.target.value })} />
              <input aria-label="Note" className={inp} value={p.note ?? ""} placeholder="Note" onChange={(e) => setPlace(j, { note: e.target.value })} />
              <input aria-label="Safety warning" className={clsx(inp, p.warning && "border-amber bg-[#FFF7E6]")} value={p.warning ?? ""} placeholder="Safety warning (optional)" onChange={(e) => setPlace(j, { warning: e.target.value || undefined })} />
              <div className="flex items-center gap-1">
                <label className="flex items-center gap-1.5 px-2 text-xs font-semibold"><input type="checkbox" checked={!!p.isNew} onChange={(e) => setPlace(j, { isNew: e.target.checked })} className="size-4 accent-maroon" />New</label>
                <button aria-label="Move up" onClick={() => move(j, -1)} className="flex size-9 items-center justify-center rounded-full hover:bg-white"><ArrowUp className="size-4" /></button>
                <button aria-label="Move down" onClick={() => move(j, 1)} className="flex size-9 items-center justify-center rounded-full hover:bg-white"><ArrowDown className="size-4" /></button>
                <button aria-label="Delete place" onClick={() => patch({ places: s.places.filter((_, k) => k !== j) })} className="flex size-9 items-center justify-center rounded-full text-maroon hover:bg-white"><Trash2 className="size-4" /></button>
              </div>
            </div>
          ))}
        </section>
        <button onClick={() => start(async () => toast(await saveStop({ ...s, order: sel + 1 })))} className="flex items-center justify-center gap-2 self-end rounded-full bg-ink px-7 py-3.5 font-semibold text-ground hover:bg-maroon"><Save className="size-4" />Save {s.name}</button>
      </div>
    </div>
  );
}

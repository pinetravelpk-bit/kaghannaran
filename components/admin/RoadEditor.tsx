"use client";
import { useState, useTransition } from "react";
import { clsx } from "clsx";
import { Plus, Trash2, Send } from "lucide-react";
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

export function RoadEditor({ initial }: { initial: RoadSegment[] }) {
  const [rows, setRows] = useState(initial);
  const [, start] = useTransition();
  const toast = useToast();
  const set = (i: number, p: Partial<RoadSegment>) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...p } : x)));
  const publish = (i: number) => start(async () => {
    const r = rows[i];
    const res = await saveRoadSegment({ id: r.id.startsWith("new-") ? undefined : r.id, segment: r.segment, note: r.note, status: r.status, sort: i });
    toast(res);
    if (res.ok) set(i, { updatedAt: new Date().toISOString(), id: res.id ?? r.id });
  });
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-3">
        {rows.map((r, i) => (
          <div key={r.id} className="flex flex-col gap-3 rounded-3xl border border-line bg-white p-5">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm font-semibold">Segment<input value={r.segment} onChange={(e) => set(i, { segment: e.target.value })} className="rounded-xl border border-line-2 px-3 py-2.5 font-normal" /></label>
              <label className="flex flex-col gap-1 text-sm font-semibold">Note for travellers<input value={r.note} onChange={(e) => set(i, { note: e.target.value })} className="rounded-xl border border-line-2 px-3 py-2.5 font-normal" /></label>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div role="radiogroup" aria-label="Status" className="flex flex-wrap gap-1.5">
                {STATUSES.map((s) => (
                  <button key={s.v} role="radio" aria-checked={r.status === s.v} onClick={() => set(i, { status: s.v })} className={clsx("min-h-10 rounded-full px-4 text-sm font-semibold transition", r.status === s.v ? s.c : "bg-ground text-ink-2 hover:bg-sage")}>{s.l}</button>
                ))}
              </div>
              <div className="flex gap-2">
                <button aria-label="Remove segment" onClick={() => start(async () => { const res = await deleteRoadSegment(r.id); toast(res); if (res.ok) setRows((x) => x.filter((_, j) => j !== i)); })} className="flex size-10 items-center justify-center rounded-full text-maroon hover:bg-red-50"><Trash2 className="size-4" /></button>
                <button onClick={() => publish(i)} className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-ground"><Send className="size-4" />Publish</button>
              </div>
            </div>
          </div>
        ))}
        <button onClick={() => setRows((r) => [...r, { id: `new-${Date.now()}`, segment: "New segment", note: "", status: "open", updatedAt: new Date().toISOString() }])} className="flex items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-line-2 p-5 font-semibold text-muted hover:border-ink hover:text-ink"><Plus className="size-4" />Add segment</button>
      </div>
      <div className="flex flex-col gap-2 rounded-3xl bg-board p-6 font-mono text-ground xl:sticky xl:top-6 xl:self-start">
        <span className="text-sm font-semibold tracking-[0.16em] text-signal">LIVE PREVIEW</span>
        {rows.map((r) => <div key={r.id} className="flex items-center justify-between gap-2 border-b border-[#1C3330] py-3"><span className="flex flex-col"><span className="text-sm font-semibold uppercase">{r.segment}</span><span className="text-xs text-[#7F9893]">{r.note}</span></span><RoadBadge status={r.status} /></div>)}
      </div>
    </div>
  );
}

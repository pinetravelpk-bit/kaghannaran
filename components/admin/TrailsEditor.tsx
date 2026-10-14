"use client";
import { useState, useTransition } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import type { Stop, Trail, TrailMode } from "@/lib/types";
import { saveTrails } from "@/lib/actions/admin";
import { useToast } from "./Toast";

const inp = "w-full rounded-lg border border-line-2 bg-white px-2.5 py-2 outline-none focus:border-ink";

export function TrailsEditor({ initial, stops }: { initial: Trail[]; stops: Stop[] }) {
  const [rows, setRows] = useState(initial);
  const [, start] = useTransition();
  const toast = useToast();
  const set = (i: number, p: Partial<Trail>) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...p } : x)));
  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-3xl border border-line bg-white">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-ground font-mono text-[11px] tracking-widest text-muted uppercase"><tr><th className="px-4 py-3 text-left font-normal">Route</th><th className="px-2 py-3 text-left font-normal">Mode</th><th className="px-2 py-3 text-left font-normal">Starts from</th><th className="px-2 py-3 text-left font-normal">Time / note</th><th className="px-2 py-3 text-left font-normal">Stop</th><th /></tr></thead>
          <tbody>
            {rows.map((t, i) => (
              <tr key={t.slug} className="border-t border-line">
                <td className="px-4 py-2"><input aria-label="Route" className={inp} value={t.name} onChange={(e) => set(i, { name: e.target.value })} /></td>
                <td className="px-2 py-2"><select aria-label="Mode" className={inp} value={t.mode} onChange={(e) => set(i, { mode: e.target.value as TrailMode })}>{["Jeep", "Hike", "Trek", "Walk"].map((m) => <option key={m}>{m}</option>)}</select></td>
                <td className="px-2 py-2"><input aria-label="Starts from" className={inp} value={t.from} onChange={(e) => set(i, { from: e.target.value })} /></td>
                <td className="px-2 py-2"><input aria-label="Time" className={inp} value={t.time} onChange={(e) => set(i, { time: e.target.value })} /></td>
                <td className="px-2 py-2"><select aria-label="Stop" className={inp} value={t.stop} onChange={(e) => set(i, { stop: e.target.value })}>{stops.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}</select></td>
                <td className="px-2 py-2"><button aria-label="Delete route" onClick={() => setRows((r) => r.filter((_, j) => j !== i))} className="flex size-9 items-center justify-center rounded-full text-maroon hover:bg-red-50"><Trash2 className="size-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap justify-between gap-2">
        <button onClick={() => setRows((r) => [...r, { slug: `route-${Date.now()}`, name: "New route", mode: "Hike", from: "", time: "", stop: stops[0]?.slug ?? "" }])} className="flex items-center gap-2 rounded-full border border-line-2 bg-white px-5 py-3 font-semibold"><Plus className="size-4" />Add route</button>
        <button onClick={() => start(async () => toast(await saveTrails(rows)))} className="flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-semibold text-ground"><Save className="size-4" />Save all</button>
      </div>
    </div>
  );
}

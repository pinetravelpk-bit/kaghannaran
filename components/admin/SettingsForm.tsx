"use client";
import { useState, useTransition } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import { saveSettings } from "@/lib/actions/admin";
import { useToast } from "./Toast";

const inp = "w-full rounded-xl border border-line-2 bg-white px-3 py-2.5 outline-none focus:border-ink";

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const [v, setV] = useState(initial);
  const [, start] = useTransition();
  const toast = useToast();
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="flex flex-col gap-4 rounded-3xl border border-line bg-white p-5">
        <h2 className="font-display text-xl font-bold">Website</h2>
        <label className="flex flex-col gap-1 text-sm font-semibold">Alert banner (top bar)<input className={inp} value={v.alertBanner} onChange={(e) => setV({ ...v, alertBanner: e.target.value })} /></label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Valley film URL<input className={inp} value={v.heroVideoUrl} placeholder="YouTube, Vimeo or .mp4 link" onChange={(e) => setV({ ...v, heroVideoUrl: e.target.value })} /><span className="font-normal text-muted">Plays in the “Valley in motion” section on the home page.</span></label>
      </section>
      <section className="flex flex-col gap-4 rounded-3xl border border-line bg-white p-5">
        <h2 className="font-display text-xl font-bold">Emergency numbers</h2>
        {v.emergencyNumbers.map((n, i) => (
          <div key={i} className="flex gap-2">
            <input aria-label="Label" className={inp} value={n.label} onChange={(e) => setV({ ...v, emergencyNumbers: v.emergencyNumbers.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} />
            <input aria-label="Number" className={`${inp} max-w-36 font-mono`} value={n.number} onChange={(e) => setV({ ...v, emergencyNumbers: v.emergencyNumbers.map((x, j) => (j === i ? { ...x, number: e.target.value } : x)) })} />
            <button aria-label="Remove" onClick={() => setV({ ...v, emergencyNumbers: v.emergencyNumbers.filter((_, j) => j !== i) })} className="flex size-11 shrink-0 items-center justify-center rounded-full text-maroon hover:bg-red-50"><Trash2 className="size-4" /></button>
          </div>
        ))}
        <button onClick={() => setV({ ...v, emergencyNumbers: [...v.emergencyNumbers, { label: "", number: "" }] })} className="flex items-center gap-1.5 self-start text-sm font-semibold text-maroon"><Plus className="size-4" />Add number</button>
      </section>
      <section className="flex flex-col gap-3 rounded-3xl border border-line bg-white p-5 xl:col-span-2">
        <h2 className="font-display text-xl font-bold">Moderation</h2>
        <label className="flex items-center justify-between gap-3 rounded-xl bg-ground px-4 py-3"><span><b className="block">Auto-publish events from verified businesses</b><span className="text-sm text-muted">Skip the queue for businesses that already have a Verified badge.</span></span><input type="checkbox" checked={v.autoPublishEvents} onChange={(e) => setV({ ...v, autoPublishEvents: e.target.checked })} className="size-5 accent-maroon" /></label>
        <label className="flex items-center justify-between gap-3 rounded-xl bg-ground px-4 py-3"><span><b className="block">Require CNIC for tour guides</b><span className="text-sm text-muted">Guides can’t submit without uploading their CNIC.</span></span><input type="checkbox" checked={v.requireDocsForGuides} onChange={(e) => setV({ ...v, requireDocsForGuides: e.target.checked })} className="size-5 accent-maroon" /></label>
      </section>
      <button onClick={() => start(async () => toast(await saveSettings(v)))} className="flex items-center gap-2 justify-self-end rounded-full bg-ink px-7 py-3.5 font-semibold text-ground xl:col-span-2"><Save className="size-4" />Save settings</button>
    </div>
  );
}

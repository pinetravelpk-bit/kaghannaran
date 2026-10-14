"use client";
import { useState, useTransition } from "react";
import { clsx } from "clsx";
import { Plus, Trash2, Save, FileText, ListChecks, TextCursorInput } from "lucide-react";
import type { BusinessType, FieldDef } from "@/lib/types";
import { saveBusinessType } from "@/lib/actions/admin";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "./Toast";

const inp = "w-full rounded-lg border border-line-2 bg-white px-2.5 py-2 outline-none focus:border-ink";
const key = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/(^_|_$)/g, "") || `k${Date.now()}`;

export function TypesEditor({ initial }: { initial: BusinessType[] }) {
  const [types, setTypes] = useState(initial);
  const [sel, setSel] = useState(0);
  const [, start] = useTransition();
  const toast = useToast();
  const t = types[sel];
  const patch = (p: Partial<BusinessType>) => setTypes((x) => x.map((y, i) => (i === sel ? { ...y, ...p } : y)));
  const setField = (j: number, p: Partial<FieldDef>) => patch({ fields: t.fields.map((f, k) => (k === j ? { ...f, ...p } : f)) });

  return (
    <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
      <ul className="no-scrollbar flex gap-1.5 overflow-x-auto rounded-3xl border border-line bg-white p-2 xl:flex-col">
        {types.map((x, i) => (
          <li key={x.slug} className="shrink-0">
            <button onClick={() => setSel(i)} className={clsx("flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left", i === sel ? "bg-ink text-ground" : "hover:bg-ground")}>
              <Icon name={x.icon} className="size-5 shrink-0" /><span className="min-w-0"><b className="block truncate text-sm">{x.name}</b><span className="text-xs opacity-70">{x.documents.length} docs · {x.checklist.length} checks{x.adminOnly ? " · staff only" : ""}</span></span>
            </button>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-4">
        <section className="grid gap-3 rounded-3xl border border-line bg-white p-5 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-semibold">Name<input className={inp} value={t.name} onChange={(e) => patch({ name: e.target.value })} /></label>
          <label className="flex flex-col gap-1 text-sm font-semibold">Icon (lucide name)<input className={inp} value={t.icon} onChange={(e) => patch({ icon: e.target.value })} /></label>
          <label className="flex flex-col gap-1 text-sm font-semibold sm:col-span-2">Description<input className={inp} value={t.description} onChange={(e) => patch({ description: e.target.value })} /></label>
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={!!t.individual} onChange={(e) => patch({ individual: e.target.checked })} className="size-5 accent-maroon" />Individual person (e.g. guide)</label>
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={!!t.adminOnly} onChange={(e) => patch({ adminOnly: e.target.checked })} className="size-5 accent-maroon" />Only staff can add (public services)</label>
        </section>

        <div className="grid gap-4 2xl:grid-cols-2">
          <section className="flex flex-col gap-3 rounded-3xl border border-line bg-white p-5">
            <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 font-display text-xl font-bold"><FileText className="size-5" />Required documents</h2><button onClick={() => patch({ documents: [...t.documents, { key: `doc_${Date.now()}`, label: "New document", required: false }] })} className="flex items-center gap-1 text-sm font-semibold text-maroon"><Plus className="size-4" />Add</button></div>
            {t.documents.map((d, j) => (
              <div key={d.key} className="flex items-center gap-2">
                <input aria-label="Document" className={inp} value={d.label} onChange={(e) => patch({ documents: t.documents.map((x, k) => (k === j ? { ...x, label: e.target.value } : x)) })} />
                <label className="flex shrink-0 items-center gap-1.5 text-xs font-semibold"><input type="checkbox" checked={d.required} onChange={(e) => patch({ documents: t.documents.map((x, k) => (k === j ? { ...x, required: e.target.checked } : x)) })} className="size-4 accent-maroon" />Required</label>
                <button aria-label="Remove" onClick={() => patch({ documents: t.documents.filter((_, k) => k !== j) })} className="flex size-9 shrink-0 items-center justify-center rounded-full text-maroon hover:bg-red-50"><Trash2 className="size-4" /></button>
              </div>
            ))}
            {!t.documents.length ? <p className="text-sm text-muted">No documents needed.</p> : null}
          </section>
          <section className="flex flex-col gap-3 rounded-3xl border border-line bg-white p-5">
            <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 font-display text-xl font-bold"><ListChecks className="size-5" />Moderator checklist</h2><button onClick={() => patch({ checklist: [...t.checklist, "New check"] })} className="flex items-center gap-1 text-sm font-semibold text-maroon"><Plus className="size-4" />Add</button></div>
            {t.checklist.map((c, j) => (
              <div key={j} className="flex items-center gap-2">
                <input aria-label="Check" className={inp} value={c} onChange={(e) => patch({ checklist: t.checklist.map((x, k) => (k === j ? e.target.value : x)) })} />
                <button aria-label="Remove" onClick={() => patch({ checklist: t.checklist.filter((_, k) => k !== j) })} className="flex size-9 shrink-0 items-center justify-center rounded-full text-maroon hover:bg-red-50"><Trash2 className="size-4" /></button>
              </div>
            ))}
          </section>
        </div>

        <section className="flex flex-col gap-3 rounded-3xl border border-line bg-white p-5">
          <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 font-display text-xl font-bold"><TextCursorInput className="size-5" />Form fields for this type</h2><button onClick={() => patch({ fields: [...t.fields, { key: `field_${Date.now()}`, label: "New field", type: "text" }] })} className="flex items-center gap-1 text-sm font-semibold text-maroon"><Plus className="size-4" />Add field</button></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-left font-mono text-[11px] tracking-widest text-muted uppercase"><tr><th className="py-2 font-normal">Label</th><th className="py-2 font-normal">Type</th><th className="py-2 font-normal">Options (comma separated)</th><th className="py-2 font-normal">Req.</th><th /></tr></thead>
              <tbody>
                {t.fields.map((f, j) => (
                  <tr key={f.key} className="border-t border-line">
                    <td className="py-2 pe-2"><input aria-label="Label" className={inp} value={f.label} onChange={(e) => setField(j, { label: e.target.value, key: f.key.startsWith("field_") ? key(e.target.value) : f.key })} /></td>
                    <td className="py-2 pe-2"><select aria-label="Type" className={inp} value={f.type} onChange={(e) => setField(j, { type: e.target.value as FieldDef["type"] })}>{["text", "number", "textarea", "select", "multiselect", "boolean"].map((x) => <option key={x}>{x}</option>)}</select></td>
                    <td className="py-2 pe-2"><input aria-label="Options" className={inp} disabled={!["select", "multiselect"].includes(f.type)} value={f.options?.join(", ") ?? ""} onChange={(e) => setField(j, { options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></td>
                    <td className="py-2 pe-2"><input aria-label="Required" type="checkbox" checked={!!f.required} onChange={(e) => setField(j, { required: e.target.checked })} className="size-4 accent-maroon" /></td>
                    <td className="py-2"><button aria-label="Remove field" onClick={() => patch({ fields: t.fields.filter((_, k) => k !== j) })} className="flex size-9 items-center justify-center rounded-full text-maroon hover:bg-red-50"><Trash2 className="size-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <button onClick={() => start(async () => toast(await saveBusinessType(t)))} className="flex items-center gap-2 self-end rounded-full bg-ink px-7 py-3.5 font-semibold text-ground hover:bg-maroon"><Save className="size-4" />Save rules for {t.name}</button>
      </div>
    </div>
  );
}

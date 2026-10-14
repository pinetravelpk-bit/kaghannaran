"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FileText, Eye, X, Lock } from "lucide-react";

export type DocView = { key: string; label: string; required: boolean; files: { name: string; url?: string }[] };

export function DocViewer({ docs, demo }: { docs: DocView[]; demo: boolean }) {
  const [open, setOpen] = useState<{ name: string; url?: string } | null>(null);
  return (
    <>
      <ul className="grid gap-2 sm:grid-cols-2">
        {docs.map((d) => (
          <li key={d.key} className={`flex flex-col gap-2 rounded-2xl border p-4 ${d.files.length ? "border-line bg-white" : d.required ? "border-red-200 bg-red-50" : "border-dashed border-line-2 bg-ground"}`}>
            <span className="flex items-center justify-between gap-2"><span className="font-semibold">{d.label}</span><span className={`text-xs font-semibold ${d.required ? "text-maroon" : "text-muted"}`}>{d.required ? "Required" : "Optional"}</span></span>
            {d.files.length ? d.files.map((f) => (
              <button key={f.name} type="button" onClick={() => setOpen(f)} className="flex items-center gap-2 rounded-xl bg-ground px-3 py-2 text-left text-sm hover:bg-sage">
                <FileText className="size-4 shrink-0 text-pine" /><span className="truncate">{f.name}</span><Eye className="ms-auto size-4" />
              </button>
            )) : <span className="text-sm text-muted">{d.required ? "Not uploaded" : "Not provided"}</span>}
          </li>
        ))}
      </ul>
      <p className="flex items-center gap-1.5 text-xs text-muted"><Lock className="size-3.5" />Private bucket. Links expire after 10 minutes.</p>
      <AnimatePresence>
        {open ? (
          <motion.div role="dialog" aria-modal="true" aria-label={open.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4" onClick={() => setOpen(null)}>
            <motion.div initial={{ scale: 0.94 }} animate={{ scale: 1 }} className="relative flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-line px-4 py-3"><span className="truncate font-semibold">{open.name}</span><button type="button" aria-label="Close" onClick={() => setOpen(null)} className="flex size-10 items-center justify-center rounded-full hover:bg-ground"><X className="size-5" /></button></div>
              <div className="flex min-h-80 items-center justify-center bg-ground p-4">
                {demo || !open.url ? (
                  <div className="flex flex-col items-center gap-2 text-center text-muted"><FileText className="size-12" /><b className="text-ink">Sample document</b><span>In live mode the uploaded file opens here.</span></div>
                ) : /\.pdf($|\?)/i.test(open.name) ? (
                  <iframe src={open.url} title={open.name} className="h-[70vh] w-full rounded-lg bg-white" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={open.url} alt={open.name} className="max-h-[70vh] rounded-lg object-contain" />
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

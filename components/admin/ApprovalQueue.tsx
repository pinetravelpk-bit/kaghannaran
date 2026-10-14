"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { FileWarning, FileCheck2 } from "lucide-react";
import type { BusinessType, Listing, ListingStatus } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Icon } from "@/components/ui/Icon";

const ago = (iso: string) => { const h = (Date.now() - new Date(iso).getTime()) / 36e5; return h < 1 ? `${Math.max(1, Math.round(h * 60))}m` : h < 24 ? `${Math.round(h)}h` : `${Math.round(h / 24)}d`; };

export function ApprovalQueue({ listings, types, stops }: { listings: Listing[]; types: BusinessType[]; stops: Record<string, string> }) {
  const [type, setType] = useState("all");
  const [status, setStatus] = useState<ListingStatus | "open">("open");
  const [sort, setSort] = useState<"oldest" | "newest">("oldest");
  const tBy = useMemo(() => Object.fromEntries(types.map((t) => [t.slug, t])), [types]);
  const open = (l: Listing) => l.status === "pending" || l.status === "changes_requested";
  const base = listings.filter((l) => (status === "open" ? open(l) : l.status === status));
  const counts = base.reduce<Record<string, number>>((a, l) => ({ ...a, [l.type]: (a[l.type] ?? 0) + 1 }), {});
  const rows = base.filter((l) => type === "all" || l.type === type).sort((a, b) => (sort === "oldest" ? a.submittedAt.localeCompare(b.submittedAt) : b.submittedAt.localeCompare(a.submittedAt)));
  const tabs = [["all", "All types", base.length], ...types.filter((t) => counts[t.slug]).map((t) => [t.slug, t.name, counts[t.slug]])] as [string, string, number][];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Status" className="flex rounded-full bg-white p-1 shadow-sm">
          {([["open", "Open"], ["pending", "Pending"], ["changes_requested", "Changes requested"], ["rejected", "Rejected"]] as const).map(([v, l]) => (
            <button key={v} role="tab" aria-selected={status === v} onClick={() => setStatus(v)} className={clsx("relative min-h-10 rounded-full px-4 text-sm font-semibold", status === v ? "text-ground" : "text-ink-2")}>
              {status === v ? <motion.span layoutId="q-status" className="absolute inset-0 rounded-full bg-ink" /> : null}<span className="relative">{l}</span>
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm"><span className="text-muted">Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as "oldest" | "newest")} className="rounded-xl border border-line-2 bg-white px-3 py-2"><option value="oldest">Oldest first (SLA)</option><option value="newest">Newest first</option></select>
        </label>
      </div>
      <div role="tablist" aria-label="Business type" className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {tabs.map(([v, l, n]) => (
          <button key={v} role="tab" aria-selected={type === v} onClick={() => setType(v)} className={clsx("flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition", type === v ? "border-ink bg-ink text-ground" : "border-line-2 bg-white hover:border-ink")}>
            {v !== "all" ? <Icon name={tBy[v]?.icon ?? "Store"} className="size-4" /> : null}{l}<span className={clsx("rounded-full px-1.5 font-mono text-[11px]", type === v ? "bg-amber text-ink" : "bg-ground")}>{n}</span>
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-3xl border border-line bg-white">
        <table className="w-full min-w-[860px] text-left text-sm rtl:text-right">
          <thead className="bg-ground font-mono text-[11px] tracking-widest text-muted uppercase">
            <tr><th className="px-5 py-3 font-normal">Submission</th><th className="px-3 py-3 font-normal">Stop</th><th className="px-3 py-3 font-normal">Waiting</th><th className="px-3 py-3 font-normal">Documents</th><th className="px-3 py-3 font-normal">Checklist</th><th className="px-3 py-3 font-normal">Status</th><th className="px-5 py-3" /></tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {rows.map((l) => {
                const t = tBy[l.type];
                const req = t?.documents.filter((d) => d.required) ?? [];
                const have = req.filter((d) => l.documents.some((x) => x.key === d.key)).length;
                const checks = t?.checklist ?? [];
                const done = checks.filter((c) => l.checklist[c]).length;
                const h = (Date.now() - new Date(l.submittedAt).getTime()) / 36e5;
                return (
                  <motion.tr key={l.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-t border-line hover:bg-[#FAFBF9]">
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/approvals/${l.id}`} className="flex items-center gap-3">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-pine text-signal"><Icon name={t?.icon ?? "Store"} className="size-5" /></span>
                        <span><span className="block font-semibold text-ink">{l.name}</span><span className="text-muted">{t?.name}{t?.individual ? " · individual" : ""} · {l.ownerName}</span></span>
                      </Link>
                    </td>
                    <td className="px-3 py-3.5">{stops[l.stop]}</td>
                    <td className="px-3 py-3.5"><span className={clsx("rounded-full px-2.5 py-1 font-mono text-xs", h > 48 ? "bg-red-100 text-red-900" : h > 24 ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900")}>{ago(l.submittedAt)}</span></td>
                    <td className="px-3 py-3.5"><span className={clsx("flex items-center gap-1.5 font-semibold", have < req.length ? "text-maroon" : "text-emerald-800")}>{have < req.length ? <FileWarning className="size-4" /> : <FileCheck2 className="size-4" />}{have}/{req.length}</span></td>
                    <td className="px-3 py-3.5"><span className="flex items-center gap-2"><span className="h-2 w-20 overflow-hidden rounded-full bg-ground"><span className="block h-full bg-pine" style={{ width: `${checks.length ? (done / checks.length) * 100 : 0}%` }} /></span><span className="font-mono text-xs">{done}/{checks.length}</span></span></td>
                    <td className="px-3 py-3.5"><StatusBadge status={l.status} /></td>
                    <td className="px-5 py-3.5 text-right"><Link href={`/admin/approvals/${l.id}`} className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-ground">Review</Link></td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
        {!rows.length ? <p className="p-10 text-center font-semibold text-muted">Nothing here. Queue is clear.</p> : null}
      </div>
    </div>
  );
}

"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { clsx } from "clsx";
import { Star, BadgeCheck, Trash2, ExternalLink } from "lucide-react";
import type { BusinessType, Listing, ListingStatus } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Icon } from "@/components/ui/Icon";
import { setListingFlag, deleteListing } from "@/lib/actions/admin";
import { useToast } from "./Toast";

export function ListingsTable({ listings, types, stops, initialQ = "", initialStatus = "all" }: { listings: Listing[]; types: BusinessType[]; stops: Record<string, string>; initialQ?: string; initialStatus?: string }) {
  const [rows, setRows] = useState(listings);
  const [q, setQ] = useState(initialQ);
  const [status, setStatus] = useState<ListingStatus | "all">(initialStatus as ListingStatus | "all");
  const [type, setType] = useState("all");
  const [, start] = useTransition();
  const toast = useToast();
  const tBy = Object.fromEntries(types.map((t) => [t.slug, t]));
  const shown = rows.filter((l) => (status === "all" || l.status === status) && (type === "all" || l.type === type) && (!q || `${l.name} ${l.ownerName} ${l.phone} ${l.address}`.toLowerCase().includes(q.toLowerCase())));

  const flag = (l: Listing, field: "featured" | "verified") => start(async () => {
    const v = !l[field];
    setRows((r) => r.map((x) => (x.id === l.id ? { ...x, [field]: v } : x)));
    const res = await setListingFlag(l.id, l.name, field, v);
    toast(res);
    if (!res.ok) setRows((r) => r.map((x) => (x.id === l.id ? { ...x, [field]: !v } : x)));
  });
  const remove = (l: Listing) => {
    if (!confirm(`Delete “${l.name}”? This can’t be undone.`)) return;
    start(async () => { const res = await deleteListing(l.id, l.name); toast(res); if (res.ok) setRows((r) => r.filter((x) => x.id !== l.id)); });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2 rounded-2xl border border-line bg-white p-2">
        <label className="flex min-w-60 flex-1 items-center rounded-xl bg-ground px-3"><span className="sr-only">Search</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, owner, phone…" className="min-h-11 w-full bg-transparent outline-none" /></label>
        <label><span className="sr-only">Status</span><select value={status} onChange={(e) => setStatus(e.target.value as ListingStatus | "all")} className="min-h-11 rounded-xl border border-line-2 px-3"><option value="all">All statuses</option>{["pending", "changes_requested", "approved", "rejected", "suspended"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}</select></label>
        <label><span className="sr-only">Type</span><select value={type} onChange={(e) => setType(e.target.value)} className="min-h-11 rounded-xl border border-line-2 px-3"><option value="all">All types</option>{types.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}</select></label>
      </div>
      <div className="overflow-x-auto rounded-3xl border border-line bg-white">
        <table className="w-full min-w-[900px] text-left text-sm rtl:text-right">
          <thead className="bg-ground font-mono text-[11px] tracking-widest text-muted uppercase"><tr><th className="px-5 py-3 font-normal">Listing</th><th className="px-3 py-3 font-normal">Stop</th><th className="px-3 py-3 font-normal">Owner</th><th className="px-3 py-3 font-normal">Status</th><th className="px-3 py-3 text-center font-normal">Featured</th><th className="px-3 py-3 text-center font-normal">Verified</th><th className="px-5 py-3" /></tr></thead>
          <tbody>
            {shown.map((l) => (
              <tr key={l.id} className="border-t border-line hover:bg-[#FAFBF9]">
                <td className="px-5 py-3"><Link href={`/admin/approvals/${l.id}`} className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-ground text-pine"><Icon name={tBy[l.type]?.icon ?? "Store"} className="size-5" /></span><span><b className="block">{l.name}</b><span className="text-muted">{tBy[l.type]?.name}</span></span></Link></td>
                <td className="px-3 py-3">{stops[l.stop]}</td>
                <td className="px-3 py-3"><span className="block">{l.ownerName}</span><span className="text-muted">{l.phone}</span></td>
                <td className="px-3 py-3"><StatusBadge status={l.status} /></td>
                <td className="px-3 py-3 text-center"><button aria-label={`Featured: ${l.featured ? "on" : "off"}`} aria-pressed={!!l.featured} onClick={() => flag(l, "featured")} className={clsx("inline-flex size-10 items-center justify-center rounded-full transition", l.featured ? "bg-amber text-ink" : "bg-ground text-muted hover:text-ink")}><Star className={clsx("size-4", l.featured && "fill-current")} /></button></td>
                <td className="px-3 py-3 text-center"><button aria-label={`Verified: ${l.verified ? "on" : "off"}`} aria-pressed={!!l.verified} onClick={() => flag(l, "verified")} className={clsx("inline-flex size-10 items-center justify-center rounded-full transition", l.verified ? "bg-emerald-700 text-white" : "bg-ground text-muted hover:text-ink")}><BadgeCheck className="size-4" /></button></td>
                <td className="px-5 py-3"><span className="flex justify-end gap-1">{l.status === "approved" ? <Link aria-label="View live" href={`/listing/${l.slug}`} className="flex size-10 items-center justify-center rounded-full hover:bg-ground"><ExternalLink className="size-4" /></Link> : null}<button aria-label="Delete" onClick={() => remove(l)} className="flex size-10 items-center justify-center rounded-full text-maroon hover:bg-red-50"><Trash2 className="size-4" /></button></span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!shown.length ? <p className="p-10 text-center text-muted">No listings match.</p> : null}
      </div>
    </div>
  );
}

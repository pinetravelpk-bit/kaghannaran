"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { clsx } from "clsx";
import { Check, X, MessageSquareWarning, Ban, BadgeCheck, StickyNote, Loader2 } from "lucide-react";
import type { BusinessType, Listing, ListingStatus, ModerationEvent } from "@/lib/types";
import { moderateListing, type Decision } from "@/lib/actions/admin";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "./Toast";

const TEMPLATES = [
  "Please upload a clearer photo of the CNIC (front and back).",
  "We couldn’t reach you on the phone number given. Please check it.",
  "Please add recent photos of the rooms / premises.",
  "Please add your prices so travellers know what to expect.",
];

const ACTION_LABEL: Record<ModerationEvent["action"], string> = { submitted: "Submitted", resubmitted: "Resubmitted", approved: "Approved", rejected: "Rejected", changes_requested: "Requested changes", suspended: "Suspended", note: "Note" };

export function ReviewPanel({ listing, type, nextId }: { listing: Listing; type: BusinessType; nextId?: string }) {
  const router = useRouter();
  const toast = useToast();
  const [checks, setChecks] = useState<Record<string, boolean>>(() => Object.fromEntries(type.checklist.map((c) => [c, !!listing.checklist[c]])));
  const [verified, setVerified] = useState(!!listing.verified);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<ListingStatus>(listing.status);
  const [history, setHistory] = useState<ModerationEvent[]>(listing.history);
  const [pending, start] = useTransition();
  const done = Object.values(checks).filter(Boolean).length;
  const allDone = done === type.checklist.length;
  const missingDocs = type.documents.filter((d) => d.required && !listing.documents.some((x) => x.key === d.key));

  const decide = (decision: Decision) => start(async () => {
    const r = await moderateListing({ id: listing.id, name: listing.name, decision, note, checklist: checks, verified });
    toast(r);
    if (!r.ok) return;
    if (decision !== "note") setStatus(decision as ListingStatus);
    setHistory((h) => [...h, { id: String(Date.now()), at: new Date().toISOString(), by: "You", action: decision, note: note || undefined }]);
    setNote("");
    if (decision !== "note" && nextId && !r.demo) router.push(`/admin/approvals/${nextId}`);
    else router.refresh();
  });

  return (
    <div className="flex flex-col gap-4 xl:sticky xl:top-6">
      <section className="flex flex-col gap-4 rounded-3xl border border-line bg-white p-5">
        <div className="flex items-center justify-between"><h2 className="font-display text-xl font-bold">Decision</h2><StatusBadge status={status} /></div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm"><span className="font-semibold">Checklist for {type.name}</span><span className="font-mono">{done}/{type.checklist.length}</span></div>
          <span className="h-2 overflow-hidden rounded-full bg-ground"><motion.span className="block h-full rounded-full bg-emerald-600" animate={{ width: `${(done / Math.max(1, type.checklist.length)) * 100}%` }} /></span>
          <ul className="flex flex-col gap-1">
            {type.checklist.map((c) => (
              <li key={c}>
                <label className={clsx("flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition", checks[c] ? "bg-emerald-50" : "hover:bg-ground")}>
                  <input type="checkbox" checked={checks[c]} onChange={(e) => setChecks((x) => ({ ...x, [c]: e.target.checked }))} className="peer sr-only" />
                  <span className={clsx("flex size-6 shrink-0 items-center justify-center rounded-md border-2 transition peer-focus-visible:ring-4 peer-focus-visible:ring-signal", checks[c] ? "border-emerald-600 bg-emerald-600 text-white" : "border-line-2")}>{checks[c] ? <Check className="size-4" /> : null}</span>
                  <span className="text-sm">{c}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        {missingDocs.length ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-900"><b>Missing required documents:</b> {missingDocs.map((d) => d.label).join(", ")}</p> : null}

        <label className="flex items-center justify-between gap-3 rounded-xl bg-ground px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-semibold"><BadgeCheck className="size-5 text-emerald-700" />Give a Verified badge</span>
          <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} className="size-5 accent-emerald-700" />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Note to owner <span className="font-normal text-muted">(required for changes / reject)</span></span>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="rounded-xl border border-line-2 px-3 py-2.5 outline-none focus:border-ink" placeholder="What should they fix?" />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {TEMPLATES.map((t) => <button key={t} type="button" onClick={() => setNote((n) => (n ? n + " " : "") + t)} className="rounded-full bg-ground px-3 py-1.5 text-left text-xs hover:bg-sage">{t.slice(0, 38)}…</button>)}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button disabled={pending} onClick={() => decide("approved")} className={clsx("col-span-2 flex min-h-13 items-center justify-center gap-2 rounded-2xl font-semibold text-white transition disabled:opacity-60", allDone ? "bg-emerald-700 hover:bg-emerald-800" : "bg-emerald-700/70")}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-5" />}Approve & publish{!allDone ? " (checklist incomplete)" : ""}
          </button>
          <button disabled={pending} onClick={() => decide("changes_requested")} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-amber font-semibold text-ink disabled:opacity-60"><MessageSquareWarning className="size-4" />Request changes</button>
          <button disabled={pending} onClick={() => decide("rejected")} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-maroon font-semibold text-white disabled:opacity-60"><X className="size-4" />Reject</button>
          <button disabled={pending} onClick={() => decide("note")} className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-line-2 text-sm font-semibold disabled:opacity-60"><StickyNote className="size-4" />Save note only</button>
          <button disabled={pending || status !== "approved"} onClick={() => decide("suspended")} className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-line-2 text-sm font-semibold disabled:opacity-40"><Ban className="size-4" />Suspend</button>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-3xl border border-line bg-white p-5">
        <h2 className="font-display text-xl font-bold">History</h2>
        <ol className="relative flex flex-col gap-4 border-s-2 border-line ps-5">
          {history.map((h) => (
            <motion.li key={h.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="relative text-sm">
              <span className={clsx("absolute -start-[27px] top-0.5 size-3.5 rounded-full border-2 border-white", h.action === "approved" ? "bg-emerald-600" : h.action === "rejected" || h.action === "suspended" ? "bg-maroon" : h.action === "changes_requested" ? "bg-amber" : "bg-pine")} />
              <b>{ACTION_LABEL[h.action]}</b> · {h.by}
              <span className="block text-xs text-muted">{new Date(h.at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</span>
              {h.note ? <p className="mt-1 rounded-lg bg-ground p-2 text-ink-2">{h.note}</p> : null}
            </motion.li>
          ))}
        </ol>
      </section>
    </div>
  );
}

"use client";
import { useState, useTransition } from "react";
import { clsx } from "clsx";
import { Check, X } from "lucide-react";
import type { EventItem, Job, ListingStatus } from "@/lib/types";
import { moderateCommunity } from "@/lib/actions/admin";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "./Toast";

type Row = { id: string; title: string; sub: string; body: string; status: ListingStatus; kind: "events" | "jobs" };

export function CommunityModeration({ events, jobs }: { events: EventItem[]; jobs: Job[] }) {
  const [tab, setTab] = useState<"events" | "jobs">("jobs");
  const [rows, setRows] = useState<Row[]>([
    ...events.map((e) => ({ id: e.id, title: e.title, sub: `${e.date ? new Date(e.date).toLocaleDateString("en-GB") : "Date TBA"} · ${e.where}`, body: e.description, status: e.status, kind: "events" as const })),
    ...jobs.map((j) => ({ id: j.id, title: j.title, sub: `${j.employer} · ${j.type} · ${j.contact}`, body: j.description, status: j.status, kind: "jobs" as const })),
  ]);
  const [, start] = useTransition();
  const toast = useToast();
  const act = (r: Row, status: ListingStatus) => start(async () => {
    const res = await moderateCommunity(r.kind, r.id, r.title, status);
    toast(res);
    if (res.ok) setRows((x) => x.map((y) => (y.id === r.id ? { ...y, status } : y)));
  });
  const shown = rows.filter((r) => r.kind === tab).sort((a, b) => Number(b.status === "pending") - Number(a.status === "pending"));
  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" className="flex gap-2">
        {(["jobs", "events"] as const).map((k) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={clsx("rounded-full border px-5 py-2.5 font-semibold capitalize", tab === k ? "border-ink bg-ink text-ground" : "border-line-2 bg-white")}>
            {k} <span className="ms-1 rounded-full bg-amber px-1.5 font-mono text-xs text-ink">{rows.filter((r) => r.kind === k && r.status === "pending").length}</span>
          </button>
        ))}
      </div>
      <ul className="grid gap-3 lg:grid-cols-2">
        {shown.map((r) => (
          <li key={r.id} className={clsx("flex flex-col gap-3 rounded-3xl border bg-white p-5", r.status === "pending" ? "border-amber" : "border-line")}>
            <div className="flex items-start justify-between gap-3"><div><b className="font-display text-xl">{r.title}</b><span className="block text-sm text-muted">{r.sub}</span></div><StatusBadge status={r.status} /></div>
            <p className="text-ink-2">{r.body}</p>
            <div className="flex gap-2">
              <button onClick={() => act(r, "approved")} className="flex items-center gap-1.5 rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"><Check className="size-4" />Approve</button>
              <button onClick={() => act(r, "rejected")} className="flex items-center gap-1.5 rounded-full border border-line-2 px-4 py-2 text-sm font-semibold"><X className="size-4" />Reject</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

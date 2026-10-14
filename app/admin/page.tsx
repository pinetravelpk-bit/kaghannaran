import Link from "next/link";
import { AlertTriangle, ArrowUpRight, Clock, ClipboardCheck, Building, UserRoundCheck, Construction } from "lucide-react";
import { getActivity, getBusinessTypes, getListings, getStops } from "@/lib/data";
import { getRoadLive } from "@/lib/road";
import { isDemo } from "@/lib/supabase/config";
import { SAMPLE_SUBMISSION_TREND } from "@/lib/seed";
import { AdminHeader, Card, ago, hoursSince } from "@/components/admin/ui";
import { SubmissionsChart, TypeDonut, StopBars } from "@/components/admin/Charts";
import { StatusBadge, RoadBadge } from "@/components/ui/StatusBadge";
import { Icon } from "@/components/ui/Icon";
import { Counter } from "@/components/ui/Counter";
import { Reveal } from "@/components/ui/Reveal";
import type { Listing } from "@/lib/types";

export const metadata = { title: "Dashboard" };

function weekly(listings: Listing[]) {
  const weeks: { week: string; submitted: number; approved: number }[] = [];
  const now = Date.now();
  for (let i = 8; i >= 0; i--) {
    const start = now - (i + 1) * 7 * 864e5, end = now - i * 7 * 864e5;
    const inRange = (iso: string) => { const t = new Date(iso).getTime(); return t >= start && t < end; };
    weeks.push({
      week: new Date(end).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      submitted: listings.filter((l) => inRange(l.submittedAt)).length,
      approved: listings.filter((l) => l.history.some((h) => h.action === "approved" && inRange(h.at))).length,
    });
  }
  return weeks;
}

export default async function AdminHome() {
  const [all, types, stops, road, activity] = await Promise.all([getListings({ status: "all" }), getBusinessTypes(), getStops(), getRoadLive(), getActivity(8)]);
  const pending = all.filter((l) => l.status === "pending").sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
  const approved = all.filter((l) => l.status === "approved");
  const guides = all.filter((l) => l.type === "tour-guide");
  const overdue = pending.filter((l) => hoursSince(l.submittedAt) > 48).length;
  const reviewHours = all.flatMap((l) => {
    const sub = l.history.find((h) => h.action === "submitted");
    const dec = l.history.find((h) => ["approved", "rejected", "changes_requested"].includes(h.action));
    return sub && dec ? [(new Date(dec.at).getTime() - new Date(sub.at).getTime()) / 36e5] : [];
  });
  const avgReview = reviewHours.length ? Math.round(reviewHours.reduce((a, b) => a + b, 0) / reviewHours.length) : 0;
  const byType = types.map((t) => ({ name: t.name, value: approved.filter((l) => l.type === t.slug).length })).filter((x) => x.value).sort((a, b) => b.value - a.value);
  const byStop = stops.map((s) => ({ name: s.name, value: all.filter((l) => l.stop === s.slug && l.status === "approved").length }));
  const funnel = (["pending", "changes_requested", "approved", "rejected", "suspended"] as const).map((s) => ({ s, n: all.filter((l) => l.status === s).length }));
  const tBy = Object.fromEntries(types.map((t) => [t.slug, t]));

  const kpis = [
    { label: "Waiting for review", n: pending.length, I: ClipboardCheck, tone: "bg-amber text-ink", href: "/admin/approvals" },
    { label: "Live listings", n: approved.length, I: Building, tone: "bg-pine text-ground", href: "/admin/listings?status=approved" },
    { label: "Tour guides", n: guides.length, I: UserRoundCheck, tone: "bg-white text-ink border border-line", href: "/admin/guides" },
    { label: "Avg. hours to decision", n: avgReview, I: Clock, tone: "bg-white text-ink border border-line", href: "/admin/activity" },
  ];

  return (
    <>
      <AdminHeader title="Dashboard" sub={`${new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} · valley overview`} actions={<Link href="/admin/approvals" className="flex items-center gap-2 rounded-full bg-ink px-5 py-3 font-semibold text-ground">Start reviewing <ArrowUpRight className="size-4" /></Link>} />

      {overdue ? (
        <Reveal className="flex flex-wrap items-center gap-3 rounded-2xl bg-[#FBEBC8] px-5 py-4 text-[#5A3A06]">
          <AlertTriangle className="size-5" /> <b>{overdue} submission{overdue > 1 ? "s" : ""}</b> waiting more than 48 hours.
          <Link href="/admin/approvals?sort=oldest" className="ms-auto font-semibold underline">Review oldest first</Link>
        </Reveal>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <Reveal key={k.label} delay={i * 0.06}>
            <Link href={k.href} className={`group flex h-full flex-col gap-6 rounded-3xl p-5 transition hover:-translate-y-0.5 hover:shadow-lg ${k.tone}`}>
              <span className="flex items-center justify-between"><k.I className="size-6" /><ArrowUpRight className="size-4 opacity-0 transition group-hover:opacity-100" /></span>
              <span><Counter to={k.n} className="font-display text-5xl font-extrabold tracking-tight" /><span className="block text-sm opacity-80">{k.label}</span></span>
            </Link>
          </Reveal>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card title="Submissions vs approvals" action={<span className="font-mono text-xs text-muted">{isDemo ? "SAMPLE TREND" : "LAST 9 WEEKS"}</span>}>
          <SubmissionsChart data={isDemo ? SAMPLE_SUBMISSION_TREND : weekly(all)} />
        </Card>
        <Card title="Live listings by type"><TypeDonut data={byType} /></Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card title="Queue — oldest first" action={<Link href="/admin/approvals" className="text-sm font-semibold text-maroon">Open queue →</Link>}>
          <ul className="flex flex-col">
            {pending.slice(0, 6).map((l) => {
              const h = hoursSince(l.submittedAt);
              const docsReq = tBy[l.type]?.documents.filter((d) => d.required).length ?? 0;
              const docsHave = l.documents.filter((d) => tBy[l.type]?.documents.find((x) => x.key === d.key)?.required).length;
              return (
                <li key={l.id}>
                  <Link href={`/admin/approvals/${l.id}`} className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 border-t border-line py-3 hover:bg-ground">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-ground text-pine"><Icon name={tBy[l.type]?.icon ?? "Store"} className="size-5" /></span>
                    <span className="min-w-0"><span className="block truncate font-semibold">{l.name}</span><span className="text-sm text-muted">{tBy[l.type]?.name} · docs {docsHave}/{docsReq}</span></span>
                    <span className={`rounded-full px-2.5 py-1 font-mono text-xs ${h > 48 ? "bg-red-100 text-red-900" : h > 24 ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"}`}>{ago(l.submittedAt)}</span>
                  </Link>
                </li>
              );
            })}
            {!pending.length ? <li className="rounded-2xl bg-sage p-6 text-center font-semibold">Queue is clear 🎉</li> : null}
          </ul>
        </Card>
        <Card title="Status funnel">
          <ul className="flex flex-col gap-3">
            {funnel.map(({ s, n }) => (
              <li key={s} className="flex flex-col gap-1.5">
                <span className="flex items-center justify-between"><StatusBadge status={s} /><span className="font-mono">{n}</span></span>
                <span className="h-2.5 overflow-hidden rounded-full bg-ground"><span className="block h-full rounded-full bg-pine" style={{ width: `${(n / Math.max(1, all.length)) * 100}%` }} /></span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card title="Live listings per stop"><StopBars data={byStop} /></Card>
        <div className="flex flex-col gap-4">
          <Card title="Road status" action={<Link href="/admin/road" className="text-sm font-semibold text-maroon">Update →</Link>} className="bg-board text-ground [&_h2]:text-ground">
            <ul className="font-mono text-sm">
              {road.map((r) => <li key={r.id} className="flex items-center justify-between gap-2 border-t border-[#1C3330] py-2"><span className="truncate">{r.segment}</span><RoadBadge status={r.status} /></li>)}
            </ul>
            <span className="flex items-center gap-1.5 text-xs text-fog"><Construction className="size-3.5" />Last updated {ago(road.reduce((a, r) => (r.checkedAt > a ? r.checkedAt : a), road[0]?.checkedAt ?? new Date().toISOString()))}</span>
          </Card>
          <Card title="Recent activity" action={<Link href="/admin/activity" className="text-sm font-semibold text-maroon">All →</Link>}>
            <ol className="relative flex flex-col gap-3 border-s-2 border-line ps-4">
              {activity.map((a) => <li key={a.id} className="text-sm"><span className="absolute -start-[7px] mt-1.5 size-3 rounded-full border-2 border-white bg-amber" /><b>{a.actor}</b> {a.action} <span className="text-ink-2">{a.target}</span> <span className="block text-xs text-muted">{ago(a.at)}</span></li>)}
            </ol>
          </Card>
        </div>
      </div>
    </>
  );
}

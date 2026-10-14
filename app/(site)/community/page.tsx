import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { getEvents, getJobs, getStops } from "@/lib/data";
import { PageHero } from "@/components/site/PageHero";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { photo } from "@/lib/media";

export const metadata = pageMeta({ title: "Jobs and events in Kaghan Valley", description: "Seasonal jobs at hotels, restaurants and tour companies, and events across Kaghan Valley, from Balakot to Naran and Babusar Top.", path: "/community" });

export default async function CommunityPage() {
  const [events, jobs, stops] = await Promise.all([getEvents(), getJobs(), getStops()]);
  const sn = (s: string) => stops.find((x) => x.slug === s)?.name ?? "";
  return (
    <>
      <PageHero kicker="Community" title="Jobs and events in Kaghan Valley" sub="Seasonal work at hotels and restaurants, jeep and guide jobs, festivals, market days and clean-up drives. Every post is checked before it goes live." image={photo("food")}>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/community/post?kind=job" className="rounded-full bg-amber px-6 py-3 font-semibold text-ink">Post a job</Link>
          <Link href="/community/post?kind=event" className="rounded-full border-2 border-ground px-6 py-2.5 font-semibold">Submit an event</Link>
        </div>
      </PageHero>
      <section className="px-4 py-14 md:px-6">
        <div className="mx-auto grid max-w-[1320px] gap-10 lg:grid-cols-2">
          <div id="jobs" className="flex flex-col gap-4">
            <h2 className="font-display text-4xl font-extrabold">Jobs</h2>
            {jobs.length ? null : <p className="rounded-2xl bg-sage p-5 text-ink-2">No jobs posted yet. Hotels, restaurants, jeep operators and tour companies can post seasonal jobs here for free.</p>}
            <Stagger className="flex flex-col gap-3">
              {jobs.map((j) => (
                <StaggerItem key={j.id} className="flex flex-col gap-2 rounded-2xl border border-line bg-white p-5">
                  <span className="flex flex-wrap items-baseline justify-between gap-2"><span className="font-display text-xl font-bold">{j.title}</span><span className="rounded-full bg-sage px-3 py-1 font-mono text-xs">{j.type}</span></span>
                  <span className="text-muted">{j.employer} · {sn(j.stop)}{j.salary ? ` · ${j.salary}` : ""}</span>
                  <span className="text-ink-2">{j.description}</span>
                  <span className="text-sm font-semibold text-maroon">Apply: {j.contact}</span>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
          <div id="events" className="flex flex-col gap-4">
            <h2 className="font-display text-4xl font-extrabold">Events</h2>
            <Stagger className="flex flex-col gap-3">
              {events.map((e) => {
                const dt = e.date ? new Date(e.date) : null;
                return (
                  <StaggerItem key={e.id} className="flex gap-4 rounded-2xl border border-line bg-white p-5">
                    <span className="flex size-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-pine font-mono text-ground">
                      <span className="text-xs text-signal">{dt ? dt.toLocaleString("en-US", { month: "short" }).toUpperCase() : "TBA"}</span>
                      <span className="text-2xl font-semibold">{dt ? dt.getDate() : "-"}</span>
                    </span>
                    <span className="flex flex-col gap-1"><span className="font-display text-xl font-bold">{e.title}</span><span className="text-muted">{e.where}</span><span className="text-ink-2">{e.description}</span></span>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </div>
        </div>
      </section>
    </>
  );
}

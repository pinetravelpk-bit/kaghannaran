import { breadcrumbs, faqPage, graph, pageMeta } from "@/lib/seo";
import { roadFaq } from "@/lib/faq";
import { JsonLd } from "@/components/seo/JsonLd";
import { Faq } from "@/components/seo/Faq";
import { clsx } from "clsx";
import { getWeather } from "@/lib/weather";
import { getRoadLive, googleConnected } from "@/lib/road";
import { PageHero } from "@/components/site/PageHero";
import { RoadBadge } from "@/components/ui/StatusBadge";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { photo } from "@/lib/media";
import { Thermometer, Wind, TriangleAlert, Info, Radio, UserRoundCheck, Snowflake } from "lucide-react";

export const metadata = pageMeta({ title: "Naran and Babusar road status today, with weather", description: "Is the N-15 open today? Hourly road status from Balakot to Naran, Babusar Top and Chilas, with live weather for Naran, Kaghan, Shogran, Saif-ul-Malook and Babusar.", path: "/road" });
export const revalidate = 600;

const fmt = (iso: string) => new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Karachi" });
const ADVISORY = { info: "bg-sage text-ink", warning: "bg-amber/25 text-ink", danger: "bg-maroon text-white" } as const;

export default async function RoadPage() {
  const [road, weather] = await Promise.all([getRoadLive(), getWeather()]);
  const how = googleConnected
    ? "Checked automatically every hour from Google Maps live traffic, the weather forecast and the pass season, and confirmed by our team when they have local reports."
    : "Checked automatically from the weather forecast and the pass season, and updated by our team from local reports.";
  const faq = roadFaq(road);
  return (
    <>
      <JsonLd data={graph(breadcrumbs([["Road status and weather", "/road"]]), faqPage(faq))} />
      <PageHero kicker="Live info · N-15" title="Kaghan Naran road status and weather today" sub={`${how} Weather is a live forecast from Open-Meteo.`} image={photo("naranWinter")} />
      <section className="px-4 py-14 md:px-6">
        <div className="mx-auto grid max-w-[1320px] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Reveal className="self-start rounded-3xl bg-board p-6 font-mono text-ground">
            <h2 className="mb-2 text-sm font-semibold tracking-[0.16em] text-signal">N-15 · BALAKOT → CHILAS</h2>
            <ul>
              {road.map((r) => (
                <li key={r.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-[#1C3330] py-4">
                  <span className="flex flex-col gap-0.5">
                    <span className="font-semibold uppercase">{r.segment}</span>
                    <span className="text-xs text-[#9FB3AF]">{r.note}</span>
                    <span className="flex items-center gap-1.5 text-[11px] text-[#5E7571]">
                      {r.source === "auto" ? <Radio className="size-3" aria-hidden /> : <UserRoundCheck className="size-3" aria-hidden />}
                      {r.source === "auto" ? "Live check" : "Our team"} · {fmt(r.checkedAt)}
                    </span>
                  </span>
                  <RoadBadge status={r.status} />
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[11px] leading-relaxed text-[#7F9893]">Conditions in the mountains change fast. Always confirm locally before crossing Babusar Top.{googleConnected ? " Traffic data © Google." : ""}</p>
          </Reveal>
          <div id="weather" className="flex flex-col gap-3">
            <Stagger className="grid gap-3 sm:grid-cols-2">
              {weather.map((w) => (
                <StaggerItem key={w.slug} className="flex h-full flex-col gap-3 rounded-3xl border border-line bg-white p-5">
                  <span className="flex items-baseline justify-between"><span className="font-display text-2xl font-bold">{w.name}</span><span className="font-mono text-xs text-muted">{w.alt.toLocaleString("en-US")} m</span></span>
                  <span className="flex items-end gap-3">
                    <span className="font-display text-6xl font-extrabold">{w.temp !== undefined ? `${Math.round(w.temp)}°` : "-"}</span>
                    <span className="pb-2 text-muted">{w.label}{w.overridden ? <span className="ms-1.5 rounded-full bg-sage px-2 py-0.5 text-[11px] font-semibold text-ink">local report</span> : null}</span>
                  </span>
                  <span className="flex gap-4 text-sm text-muted">
                    <span className="flex items-center gap-1"><Wind className="size-4" />{w.wind !== undefined ? `${Math.round(w.wind)} km/h` : "-"}</span>
                    {Math.round(w.snowTodayCm ?? 0) >= 1 ? <span className="flex items-center gap-1"><Snowflake className="size-4" />{Math.round(w.snowTodayCm ?? 0)} cm snow today</span> : null}
                  </span>
                  {w.advisory ? (
                    <span className={clsx("flex items-start gap-2 rounded-2xl px-3 py-2.5 text-sm", ADVISORY[w.advisoryLevel])}>
                      {w.advisoryLevel === "info" ? <Info className="mt-0.5 size-4 shrink-0" /> : <TriangleAlert className="mt-0.5 size-4 shrink-0" />}
                      {w.advisory}
                    </span>
                  ) : null}
                  {w.days ? (
                    <span className="mt-auto grid grid-cols-4 gap-1.5 border-t border-line pt-3 text-center text-xs">
                      {w.days.map((d) => (
                        <span key={d.date} className="flex flex-col gap-0.5 rounded-xl bg-ground py-2">
                          <span className="font-semibold">{new Date(d.date).toLocaleDateString("en-US", { weekday: "short" })}</span>
                          <span className="font-mono">{Math.round(d.max)}° / {Math.round(d.min)}°</span>
                        </span>
                      ))}
                    </span>
                  ) : <span className="mt-auto flex items-center gap-1.5 text-sm text-muted"><Thermometer className="size-4" />Forecast unavailable right now.</span>}
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>
      <section className="px-4 pb-16 md:px-6">
        <div className="mx-auto max-w-[1320px]"><Faq items={faq} title="Road questions" /></div>
      </section>
    </>
  );
}

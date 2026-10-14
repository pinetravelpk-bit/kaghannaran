import { getRoad } from "@/lib/data";
import { getWeather, weatherLabel } from "@/lib/weather";
import { PageHero } from "@/components/site/PageHero";
import { RoadBadge } from "@/components/ui/StatusBadge";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { photo } from "@/lib/media";
import { Thermometer, Wind } from "lucide-react";

export const metadata = { title: "Road status & weather" };
export const revalidate = 600;

export default async function RoadPage() {
  const [road, weather] = await Promise.all([getRoad(), getWeather()]);
  return (
    <>
      <PageHero kicker="Live info" title="Road & weather, before you drive." sub="Road status is updated by our team from local reports. Weather is a live forecast from Open-Meteo." image={photo("naranWinter")} />
      <section className="px-4 py-14 md:px-6">
        <div className="mx-auto grid max-w-[1320px] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Reveal className="rounded-3xl bg-board p-6 font-mono text-ground">
            <h2 className="mb-2 text-sm font-semibold tracking-[0.16em] text-signal">N-15 · BALAKOT → CHILAS</h2>
            <ul>
              {road.map((r) => (
                <li key={r.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-[#1C3330] py-4">
                  <span className="flex flex-col"><span className="font-semibold uppercase">{r.segment}</span><span className="text-xs text-[#7F9893]">{r.note}</span><span className="text-[11px] text-[#5E7571]">Updated {new Date(r.updatedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Karachi" })}</span></span>
                  <RoadBadge status={r.status} />
                </li>
              ))}
            </ul>
          </Reveal>
          <div id="weather" className="flex flex-col gap-3">
            <Stagger className="grid gap-3 sm:grid-cols-2">
              {weather.map((w) => (
                <StaggerItem key={w.slug} className="flex h-full flex-col gap-3 rounded-3xl border border-line bg-white p-5">
                  <span className="flex items-baseline justify-between"><span className="font-display text-2xl font-bold">{w.name}</span><span className="font-mono text-xs text-muted">{w.alt.toLocaleString("en-US")} m</span></span>
                  <span className="flex items-end gap-3"><span className="font-display text-6xl font-extrabold">{w.temp !== undefined ? `${Math.round(w.temp)}°` : "—"}</span><span className="pb-2 text-muted">{weatherLabel(w.code)}</span></span>
                  <span className="flex gap-4 text-sm text-muted"><span className="flex items-center gap-1"><Wind className="size-4" />{w.wind !== undefined ? `${Math.round(w.wind)} km/h` : "—"}</span></span>
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
    </>
  );
}

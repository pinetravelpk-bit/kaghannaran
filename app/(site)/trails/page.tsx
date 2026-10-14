import { getStops, getTrails } from "@/lib/data";
import { PageHero } from "@/components/site/PageHero";
import { TrailsTable } from "@/components/site/TrailsTable";
import { Reveal } from "@/components/ui/Reveal";
import { photo } from "@/lib/media";
import { Counter } from "@/components/ui/Counter";

export const metadata = { title: "Jeep tracks & hiking trails" };

export default async function TrailsPage() {
  const [trails, stops] = await Promise.all([getTrails(), getStops()]);
  const by = (m: string) => trails.filter((t) => t.mode === m).length;
  return (
    <>
      <PageHero kicker="Jeep tracks & hikes" title="Where the road ends." sub="Times come from visitor reports — always ask locally about conditions, start early, and hire a registered jeep or guide." image={photo("jeeps")} />
      <section className="px-4 py-14 md:px-6">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-8">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {["Jeep", "Hike", "Trek", "Walk"].map((m) => (
              <Reveal key={m} className="rounded-2xl border border-line bg-white p-5"><Counter to={by(m)} className="font-display text-5xl font-extrabold text-maroon" /><span className="block text-muted">{m} routes</span></Reveal>
            ))}
          </div>
          <Reveal className="rounded-3xl border border-line bg-white p-6"><TrailsTable trails={trails} stops={stops} /></Reveal>
          <Reveal className="grid gap-3 rounded-3xl bg-pine p-6 text-ground md:grid-cols-3">
            {[["Start early", "Ansoo Lake: don’t start after 9 am. Paye: arrive before 2 pm."], ["Hire local", "Shogran, Siri and Maidan tracks are steep — use a local 4x4 and driver."], ["Carry supplies", "Danna Meadows, Noori Top and Ghanool have no shops or facilities."]].map(([h, p]) => (
              <div key={h} className="flex flex-col gap-1 rounded-2xl bg-pine-2 p-5"><span className="font-display text-xl font-bold text-signal">{h}</span><span className="text-mist">{p}</span></div>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  );
}

import Link from "next/link";
import { getStops } from "@/lib/data";
import { PageHero } from "@/components/site/PageHero";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { Photo } from "@/components/ui/Photo";
import { photo } from "@/lib/media";

export const metadata = { title: "Places from Balakot to Babusar Top" };

export default async function PlacesPage() {
  const stops = await getStops();
  const total = stops.reduce((a, s) => a + s.places.length, 0);
  return (
    <>
      <PageHero kicker={`${stops.length} stops · ${total} places`} title="Every visiting place in the valley." sub="Waterfalls, lakes, meadows, viewpoints and trailheads, in road order from Balakot up to Babusar Top." image={photo("naranAerial")} />
      <section className="px-4 py-16 md:px-6">
        <Stagger className="mx-auto grid max-w-[1320px] gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stops.map((s) => (
            <StaggerItem key={s.slug}>
              <Link href={`/places/${s.slug}`} className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white transition hover:-translate-y-1 hover:shadow-xl">
                <span className="relative block aspect-[16/10]">
                  <Photo src={s.image} alt={s.name} className="h-full w-full [&_img]:transition [&_img]:duration-700 group-hover:[&_img]:scale-110" />
                  <span className="absolute top-3 left-3 rounded-full bg-ink/85 px-3 py-1.5 font-mono text-xs text-signal">STOP {String(s.order).padStart(2, "0")}</span>
                  {s.sideTrip ? <span className="absolute top-3 right-3 rounded-full bg-white px-3 py-1.5 text-xs font-semibold">Side trip</span> : null}
                </span>
                <span className="flex flex-1 flex-col gap-2 p-5">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-display text-2xl font-bold">{s.name}</span>
                    {s.nameUr ? <span className="font-urdu text-muted" lang="ur">{s.nameUr}</span> : null}
                  </span>
                  <span className="text-sm text-ink-2">{s.desc}</span>
                  <span className="mt-auto flex flex-wrap gap-1.5 pt-3">
                    {s.places.slice(0, 4).map((p) => <span key={p.name} className="rounded-full bg-ground px-2.5 py-1 text-xs">{p.name}</span>)}
                    {s.places.length > 4 ? <span className="rounded-full bg-ground px-2.5 py-1 text-xs font-semibold">+{s.places.length - 4}</span> : null}
                  </span>
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { TriangleAlert, ArrowLeft, ArrowRight } from "lucide-react";
import { getBusinessTypes, getListings, getStops, getTrails } from "@/lib/data";
import { PageHero } from "@/components/site/PageHero";
import { Stagger, StaggerItem, Reveal } from "@/components/ui/Reveal";
import { ListingCard } from "@/components/site/ListingCard";
import { TrailsTable } from "@/components/site/TrailsTable";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = (await getStops()).find((x) => x.slug === slug);
  return { title: s ? `${s.name} — places, hotels & services` : "Place" };
}

export default async function StopPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [stops, listings, types, trails] = await Promise.all([getStops(), getListings({ stop: slug }), getBusinessTypes(), getTrails()]);
  const i = stops.findIndex((s) => s.slug === slug);
  if (i < 0) notFound();
  const s = stops[i];
  const prev = stops[i - 1], next = stops[i + 1];
  const tBy = Object.fromEntries(types.map((x) => [x.slug, x]));
  const myTrails = trails.filter((x) => x.stop === slug);
  return (
    <>
      <PageHero kicker={`Stop ${String(s.order).padStart(2, "0")} of ${stops.length} · ${s.sideTrip ? "Side trip · " : ""}${s.kind}${s.altitude ? ` · ≈ ${s.altitude.toLocaleString("en-US")} m` : ""}`} title={s.name} sub={s.desc} image={s.image}>
        {s.nameUr ? <span className="font-urdu text-2xl text-mist" lang="ur">{s.nameUr}</span> : null}
      </PageHero>
      <section className="px-4 py-16 md:px-6">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-8">
          <h2 className="font-display text-4xl font-extrabold tracking-tight">Places to visit</h2>
          <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {s.places.map((p) => (
              <StaggerItem key={p.name} className="flex h-full flex-col gap-2 rounded-2xl border border-line bg-white p-5">
                <span className="flex items-start justify-between gap-2">
                  <span className="font-display text-xl font-semibold">{p.name}</span>
                  {p.isNew ? <span className="rounded-md bg-amber px-2 py-1 font-mono text-[10px] font-semibold tracking-widest">NEW</span> : null}
                </span>
                {p.note ? <span className="text-ink-2">{p.note}</span> : null}
                {p.warning ? <span className="mt-auto flex gap-2 rounded-xl bg-[#FBEBC8] px-3 py-2 text-sm font-medium text-[#5A3A06]"><TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />{p.warning}</span> : null}
              </StaggerItem>
            ))}
          </Stagger>

          {myTrails.length ? (
            <Reveal className="flex flex-col gap-4 rounded-3xl border border-line bg-white p-6">
              <h2 className="font-display text-3xl font-extrabold">Jeep tracks & hikes from here</h2>
              <TrailsTable trails={myTrails} stops={stops} />
            </Reveal>
          ) : null}

          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-display text-4xl font-extrabold tracking-tight">Hotels, food & services in {s.name}</h2>
              <Link href={`/directory?stop=${s.slug}`} className="font-semibold text-maroon">Search {s.name} →</Link>
            </div>
            {listings.length ? (
              <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {listings.map((l) => <StaggerItem key={l.id}><ListingCard l={l} type={tBy[l.type]} stop={s} /></StaggerItem>)}
              </Stagger>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-sage p-6">
                <p className="text-lg">No approved listings here yet. Run a business in {s.name}?</p>
                <Link href="/list-your-business" className="rounded-full bg-ink px-6 py-3 font-semibold text-ground">List it free</Link>
              </div>
            )}
          </div>

          <nav aria-label="Stops" className="flex flex-wrap justify-between gap-3 border-t border-line pt-8">
            {prev ? <Link href={`/places/${prev.slug}`} className="flex items-center gap-2 rounded-full border border-line-2 px-5 py-3 font-semibold"><ArrowLeft className="size-4 rtl:rotate-180" />{prev.name}</Link> : <span />}
            {next ? <Link href={`/places/${next.slug}`} className="flex items-center gap-2 rounded-full bg-ink px-5 py-3 font-semibold text-ground">{next.name}<ArrowRight className="size-4 rtl:rotate-180" /></Link> : null}
          </nav>
        </div>
      </section>
    </>
  );
}

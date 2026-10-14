import Link from "next/link";
import { notFound } from "next/navigation";
import { TriangleAlert, ArrowLeft, ArrowRight } from "lucide-react";
import { getBusinessTypes, getListings, getStops, getTrails } from "@/lib/data";
import { PageHero } from "@/components/site/PageHero";
import { Stagger, StaggerItem, Reveal } from "@/components/ui/Reveal";
import { ListingCard } from "@/components/site/ListingCard";
import { TrailsTable } from "@/components/site/TrailsTable";
import { JsonLd } from "@/components/seo/JsonLd";
import { Faq } from "@/components/seo/Faq";
import { breadcrumbs, faqPage, graph, pageMeta, stopPlace } from "@/lib/seo";
import { stopFaq } from "@/lib/faq";
import { stopGeo, stopPoint } from "@/lib/geo";
import { getStop } from "@/lib/seed/stops";
import { MapPin, Mountain, Route } from "lucide-react";


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = (await getStops()).find((x) => x.slug === slug) ?? getStop(slug);
  if (!s) return { title: "Place not found" };
  const g = stopGeo(s.slug);
  const height = s.altitude ?? g?.ele;
  const facts = [height ? `about ${height.toLocaleString("en-US")} m high` : "", g && s.slug !== "balakot" ? `${Math.round(g.km)} km from Balakot on the N-15` : ""].filter(Boolean).join(", ");
  return pageMeta({
    title: `${s.name}: height, distance and things to do`,
    description: `${s.desc}${facts ? ` ${s.name} is ${facts}.` : ""} ${s.places.length} places to visit, trails, road status and services.`.slice(0, 300),
    path: `/places/${s.slug}`,
    image: s.image,
  });
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
  const g = stopGeo(s.slug), pt = stopPoint(s.slug);
  const height = s.altitude ?? g?.ele;
  const faq = stopFaq(s, stops);
  return (
    <>
      <JsonLd data={graph(stopPlace(s, pt ? { ...pt, ele: height } : undefined), breadcrumbs([["Places", "/places"], [s.name, `/places/${s.slug}`]]), ...(faq.length ? [faqPage(faq)] : []))} />
      <PageHero kicker={`Stop ${String(s.order).padStart(2, "0")} of ${stops.length} · ${s.sideTrip ? "Side trip · " : ""}${s.kind}${s.altitude ? ` · ≈ ${s.altitude.toLocaleString("en-US")} m` : ""}`} title={s.name} sub={s.desc} image={s.image}>
        {s.nameUr ? <span className="font-urdu text-2xl text-mist" lang="ur">{s.nameUr}</span> : null}
      </PageHero>
      <section className="px-4 py-16 md:px-6">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-8">
          <nav aria-label="Breadcrumb" className="text-sm text-muted"><Link href="/" className="hover:text-ink">Home</Link> / <Link href="/places" className="hover:text-ink">Places</Link> / <span className="text-ink">{s.name}</span></nav>
          <dl className="grid gap-3 sm:grid-cols-3">
            {height ? <div className="flex items-center gap-3 rounded-2xl bg-sage p-4"><Mountain className="size-6 text-pine" aria-hidden /><div><dt className="text-sm text-muted">Height</dt><dd className="font-display text-2xl font-bold">{height.toLocaleString("en-US")} m</dd></div></div> : null}
            {g ? <div className="flex items-center gap-3 rounded-2xl bg-sage p-4"><Route className="size-6 text-pine" aria-hidden /><div><dt className="text-sm text-muted">From Balakot on the N-15</dt><dd className="font-display text-2xl font-bold">{Math.round(g.km)} km</dd></div></div> : null}
            {pt ? <div className="flex items-center gap-3 rounded-2xl bg-sage p-4"><MapPin className="size-6 text-pine" aria-hidden /><div><dt className="text-sm text-muted">Location{g ? "" : " (approximate)"}</dt><dd><a href={`https://www.google.com/maps/search/?api=1&query=${pt.lat},${pt.lon}`} target="_blank" rel="noreferrer" className="font-semibold text-maroon underline">{pt.lat.toFixed(3)}, {pt.lon.toFixed(3)} · Open in Google Maps</a></dd></div></div> : null}
          </dl>
          <h2 className="font-display text-4xl font-extrabold tracking-tight">Places to visit in {s.name}</h2>
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

          {faq.length ? <Faq items={faq} title={`${s.name}: questions people ask`} /> : null}

          <nav aria-label="Stops" className="flex flex-wrap justify-between gap-3 border-t border-line pt-8">
            {prev ? <Link href={`/places/${prev.slug}`} className="flex items-center gap-2 rounded-full border border-line-2 px-5 py-3 font-semibold"><ArrowLeft className="size-4 rtl:rotate-180" />{prev.name}</Link> : <span />}
            {next ? <Link href={`/places/${next.slug}`} className="flex items-center gap-2 rounded-full bg-ink px-5 py-3 font-semibold text-ground">{next.name}<ArrowRight className="size-4 rtl:rotate-180" /></Link> : null}
          </nav>
        </div>
      </section>
    </>
  );
}

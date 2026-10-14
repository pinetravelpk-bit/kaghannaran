import Link from "next/link";
import { ArrowRight, BadgeCheck, ClipboardCheck, FileUp, ShieldCheck, Briefcase, CalendarDays } from "lucide-react";
import { getDict } from "@/lib/i18n/server";
import { getBusinessTypes, getEvents, getJobs, getListings, getSettings, getStops, getTrails } from "@/lib/data";
import { getWeather } from "@/lib/weather";
import { getRoadLive } from "@/lib/road";
import { Hero } from "@/components/home/Hero";
import { RouteExplorer } from "@/components/home/RouteExplorer";
import { Infographic } from "@/components/home/Infographic";
import { Sights, PlaceMarquee } from "@/components/home/Sights";
import { Film } from "@/components/home/Film";
import { SectionHead } from "@/components/ui/SectionHead";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { ListingCard } from "@/components/site/ListingCard";
import { TrailsTable } from "@/components/site/TrailsTable";
import { JsonLd } from "@/components/seo/JsonLd";
import { Faq } from "@/components/seo/Faq";
import { abs, faqPage, graph, pageMeta, stopPlace, valley } from "@/lib/seo";
import { homeFaq } from "@/lib/faq";
import { stopPoint } from "@/lib/geo";
import { Phone } from "lucide-react";

export const revalidate = 300;

export const metadata = pageMeta({
  title: "Kaghan Naran Guide: Road Status, Weather, Places, Hotels",
  absoluteTitle: true,
  description: "Live N-15 road status, weather, a 3D map and a directory of places, hotels, guides and emergency numbers for Kaghan Valley, from Balakot and Naran to Babusar Top.",
  path: "/",
});

export default async function Home() {
  const { t } = await getDict();
  const [stops, trails, road, weather, types, listings, events, jobs, settings] = await Promise.all([
    getStops(), getTrails(), getRoadLive(), getWeather(), getBusinessTypes(), getListings(), getEvents(), getJobs(), getSettings(),
  ]);
  // businesses only; public service numbers have their own section
  const businesses = listings.filter((l) => !types.find((x) => x.slug === l.type)?.adminOnly);
  const featured = businesses.filter((l) => l.featured).concat(businesses.filter((l) => !l.featured)).slice(0, 6);
  const services = listings.filter((l) => types.find((x) => x.slug === l.type)?.adminOnly);
  const faq = homeFaq(stops);
  let n = 0;
  const num = () => String(++n).padStart(2, "0");
  const typeBySlug = Object.fromEntries(types.map((x) => [x.slug, x]));
  const stopBySlug = Object.fromEntries(stops.map((x) => [x.slug, x]));
  const groups = ["Stay", "Eat & shop", "Get around", "People", "Adventure", "Services"] as const;
  const countByType = listings.reduce<Record<string, number>>((a, l) => ({ ...a, [l.type]: (a[l.type] ?? 0) + 1 }), {});
  const allPlaceNames = stops.flatMap((s) => s.places.map((p) => p.name)).filter((n, i, a) => a.indexOf(n) === i).slice(0, 40);

  return (
    <>
      <JsonLd data={graph(
        valley(),
        faqPage(faq),
        { "@type": "ItemList", name: "Stops on the N-15 from Balakot to Babusar Top", itemListOrder: "https://schema.org/ItemListOrderAscending", itemListElement: stops.map((s, i) => ({ "@type": "ListItem", position: i + 1, item: stopPlace(s, stopPoint(s.slug)) })) },
      )} />
      <Hero t={t} stops={stops} road={road.map(({ auto: _a, ...r }) => r)} weather={weather.filter((w) => w.onHome).slice(0, 4).map((w) => ({ name: w.name, alt: w.alt, temp: w.temp, label: w.label, advisory: w.advisoryLevel !== "info" && !!w.advisory }))} />
      <PlaceMarquee names={allPlaceNames} />

      {/* 01 ROUTE */}
      <section id="route" className="px-4 pt-24 pb-12 md:px-6">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-9">
          <SectionHead num={num()} kicker={`${t.sections.route} · ${stops.length} stops`} title={t.sections.routeTitle} sub={t.sections.routeSub} />
          <Reveal><RouteExplorer stops={stops} labels={{ new: t.common.new, sideTrip: t.common.sideTrip, places: t.common.places }} /></Reveal>
        </div>
      </section>

      {/* 02 NUMBERS */}
      <section className="mt-12 bg-pine px-4 py-24 text-ground md:px-6">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-10">
          <SectionHead dark num={num()} kicker={t.sections.numbers} title={t.sections.numbersTitle} />
          <Infographic stops={stops} trails={trails.length} />
        </div>
      </section>

      {/* 03 DIRECTORY */}
      <section id="directory" className="px-4 py-24 md:px-6">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-9">
          <SectionHead num={num()} kicker={t.sections.directory} title={t.sections.directoryTitle} action={<Link href="/directory" className="border-b-2 border-ink pb-0.5 font-semibold">{t.common.viewAll} →</Link>} />
          <Stagger className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((g, gi) => {
              const items = types.filter((x) => x.group === g);
              const dark = gi === 2 || gi === 5;
              return (
                <StaggerItem key={g} className={`flex h-full flex-col gap-3 rounded-3xl p-6 ${dark ? "bg-pine text-ground" : "border border-line bg-white"}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-2xl font-extrabold tracking-tight">{g}</h3>
                    <span className="font-mono text-xs opacity-70">{String.fromCharCode(65 + gi)}</span>
                  </div>
                  <ul>
                    {items.map((it) => (
                      <li key={it.slug}>
                        <Link href={`/directory?type=${it.slug}`} className={`group flex items-center justify-between gap-3 border-t py-3 ${dark ? "border-[#2E4A45] text-ground" : "border-[#E2E6E0] text-ink"}`}>
                          <span className="flex items-center gap-3">
                            <span className={`flex size-10 items-center justify-center rounded-xl transition group-hover:scale-110 ${dark ? "bg-pine-2 text-signal" : "bg-ground text-pine"}`}><Icon name={it.icon} className="size-5" /></span>
                            <span className="flex flex-col"><span className="font-semibold">{it.name}</span><span className="text-[13px] opacity-75">{it.description}</span></span>
                          </span>
                          <span className="font-mono text-xs opacity-75">{countByType[it.slug] ?? 0}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* FEATURED BUSINESSES */}
      {featured.length ? <section className="px-4 pb-24 md:px-6">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-9">
          <SectionHead num={num()} kicker={t.sections.featured} title={t.sections.featuredTitle} action={<Link href="/directory" className="border-b-2 border-ink pb-0.5 font-semibold">{t.common.viewAll} →</Link>} />
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((l) => (
              <StaggerItem key={l.id}><ListingCard l={l} type={typeBySlug[l.type]} stop={stopBySlug[l.stop]} /></StaggerItem>
            ))}
          </Stagger>
        </div>
      </section> : null}

      {/* 05 SIGHTS */}
      <section id="sights" className="px-4 pb-24 md:px-6">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-9">
          <SectionHead num={num()} kicker={t.sections.sights} title={t.sections.sightsTitle} />
          <Sights />
        </div>
      </section>

      {/* 06 FILM */}
      <section className="px-4 pb-24 md:px-6">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-9">
          <SectionHead num={num()} kicker={t.sections.film} title={t.sections.filmTitle} />
          <Reveal><Film url={settings.heroVideoUrl} /></Reveal>
        </div>
      </section>

      {/* 07 TRAILS */}
      <section id="trails" className="border-y border-line bg-white px-4 py-24 md:px-6">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-9">
          <SectionHead num={num()} kicker={t.sections.trails} title={t.sections.trailsTitle} sub={t.sections.trailsSub} action={<Link href="/trails" className="rounded-full bg-ink px-6 py-3.5 font-semibold text-ground hover:bg-maroon">All {trails.length} routes</Link>} />
          <Reveal><TrailsTable trails={trails.slice(0, 8)} stops={stops} /></Reveal>
        </div>
      </section>

      {/* 08 SERVICES */}
      <section id="services" className="px-4 py-24 md:px-6">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-9">
          <SectionHead num={num()} kicker={t.sections.services} title={t.sections.servicesTitle} />
          <Stagger className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((l, i) => (
              <StaggerItem key={l.id}>
                <div className={`flex h-full flex-col gap-4 rounded-3xl p-6 ${i === 0 ? "bg-maroon text-white" : "border border-line bg-white"}`}>
                  <a href={`tel:${l.phone}`} className="flex items-center justify-between gap-3" aria-label={`Call ${l.name}`}>
                    <span className="font-display text-5xl font-extrabold">{l.phone}</span>
                    <span className={`flex size-12 items-center justify-center rounded-full ${i === 0 ? "bg-white text-maroon" : "bg-ink text-ground"}`}><Phone className="size-5" aria-hidden /></span>
                  </a>
                  <span className="flex flex-col gap-1">
                    <Link href={`/listing/${l.slug}`} className="text-lg font-semibold underline-offset-4 hover:underline">{l.name}</Link>
                    <span className={i === 0 ? "text-white/85" : "text-muted"}>{l.description}</span>
                  </span>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <Link href="/directory?type=police" className="self-start border-b-2 border-ink pb-0.5 font-semibold">Police, health and government services in the directory →</Link>
        </div>
      </section>

      {/* 09 COMMUNITY */}
      <section id="community" className="px-4 pb-24 md:px-6">
        <div className="mx-auto grid max-w-[1320px] gap-3.5 lg:grid-cols-2">
          <Reveal className="flex flex-col gap-4 rounded-3xl bg-pine p-7 text-ground">
            <div className="flex items-baseline justify-between"><h2 className="flex items-center gap-3 font-display text-4xl font-extrabold"><Briefcase className="size-7 text-signal" />{t.sections.jobs}</h2><Link href="/community#jobs" className="font-semibold text-signal">{t.common.viewAll} →</Link></div>
            {jobs.length ? null : <p className="border-t border-[#2E4A45] pt-4 text-fog">No jobs posted yet. Hotels, restaurants and tour companies can post seasonal jobs here for free.</p>}
            <ul>
              {jobs.slice(0, 4).map((j) => (
                <li key={j.id} className="flex items-center justify-between gap-4 border-t border-[#2E4A45] py-3.5">
                  <span className="flex flex-col"><span className="text-[17px] font-semibold">{j.title}</span><span className="text-sm text-fog">{j.employer} · {stopBySlug[j.stop]?.name}</span></span>
                  <span className="font-mono text-xs whitespace-nowrap text-signal uppercase">{j.type}</span>
                </li>
              ))}
            </ul>
            <Link href="/community/post?kind=job" className="self-start rounded-full border-2 border-ground px-5 py-2.5 font-semibold">Post a job</Link>
          </Reveal>
          <Reveal delay={0.1} className="flex flex-col gap-4 rounded-3xl border border-line bg-white p-7">
            <div className="flex items-baseline justify-between"><h2 className="flex items-center gap-3 font-display text-4xl font-extrabold"><CalendarDays className="size-7 text-maroon" />{t.sections.events}</h2><Link href="/community#events" className="font-semibold text-maroon">{t.common.viewAll} →</Link></div>
            <ul>
              {events.slice(0, 4).map((e) => {
                const dt = e.date ? new Date(e.date) : null;
                return (
                  <li key={e.id} className="flex items-center gap-4 border-t border-line py-3.5">
                    <span className="flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-ground font-mono leading-tight">
                      <span className="text-[11px] text-maroon">{dt ? dt.toLocaleString("en-US", { month: "short" }).toUpperCase() : "TBA"}</span>
                      <span className="text-lg font-semibold">{dt ? dt.getDate() : "-"}</span>
                    </span>
                    <span className="flex flex-col"><span className="text-[17px] font-semibold">{e.title}</span><span className="text-sm text-muted">{e.where}</span></span>
                  </li>
                );
              })}
            </ul>
            <Link href="/community/post?kind=event" className="self-start rounded-full border-2 border-ink px-5 py-2.5 font-semibold">Submit an event</Link>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <div className="px-4 pb-24 md:px-6">
        <div className="mx-auto max-w-[1320px]"><Faq items={faq} title="Kaghan Valley: questions people ask" /></div>
      </div>

      {/* CTA */}
      <section className="px-4 pb-24 md:px-6">
        <Reveal className="relative mx-auto max-w-[1320px] overflow-hidden rounded-[32px] bg-amber p-8 md:p-16">
          <svg aria-hidden className="absolute -right-10 -bottom-10 w-[620px] max-w-full opacity-20" viewBox="0 0 300 140" fill="none" stroke="#10201F" strokeWidth="1.4"><path d="M0 140 L60 60 L90 95 L150 20 L200 80 L230 55 L300 140" /><path d="M140 32 L150 20 L162 34" /></svg>
          <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <div className="flex flex-col gap-4">
              <span className="eyebrow">{t.sections.cta}</span>
              <h2 className="font-display text-4xl leading-none font-extrabold tracking-tight md:text-6xl">{t.sections.ctaTitle}</h2>
              <p className="max-w-xl text-lg">{t.sections.ctaSub}</p>
              <div className="mt-2 flex flex-wrap gap-3">
                <Link href="/list-your-business" className="flex items-center gap-2 rounded-full bg-ink px-7 py-4 font-semibold text-ground hover:bg-maroon">Add your business <ArrowRight className="size-4 rtl:rotate-180" /></Link>
                <Link href="/list-your-business#guides" className="rounded-full border-2 border-ink px-6 py-3.5 font-semibold">Register as a guide</Link>
              </div>
            </div>
            <ol className="grid gap-3">
              {[
                [FileUp, "Submit", "Pick your business type and fill in the form for it: rooms for hotels, routes for jeeps, areas for guides."],
                [ClipboardCheck, "We verify", "Our team calls you, checks documents and photos against a checklist for your type."],
                [BadgeCheck, "Go live", "Approved listings appear in search. Licensed businesses get a Verified badge."],
              ].map(([I, title, body], i) => {
                const C = I as typeof FileUp;
                return (
                  <li key={String(title)} className="flex gap-4 rounded-2xl bg-white/70 p-4 backdrop-blur">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-ink text-amber"><C className="size-5" /></span>
                    <span><span className="font-mono text-xs">STEP {i + 1}</span><span className="block font-display text-xl font-bold">{String(title)}</span><span className="text-sm text-ink-2">{String(body)}</span></span>
                  </li>
                );
              })}
            </ol>
          </div>
          <ShieldCheck aria-hidden className="absolute top-8 right-8 hidden size-10 opacity-30 md:block" />
        </Reveal>
      </section>
    </>
  );
}

import Link from "next/link";
import { ArrowRight, BadgeCheck, ClipboardCheck, FileUp, ShieldCheck, Briefcase, CalendarDays } from "lucide-react";
import { getDict } from "@/lib/i18n/server";
import { getBusinessTypes, getEvents, getJobs, getListings, getRoad, getSettings, getStops, getTrails } from "@/lib/data";
import { getWeather, weatherLabel } from "@/lib/weather";
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

export const revalidate = 300;

export default async function Home() {
  const { t } = await getDict();
  const [stops, trails, road, weather, types, listings, events, jobs, settings] = await Promise.all([
    getStops(), getTrails(), getRoad(), getWeather(), getBusinessTypes(), getListings(), getEvents(), getJobs(), getSettings(),
  ]);
  const featured = listings.filter((l) => l.featured).concat(listings.filter((l) => !l.featured)).slice(0, 6);
  const typeBySlug = Object.fromEntries(types.map((x) => [x.slug, x]));
  const stopBySlug = Object.fromEntries(stops.map((x) => [x.slug, x]));
  const groups = ["Stay", "Eat & shop", "Get around", "People", "Adventure", "Services"] as const;
  const countByType = listings.reduce<Record<string, number>>((a, l) => ({ ...a, [l.type]: (a[l.type] ?? 0) + 1 }), {});
  const allPlaceNames = stops.flatMap((s) => s.places.map((p) => p.name)).filter((n, i, a) => a.indexOf(n) === i).slice(0, 40);

  return (
    <>
      <Hero t={t} stops={stops} road={road} weather={weather.map((w) => ({ name: w.name, alt: w.alt, temp: w.temp, label: weatherLabel(w.code) }))} />
      <PlaceMarquee names={allPlaceNames} />

      {/* 01 ROUTE */}
      <section id="route" className="px-4 pt-24 pb-12 md:px-6">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-9">
          <SectionHead num="01" kicker={`${t.sections.route} · ${stops.length} stops`} title={t.sections.routeTitle} sub={t.sections.routeSub} />
          <Reveal><RouteExplorer stops={stops} labels={{ new: t.common.new, sideTrip: t.common.sideTrip, places: t.common.places }} /></Reveal>
        </div>
      </section>

      {/* 02 NUMBERS */}
      <section className="mt-12 bg-pine px-4 py-24 text-ground md:px-6">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-10">
          <SectionHead dark num="02" kicker={t.sections.numbers} title={t.sections.numbersTitle} />
          <Infographic stops={stops} trails={trails.length} />
        </div>
      </section>

      {/* 03 DIRECTORY */}
      <section id="directory" className="px-4 py-24 md:px-6">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-9">
          <SectionHead num="03" kicker={t.sections.directory} title={t.sections.directoryTitle} action={<Link href="/directory" className="border-b-2 border-ink pb-0.5 font-semibold">{t.common.viewAll} →</Link>} />
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

      {/* 04 FEATURED */}
      <section className="px-4 pb-24 md:px-6">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-9">
          <SectionHead num="04" kicker={t.sections.featured} title={t.sections.featuredTitle} action={<Link href="/directory" className="border-b-2 border-ink pb-0.5 font-semibold">{t.common.viewAll} →</Link>} />
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((l) => (
              <StaggerItem key={l.id}><ListingCard l={l} type={typeBySlug[l.type]} stop={stopBySlug[l.stop]} /></StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* 05 SIGHTS */}
      <section id="sights" className="px-4 pb-24 md:px-6">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-9">
          <SectionHead num="05" kicker={t.sections.sights} title={t.sections.sightsTitle} />
          <Sights />
        </div>
      </section>

      {/* 06 FILM */}
      <section className="px-4 pb-24 md:px-6">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-9">
          <SectionHead num="06" kicker={t.sections.film} title={t.sections.filmTitle} />
          <Reveal><Film url={settings.heroVideoUrl} /></Reveal>
        </div>
      </section>

      {/* 07 TRAILS */}
      <section id="trails" className="border-y border-line bg-white px-4 py-24 md:px-6">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-9">
          <SectionHead num="07" kicker={t.sections.trails} title={t.sections.trailsTitle} sub={t.sections.trailsSub} action={<Link href="/trails" className="rounded-full bg-ink px-6 py-3.5 font-semibold text-ground hover:bg-maroon">All {trails.length} routes</Link>} />
          <Reveal><TrailsTable trails={trails.slice(0, 8)} stops={stops} /></Reveal>
        </div>
      </section>

      {/* 08 SERVICES */}
      <section id="services" className="px-4 py-24 md:px-6">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-9">
          <SectionHead num="08" kicker={t.sections.services} title={t.sections.servicesTitle} />
          <Stagger className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            <StaggerItem>
              <a href="tel:1122" className="flex h-full flex-col gap-6 rounded-3xl bg-maroon p-6 text-white transition hover:bg-maroon-2">
                <Icon name="Siren" className="size-8" />
                <span><span className="block font-display text-5xl font-extrabold">1122</span><span>Rescue & ambulance — tap to call</span></span>
              </a>
            </StaggerItem>
            {[
              ["police", "ShieldCheck", "Police stations", "Police 15 · stations & check posts by town"],
              ["health", "Cross", "Health centres", "Hospitals, BHUs, clinics, pharmacies"],
              ["bank-atm", "Landmark", "Banks & ATMs", "Last ATM before the pass, marked"],
              ["fuel", "Fuel", "Fuel & mechanics", "Petrol pumps, tyre shops, towing"],
              ["govt", "Building2", "Govt offices", "Tourism, post office, rest houses, permits"],
            ].map(([slug, icon, title, sub]) => (
              <StaggerItem key={slug}>
                <Link href={`/directory?type=${slug}`} className="group flex h-full flex-col gap-6 rounded-3xl border border-line bg-white p-6 transition hover:border-ink">
                  <Icon name={icon} className="size-8 text-pine transition group-hover:scale-110" />
                  <span><span className="block font-display text-2xl font-semibold">{title}</span><span className="text-muted">{sub}</span></span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* 09 COMMUNITY */}
      <section id="community" className="px-4 pb-24 md:px-6">
        <div className="mx-auto grid max-w-[1320px] gap-3.5 lg:grid-cols-2">
          <Reveal className="flex flex-col gap-4 rounded-3xl bg-pine p-7 text-ground">
            <div className="flex items-baseline justify-between"><h2 className="flex items-center gap-3 font-display text-4xl font-extrabold"><Briefcase className="size-7 text-signal" />{t.sections.jobs}</h2><Link href="/community#jobs" className="font-semibold text-signal">{t.common.viewAll} →</Link></div>
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
                      <span className="text-lg font-semibold">{dt ? dt.getDate() : "—"}</span>
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

      {/* 10 CTA */}
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
                [FileUp, "Submit", "Pick your business type and fill the form for it — rooms for hotels, routes for jeeps, areas for guides."],
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

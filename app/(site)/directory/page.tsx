import Link from "next/link";
import { clsx } from "clsx";
import { getBusinessTypes, getListings, getStops } from "@/lib/data";
import { PageHero } from "@/components/site/PageHero";
import { ListingCard } from "@/components/site/ListingCard";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { photo } from "@/lib/media";
import { X } from "lucide-react";
import { pageMeta } from "@/lib/seo";
import { FILTER_PARAMS, STAY_TYPES, filterValueLabel, matchesFilters, type FilterParams } from "@/lib/search";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ stop?: string; q?: string } & FilterParams> }) {
  const sp = await searchParams;
  const [types, stops] = await Promise.all([getBusinessTypes(), getStops()]);
  const type = sp.type === STAY_TYPES ? { name: "Places to stay", slug: STAY_TYPES } : types.find((x) => x.slug === sp.type);
  const stop = stops.find((x) => x.slug === sp.stop);
  const what = type ? type.name : "Hotels, jeeps, guides and services";
  const where = stop ? `${stop.name}, Kaghan Valley` : "Kaghan Valley";
  // index the category and stop pages; searches and attribute filters stay out of the index
  const canonical = `/directory${type || stop ? `?${new URLSearchParams({ ...(type ? { type: type.slug } : {}), ...(stop ? { stop: stop.slug } : {}) })}` : ""}`;
  const filtered = !!sp.q || Object.keys(FILTER_PARAMS).some((k) => sp[k as keyof FilterParams]);
  return pageMeta({ title: `${what} in ${where}`, description: `${what} in ${where}, from Balakot and Kaghan to Naran and Babusar Top. Listings are checked by our team, with phone numbers, prices and locations.`, path: canonical, noindex: filtered });
}

export default async function DirectoryPage({ searchParams }: { searchParams: Promise<{ stop?: string; q?: string } & FilterParams> }) {
  const sp = await searchParams;
  const [types, stops, all] = await Promise.all([getBusinessTypes(), getStops(), getListings({ stop: sp.stop, q: sp.q })]);
  const listings = all.filter((l) => matchesFilters(l, sp));
  const active = Object.keys(FILTER_PARAMS).filter((k) => sp[k as keyof FilterParams]);;
  const type = types.find((x) => x.slug === sp.type);
  const stop = stops.find((x) => x.slug === sp.stop);
  const tBy = Object.fromEntries(types.map((x) => [x.slug, x]));
  const sBy = Object.fromEntries(stops.map((x) => [x.slug, x]));
  const clear = Object.fromEntries(active.map((k) => [k, undefined]));
  const href = (p: Record<string, string | undefined>) => {
    const u = new URLSearchParams();
    const merged = { ...sp, ...p } as Record<string, string | undefined>;
    Object.entries(merged).forEach(([k, v]) => v && u.set(k, v));
    const s = u.toString();
    return `/directory${s ? `?${s}` : ""}`;
  };
  return (
    <>
      <PageHero kicker="The directory" title={sp.type === STAY_TYPES ? "Places to stay" : type ? type.name : "Everything in the valley"} sub={sp.type === STAY_TYPES ? "Hotels, guest houses and campsites across the valley." : type?.description ?? "Approved hotels, restaurants, jeeps, guides, shops and services from Balakot to Babusar Top."} image={photo("naranNight")} />
      <section className="px-4 py-12 md:px-6">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-8">
          <form action="/directory" className="flex flex-wrap gap-3 rounded-3xl border border-line bg-white p-3">
            {(["type", ...active] as (keyof FilterParams)[]).map((k) => sp[k] ? <input key={k} type="hidden" name={k} value={sp[k]} /> : null)}
            <label className="flex min-w-60 flex-[2_1_260px] flex-col rounded-2xl bg-ground px-4 py-2">
              <span className="text-xs font-semibold tracking-wide text-muted uppercase">Search</span>
              <input name="q" defaultValue={sp.q} placeholder="Name, feature or area" className="bg-transparent text-[17px] outline-none" />
            </label>
            <label className="flex min-w-48 flex-[1_1_200px] flex-col rounded-2xl bg-ground px-4 py-2">
              <span className="text-xs font-semibold tracking-wide text-muted uppercase">Stop</span>
              <select name="stop" defaultValue={sp.stop ?? ""} className="bg-transparent text-[17px] outline-none">
                <option value="">Whole valley</option>
                {stops.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
              </select>
            </label>
            <button className="min-h-14 rounded-2xl bg-ink px-7 font-semibold text-ground hover:bg-maroon">Search</button>
          </form>
          <nav aria-label="Categories" className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            <Link href={href({ type: undefined, ...clear })} className={clsx("flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold", !sp.type ? "border-ink bg-ink text-ground" : "border-line-2 bg-white")}>All</Link>
            {types.map((x) => (
              <Link key={x.slug} href={href({ type: x.slug, ...clear })} className={clsx("flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold", sp.type === x.slug ? "border-ink bg-ink text-ground" : "border-line-2 bg-white hover:border-ink")}>
                <Icon name={x.icon} className="size-4" /> {x.name}
              </Link>
            ))}
          </nav>
          {active.length ? (
            <div className="flex flex-wrap items-center gap-2">
              {active.map((k) => (
                <Link key={k} href={href({ [k]: undefined })} aria-label={`Remove filter ${FILTER_PARAMS[k]}`} className="flex items-center gap-1.5 rounded-full bg-sage px-3.5 py-2 text-sm font-medium hover:bg-line">
                  <span className="text-muted">{FILTER_PARAMS[k]}:</span> {filterValueLabel(k, sp[k as keyof FilterParams]!)} <X className="size-3.5" aria-hidden />
                </Link>
              ))}
              <Link href={href(clear)} className="text-sm font-semibold text-maroon underline">Clear filters</Link>
            </div>
          ) : null}
          <p className="text-muted">{listings.length} result{listings.length === 1 ? "" : "s"}{stop ? ` in ${stop.name}` : ""}{sp.q ? ` for “${sp.q}”` : ""}</p>
          {listings.length ? (
            <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((l) => <StaggerItem key={l.id}><ListingCard l={l} type={tBy[l.type]} stop={sBy[l.stop]} /></StaggerItem>)}
            </Stagger>
          ) : (
            <div className="flex flex-col items-start gap-4 rounded-3xl bg-sage p-8">
              <p className="font-display text-2xl font-semibold">Nothing listed here yet.</p>
              <p className="text-ink-2">Know a good place? Ask the owner to add it. It’s free and reviewed by our team.</p>
              <Link href="/list-your-business" className="rounded-full bg-ink px-6 py-3 font-semibold text-ground">List a business</Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

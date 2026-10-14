import Link from "next/link";
import { clsx } from "clsx";
import { getBusinessTypes, getListings, getStops } from "@/lib/data";
import { PageHero } from "@/components/site/PageHero";
import { ListingCard } from "@/components/site/ListingCard";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { photo } from "@/lib/media";

export const metadata = { title: "Directory" };

export default async function DirectoryPage({ searchParams }: { searchParams: Promise<{ type?: string; stop?: string; q?: string }> }) {
  const sp = await searchParams;
  const [types, stops, listings] = await Promise.all([getBusinessTypes(), getStops(), getListings({ type: sp.type, stop: sp.stop, q: sp.q })]);
  const type = types.find((x) => x.slug === sp.type);
  const stop = stops.find((x) => x.slug === sp.stop);
  const tBy = Object.fromEntries(types.map((x) => [x.slug, x]));
  const sBy = Object.fromEntries(stops.map((x) => [x.slug, x]));
  const href = (p: Record<string, string | undefined>) => {
    const u = new URLSearchParams();
    const merged = { type: sp.type, stop: sp.stop, q: sp.q, ...p };
    Object.entries(merged).forEach(([k, v]) => v && u.set(k, v));
    const s = u.toString();
    return `/directory${s ? `?${s}` : ""}`;
  };
  return (
    <>
      <PageHero kicker="The directory" title={type ? type.name : "Everything in the valley"} sub={type?.description ?? "Approved hotels, restaurants, jeeps, guides, shops and services from Balakot to Babusar Top."} image={photo("naranNight")} />
      <section className="px-4 py-12 md:px-6">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-8">
          <form action="/directory" className="flex flex-wrap gap-3 rounded-3xl border border-line bg-white p-3">
            {sp.type ? <input type="hidden" name="type" value={sp.type} /> : null}
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
            <Link href={href({ type: undefined })} className={clsx("flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold", !sp.type ? "border-ink bg-ink text-ground" : "border-line-2 bg-white")}>All</Link>
            {types.map((x) => (
              <Link key={x.slug} href={href({ type: x.slug })} className={clsx("flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold", sp.type === x.slug ? "border-ink bg-ink text-ground" : "border-line-2 bg-white hover:border-ink")}>
                <Icon name={x.icon} className="size-4" /> {x.name}
              </Link>
            ))}
          </nav>
          <p className="text-muted">{listings.length} result{listings.length === 1 ? "" : "s"}{stop ? ` in ${stop.name}` : ""}{sp.q ? ` for “${sp.q}”` : ""}</p>
          {listings.length ? (
            <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((l) => <StaggerItem key={l.id}><ListingCard l={l} type={tBy[l.type]} stop={sBy[l.stop]} /></StaggerItem>)}
            </Stagger>
          ) : (
            <div className="flex flex-col items-start gap-4 rounded-3xl bg-sage p-8">
              <p className="font-display text-2xl font-semibold">Nothing listed here yet.</p>
              <p className="text-ink-2">Know a good place? Ask the owner to add it — it’s free and reviewed by our team.</p>
              <Link href="/list-your-business" className="rounded-full bg-ink px-6 py-3 font-semibold text-ground">List a business</Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

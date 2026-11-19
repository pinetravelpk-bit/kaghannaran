import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, MapPin, MessageCircle, Phone, Star, ShieldCheck, Navigation, Map as MapIcon, Store, Construction, CloudSun, Landmark as LandmarkIcon } from "lucide-react";
import { getBusinessTypes, getListing, getListings, getRoad, getStops, getWeatherAreas } from "@/lib/data";
import { getRoadLive } from "@/lib/road";
import { getWeather } from "@/lib/weather";
import { Photo } from "@/components/ui/Photo";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { RoadBadge } from "@/components/ui/StatusBadge";
import { CONTACT_EMAIL } from "@/lib/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { Faq } from "@/components/seo/Faq";
import { abs, breadcrumbs, faqPage, graph, listingSchema, pageMeta } from "@/lib/seo";
import { distKm, stopPoint } from "@/lib/geo";
import { kindOf, listingContent, posOf } from "@/lib/listing-content";
import { PlaceGallery } from "@/components/ui/PlacePhotos";
import { placeIdOf, placesEnabled } from "@/lib/places";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const l = await getListing(slug);
  if (!l) return { title: "Listing not found" };
  const where = (await getStops()).find((x) => x.slug === l.stop)?.name;
  const base = `${l.name}${where && !l.name.toLowerCase().includes(where.toLowerCase()) ? `, ${where}` : ""}`;
  const suffix = l.phone ? "phone and details" : posOf(l) ? `${kindOf(l)} location and map` : "details";
  // keep titles inside what search results show (about 60 characters with the site name)
  const title = `${base}: ${suffix}`.length <= 48 ? `${base}: ${suffix}` : base;
  return pageMeta({ title, description: `${l.description}${l.phone ? ` Phone: ${l.phone}.` : ""}`, path: `/listing/${l.slug}`, image: l.image });
}

const when = (iso: string) => new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Karachi" });
const km = (n: number) => (n < 1 ? `${Math.max(50, Math.round((n * 1000) / 50) * 50)} m` : `${n < 10 ? n.toFixed(1) : Math.round(n)} km`);

export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [l, types, stops] = await Promise.all([getListing(slug), getBusinessTypes(), getStops()]);
  if (!l || l.status !== "approved") notFound();
  const type = types.find((x) => x.slug === l.type);
  const stop = stops.find((x) => x.slug === l.stop);
  const fmt = (v: unknown) => (Array.isArray(v) ? v.join(", ") : typeof v === "boolean" ? (v ? "Yes" : "No") : String(v));
  const wa = (l.whatsapp ?? l.phone).replace(/\D/g, "").replace(/^0/, "92");
  const a = l.attributes;
  const unclaimed = a.claimed === false;
  const pos = posOf(l);
  const mapsUrl = typeof a.mapsUrl === "string" ? a.mapsUrl : pos ? `https://www.google.com/maps/search/?api=1&query=${pos.lat},${pos.lon}` : undefined;

  // fact-based content for businesses with a map position
  const [all, segments, road, weather, areas] = pos ? await Promise.all([getListings(), getRoad(), getRoadLive(), getWeather(), getWeatherAreas()]) : [[], [], [], [], []];
  const typeName = (s: string) => types.find((t) => t.slug === s)?.name ?? s;
  const c = pos ? listingContent(l, stop, all, typeName, segments) : undefined;
  const reading = c?.segmentId ? road.find((r) => r.id === c.segmentId) : undefined;
  const area = pos ? [...areas].sort((x, y) => distKm(pos, x) - distKm(pos, y))[0] : undefined;
  const wx = area ? weather.find((w) => w.slug === area.slug) : undefined;
  const plural = type ? `${type.name.split(" /")[0]}s` : "Listings";

  const crumbs: [string, string][] = stop && type
    ? [[stop.name, `/places/${stop.slug}`], [`${plural} in ${stop.name}`, `/directory?type=${type.slug}&stop=${stop.slug}`], [l.name, `/listing/${l.slug}`]]
    : [["Directory", "/directory"], ...(type ? [[type.name, `/directory?type=${type.slug}`] as [string, string]] : []), [l.name, `/listing/${l.slug}`]];
  const schema = {
    ...listingSchema(l, type, stop, pos ? { ...pos, ...(c?.f.ele ? { ele: c.f.ele } : {}) } : stop ? stopPoint(stop.slug) : undefined),
    ...(stop ? { containedInPlace: { "@id": abs(`/places/${stop.slug}#place`) } } : {}),
  };

  return (
    <>
      <JsonLd data={graph(schema, breadcrumbs(crumbs), ...(c ? [faqPage(c.faq)] : []))} />
      <section className="relative isolate overflow-hidden bg-pine text-ground">
        <Photo src={l.image} alt={l.name} eager className="absolute inset-0 -z-10 h-full w-full opacity-70 [&_img]:animate-kenburns" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,#12302C_5%,rgba(18,48,44,0.2)_70%)]" />
        <div className="mx-auto flex min-h-[400px] max-w-[1320px] flex-col justify-end gap-4 px-4 pt-20 pb-12 md:px-6">
          <nav aria-label="Breadcrumb" className="text-sm text-fog">
            <Link href="/" className="hover:text-white">Home</Link>
            {crumbs.slice(0, -1).map(([n, href]) => <span key={href}> / <Link href={href} className="hover:text-white">{n}</Link></span>)}
          </nav>
          <div className="flex flex-wrap gap-2">
            {type ? <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-ink"><Icon name={type.icon} className="size-4" />{type.name}</span> : null}
            {l.verified ? <span className="flex items-center gap-1.5 rounded-full bg-emerald-700 px-3 py-1.5 text-sm font-semibold"><BadgeCheck className="size-4" />Verified</span> : null}
            {unclaimed ? <span className="rounded-full border border-white/40 px-3 py-1.5 text-sm font-semibold">Unclaimed listing</span> : null}
          </div>
          <h1 className="font-display text-5xl leading-none font-extrabold tracking-tight md:text-7xl">{l.name}</h1>
          <p className="flex flex-wrap items-center gap-4 text-mist">
            <span className="flex items-center gap-1.5"><MapPin className="size-4" />{l.address}</span>
            {c?.f.ele ? <span className="font-mono text-sm">{c.f.ele.toLocaleString("en-US")} m</span> : null}
            {l.rating ? <span className="flex items-center gap-1.5"><Star className="size-4 fill-amber text-amber" />{l.rating.toFixed(1)} ({l.reviews} reviews)</span> : null}
          </p>
        </div>
      </section>
      <section className="px-4 py-12 md:px-6">
        <div className="mx-auto grid max-w-[1320px] gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="flex min-w-0 flex-col gap-8">
            {c ? (
              <section aria-labelledby="about" className="flex flex-col gap-4">
                <h2 id="about" className="font-display text-3xl font-extrabold">About {l.name}</h2>
                {c.intro.map((p) => <p key={p} className="text-lg leading-relaxed text-ink-2">{p}</p>)}
              </section>
            ) : (
              <Reveal><p className="text-xl leading-relaxed text-ink-2">{l.description}</p></Reveal>
            )}
            {placesEnabled && placeIdOf(l) ? <PlaceGallery placeId={placeIdOf(l)!} name={l.name} /> : null}

            <section aria-labelledby="facts" className="rounded-3xl border border-line bg-white p-6">
              <h2 id="facts" className="mb-4 font-display text-2xl font-bold">Key facts</h2>
              <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {(c ? c.facts : ([["Address", l.address]] as [string, string][])).map(([k, v]) => (
                  <div key={k} className="border-t border-line pt-3"><dt className="text-sm text-muted">{k}</dt><dd className="font-semibold">{v}</dd></div>
                ))}
                {type?.fields.filter((f) => l.attributes[f.key] !== undefined && l.attributes[f.key] !== "" && !(Array.isArray(l.attributes[f.key]) && !(l.attributes[f.key] as string[]).length)).map((f) => (
                  <div key={f.key} className="border-t border-line pt-3"><dt className="text-sm text-muted">{f.label}</dt><dd className="font-semibold">{fmt(l.attributes[f.key])}</dd></div>
                ))}
                {l.priceFrom ? <div className="border-t border-line pt-3"><dt className="text-sm text-muted">Price from</dt><dd className="font-mono font-semibold">PKR {l.priceFrom.toLocaleString("en-US")}</dd></div> : null}
              </dl>
            </section>

            {reading || wx ? (
              <section aria-labelledby="today" className="flex flex-col gap-3 rounded-3xl bg-board p-6 text-ground">
                <h2 id="today" className="font-display text-2xl font-bold">Today near {l.name}</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {reading ? (
                    <Link href="/road" className="flex flex-col gap-2 rounded-2xl bg-pine p-4 hover:bg-pine-2">
                      <span className="flex items-center gap-2 text-sm text-fog"><Construction className="size-4" aria-hidden />Road: {reading.segment}</span>
                      <RoadBadge status={reading.status} />
                      <span className="text-sm text-mist">{reading.note}</span>
                      <span className="text-[11px] text-[#7F9893]">Checked {when(reading.checkedAt)}</span>
                    </Link>
                  ) : null}
                  {wx ? (
                    <Link href="/road#weather" className="flex flex-col gap-2 rounded-2xl bg-pine p-4 hover:bg-pine-2">
                      <span className="flex items-center gap-2 text-sm text-fog"><CloudSun className="size-4" aria-hidden />Weather in {wx.name}</span>
                      <span className="font-display text-3xl font-extrabold">{wx.temp !== undefined ? `${Math.round(wx.temp)}°C` : "-"} <span className="text-base font-normal text-mist">{wx.label}</span></span>
                      {wx.advisory ? <span className="text-sm text-signal">{wx.advisory}</span> : null}
                    </Link>
                  ) : null}
                </div>
              </section>
            ) : null}

            {pos ? (
              // Google's free "embed a map" iframe (no API key): map, place card, rating and directions from Google itself
              <section aria-labelledby="map" className="flex flex-col gap-3">
                <h2 id="map" className="font-display text-2xl font-bold">Map and location</h2>
                <iframe
                  title={`Map of ${l.name}`}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(`${l.name}, ${stop?.name ?? "Kaghan Valley"}`)}&ll=${pos.lat},${pos.lon}&z=15&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="aspect-[16/10] w-full rounded-3xl border border-line bg-sage"
                />
              </section>
            ) : null}

            {c ? (
              <section aria-labelledby="nearby" className="flex flex-col gap-4">
                <h2 id="nearby" className="font-display text-2xl font-bold">What is near {l.name}</h2>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {c.places.map((p) => (
                    <li key={p.name}>
                      <Link href={p.href} className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white px-4 py-3 hover:border-ink">
                        <span className="flex items-center gap-2 font-semibold"><LandmarkIcon className="size-4 text-pine" aria-hidden />{p.name}</span>
                        <span className="text-right text-sm text-muted">{km(p.km)}{p.note ? <span className="block text-xs">{p.note}</span> : null}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="grid gap-4 md:grid-cols-2">
                  {c.nearby.map((g) => (
                    <div key={g.title} className="flex flex-col gap-2 rounded-2xl bg-sage p-4">
                      <h3 className="font-display text-lg font-bold">{g.title}</h3>
                      <ul className="flex flex-col gap-1">
                        {g.items.map((x) => (
                          <li key={x.href} className="flex items-baseline justify-between gap-3"><Link href={x.href} className="text-maroon underline-offset-4 hover:underline">{x.name}</Link><span className="shrink-0 text-sm text-muted">{km(x.km)}</span></li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted">Distances are straight-line from the map position. Road distances are longer in the mountains.</p>
              </section>
            ) : null}

            {stop ? (
              <section aria-labelledby="todo" className="flex flex-col gap-3 rounded-3xl bg-sage p-6">
                <h2 id="todo" className="font-display text-2xl font-bold">Things to do in {stop.name}</h2>
                <div className="flex flex-wrap gap-2">{stop.places.map((p) => <span key={p.name} className="rounded-full bg-white px-3 py-1.5 text-sm">{p.name}</span>)}</div>
                <Link href={`/places/${stop.slug}`} className="font-semibold text-maroon">Explore {stop.name} →</Link>
              </section>
            ) : null}

            {c ? <Faq items={c.faq} title={`${l.name}: questions people ask`} /> : null}
          </div>
          <aside className="flex flex-col gap-3 lg:sticky lg:top-28 lg:self-start">
            <div className="flex flex-col gap-3 rounded-3xl bg-ink p-6 text-ground">
              {l.priceFrom ? <span className="font-display text-3xl font-extrabold">PKR {l.priceFrom.toLocaleString("en-US")} <span className="text-base font-normal text-fog">from</span></span> : null}
              {l.phone ? <a href={`tel:${l.phone}`} className="flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-amber font-semibold text-ink"><Phone className="size-4" />Call {l.phone}</a> : null}
              {mapsUrl ? <a href={mapsUrl} target="_blank" rel="noreferrer" className={`flex min-h-13 items-center justify-center gap-2 rounded-2xl font-semibold ${l.phone ? "border border-[#3C5A55]" : "bg-amber text-ink"}`}><MapIcon className="size-4" />Open in Google Maps</a> : null}
              {pos ? <a href={`https://www.google.com/maps/dir/?api=1&destination=${pos.lat},${pos.lon}`} target="_blank" rel="noreferrer" className="flex min-h-13 items-center justify-center gap-2 rounded-2xl border border-[#3C5A55] font-semibold"><Navigation className="size-4" />Directions</a> : null}
              {l.phone && wa.length >= 10 ? <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="flex min-h-13 items-center justify-center gap-2 rounded-2xl border border-[#3C5A55] font-semibold"><MessageCircle className="size-4" />WhatsApp</a> : null}
              <p className="flex items-start gap-2 text-sm text-fog"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-signal" />{type?.adminOnly ? "Public service number, checked by the Kaghan Naran team." : unclaimed ? "Added from public map data. Contact details and prices appear once the owner claims this listing." : "Reviewed by the Kaghan Naran team before publishing. Book directly with the owner."}</p>
              {typeof l.attributes.source === "string" ? <a href={l.attributes.source} target="_blank" rel="noreferrer" className="text-sm text-fog underline">Source</a> : null}
            </div>
            {unclaimed ? (
              <div className="flex flex-col gap-2 rounded-3xl border border-line bg-white p-6">
                <span className="flex items-center gap-2 font-display text-xl font-bold"><Store className="size-5 text-maroon" aria-hidden />Is this your {l.type === "hotel" ? "hotel" : l.type === "restaurant" ? "restaurant" : "business"}?</span>
                <p className="text-ink-2">Claim it for free to add your phone number, {l.type === "hotel" ? "room prices" : "opening hours"} and photos, and get the Verified badge.</p>
                <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Claim listing: " + l.name)}`} className="self-start rounded-full bg-ink px-5 py-2.5 font-semibold text-ground hover:bg-maroon">Claim this listing</a>
              </div>
            ) : null}
            <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Report: " + l.name)}`} className="text-center text-sm text-muted underline">Report a problem with this listing</a>
          </aside>
        </div>
      </section>
    </>
  );
}

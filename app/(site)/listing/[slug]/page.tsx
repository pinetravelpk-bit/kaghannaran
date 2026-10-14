import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, MapPin, MessageCircle, Phone, Star, ShieldCheck } from "lucide-react";
import { getBusinessTypes, getListing, getStops } from "@/lib/data";
import { Photo } from "@/components/ui/Photo";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { CONTACT_EMAIL } from "@/lib/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbs, graph, listingSchema, pageMeta } from "@/lib/seo";
import { stopPoint } from "@/lib/geo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const l = await getListing(slug);
  if (!l) return { title: "Listing not found" };
  const where = (await getStops()).find((x) => x.slug === l.stop)?.name;
  return pageMeta({ title: `${l.name}${where ? `, ${where}` : ""}: phone and details`, description: `${l.description} Phone: ${l.phone}.`.slice(0, 300), path: `/listing/${l.slug}`, image: l.image });
}

export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [l, types, stops] = await Promise.all([getListing(slug), getBusinessTypes(), getStops()]);
  if (!l || l.status !== "approved") notFound();
  const type = types.find((x) => x.slug === l.type);
  const stop = stops.find((x) => x.slug === l.stop);
  const fmt = (v: unknown) => (Array.isArray(v) ? v.join(", ") : typeof v === "boolean" ? (v ? "Yes" : "No") : String(v));
  const wa = (l.whatsapp ?? l.phone).replace(/\D/g, "").replace(/^0/, "92");
  return (
    <>
      <JsonLd data={graph(listingSchema(l, type, stop, stop ? stopPoint(stop.slug) : undefined), breadcrumbs([["Directory", "/directory"], ...(type ? [[type.name, `/directory?type=${type.slug}`] as [string, string]] : []), [l.name, `/listing/${l.slug}`]]))} />
      <section className="relative isolate overflow-hidden bg-pine text-ground">
        <Photo src={l.image} alt={l.name} eager className="absolute inset-0 -z-10 h-full w-full opacity-70 [&_img]:animate-kenburns" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,#12302C_5%,rgba(18,48,44,0.2)_70%)]" />
        <div className="mx-auto flex min-h-[440px] max-w-[1320px] flex-col justify-end gap-4 px-4 pt-24 pb-12 md:px-6">
          <div className="flex flex-wrap gap-2">
            {type ? <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-ink"><Icon name={type.icon} className="size-4" />{type.name}</span> : null}
            {l.verified ? <span className="flex items-center gap-1.5 rounded-full bg-emerald-700 px-3 py-1.5 text-sm font-semibold"><BadgeCheck className="size-4" />Verified</span> : null}
          </div>
          <h1 className="font-display text-5xl leading-none font-extrabold tracking-tight md:text-7xl">{l.name}</h1>
          <p className="flex flex-wrap items-center gap-4 text-mist">
            <span className="flex items-center gap-1.5"><MapPin className="size-4" />{l.address}{stop ? ` · ${stop.name}` : ""}</span>
            {l.rating ? <span className="flex items-center gap-1.5"><Star className="size-4 fill-amber text-amber" />{l.rating.toFixed(1)} ({l.reviews} reviews)</span> : null}
          </p>
        </div>
      </section>
      <section className="px-4 py-12 md:px-6">
        <div className="mx-auto grid max-w-[1320px] gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="flex flex-col gap-8">
            <Reveal><p className="text-xl leading-relaxed text-ink-2">{l.description}</p></Reveal>
            <Reveal className="rounded-3xl border border-line bg-white p-6">
              <h2 className="mb-4 font-display text-2xl font-bold">Details</h2>
              <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {type?.fields.filter((f) => l.attributes[f.key] !== undefined && l.attributes[f.key] !== "").map((f) => (
                  <div key={f.key} className="border-t border-line pt-3"><dt className="text-sm text-muted">{f.label}</dt><dd className="font-semibold">{fmt(l.attributes[f.key])}</dd></div>
                ))}
                {l.priceFrom ? <div className="border-t border-line pt-3"><dt className="text-sm text-muted">Price from</dt><dd className="font-mono font-semibold">PKR {l.priceFrom.toLocaleString("en-US")}</dd></div> : null}
              </dl>
            </Reveal>
            {stop ? (
              <Reveal className="flex flex-col gap-3 rounded-3xl bg-sage p-6">
                <h2 className="font-display text-2xl font-bold">Nearby in {stop.name}</h2>
                <div className="flex flex-wrap gap-2">{stop.places.map((p) => <span key={p.name} className="rounded-full bg-white px-3 py-1.5 text-sm">{p.name}</span>)}</div>
                <Link href={`/places/${stop.slug}`} className="font-semibold text-maroon">Explore {stop.name} →</Link>
              </Reveal>
            ) : null}
          </div>
          <aside className="flex flex-col gap-3 lg:sticky lg:top-28 lg:self-start">
            <div className="flex flex-col gap-3 rounded-3xl bg-ink p-6 text-ground">
              {l.priceFrom ? <span className="font-display text-3xl font-extrabold">PKR {l.priceFrom.toLocaleString("en-US")} <span className="text-base font-normal text-fog">from</span></span> : null}
              <a href={`tel:${l.phone}`} className="flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-amber font-semibold text-ink"><Phone className="size-4" />Call {l.phone}</a>
              {wa.length >= 10 ? <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="flex min-h-13 items-center justify-center gap-2 rounded-2xl border border-[#3C5A55] font-semibold"><MessageCircle className="size-4" />WhatsApp</a> : null}
              <p className="flex items-start gap-2 text-sm text-fog"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-signal" />{type?.adminOnly ? "Public service number, checked by the Kaghan Naran team." : "Reviewed by the Kaghan Naran team before publishing. Book directly with the owner."}</p>
              {typeof l.attributes.source === "string" ? <a href={l.attributes.source} target="_blank" rel="noreferrer" className="text-sm text-fog underline">Source</a> : null}
            </div>
            <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Report: " + l.name)}`} className="text-center text-sm text-muted underline">Report a problem with this listing</a>
          </aside>
        </div>
      </section>
    </>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, MessageCircle, Mail, MapPin } from "lucide-react";
import { getBusinessTypes, getListing, getListings, getStops } from "@/lib/data";
import { supabaseServer } from "@/lib/supabase/server";
import { isDemo } from "@/lib/supabase/config";
import { ReviewPanel } from "@/components/admin/ReviewPanel";
import { DocViewer, type DocView } from "@/components/admin/DocViewer";
import { Card } from "@/components/admin/ui";
import { Photo } from "@/components/ui/Photo";
import { Icon } from "@/components/ui/Icon";

export const metadata = { title: "Review submission" };

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [l, types, stops, queue] = await Promise.all([getListing(id), getBusinessTypes(), getStops(), getListings({ status: "pending" })]);
  if (!l) notFound();
  const type = types.find((t) => t.slug === l.type);
  if (!type) notFound();
  const stop = stops.find((s) => s.slug === l.stop);
  const nextId = queue.filter((x) => x.id !== l.id).sort((a, b) => a.submittedAt.localeCompare(b.submittedAt))[0]?.id;

  // signed URLs for private documents (live mode)
  const s = isDemo ? null : await supabaseServer();
  const docs: DocView[] = await Promise.all(type.documents.map(async (d) => {
    const files = await Promise.all(l.documents.filter((x) => x.key === d.key).map(async (x) => {
      let url: string | undefined;
      if (s && x.url) url = (await s.storage.from("documents").createSignedUrl(x.url, 600)).data?.signedUrl;
      return { name: x.fileName, url };
    }));
    return { key: d.key, label: d.label, required: d.required, files };
  }));
  const fmt = (v: unknown) => (Array.isArray(v) ? v.join(", ") : typeof v === "boolean" ? (v ? "Yes" : "No") : v === undefined || v === "" ? "-" : String(v));
  const wa = (l.whatsapp ?? l.phone).replace(/\D/g, "").replace(/^0/, "92");

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/approvals" className="flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink"><ArrowLeft className="size-4" />Back to queue</Link>
        {nextId ? <Link href={`/admin/approvals/${nextId}`} className="text-sm font-semibold text-maroon">Skip to next →</Link> : null}
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="flex flex-col gap-5">
          <section className="overflow-hidden rounded-3xl border border-line bg-white">
            <div className="relative h-56 md:h-72"><Photo src={l.image} alt={l.name} className="h-full w-full" /><span className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold"><Icon name={type.icon} className="size-4" />{type.name}{type.individual ? " · individual" : ""}</span></div>
            <div className="flex flex-col gap-4 p-6">
              <h1 className="font-display text-4xl font-extrabold tracking-tight">{l.name}</h1>
              <p className="text-lg text-ink-2">{l.description}</p>
              <div className="flex flex-wrap gap-2 text-sm">
                <a href={`tel:${l.phone}`} className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 font-semibold text-ground"><Phone className="size-4" />Call {l.phone}</a>
                <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-full border border-line-2 px-4 py-2 font-semibold"><MessageCircle className="size-4" />WhatsApp</a>
                {l.ownerEmail ? <a href={`mailto:${l.ownerEmail}`} className="flex items-center gap-1.5 rounded-full border border-line-2 px-4 py-2 font-semibold"><Mail className="size-4" />{l.ownerEmail}</a> : null}
                <span className="flex items-center gap-1.5 rounded-full bg-ground px-4 py-2"><MapPin className="size-4" />{l.address} · {stop?.name}</span>
              </div>
            </div>
          </section>
          <Card title={`${type.individual ? "Profile" : "Business"} details`}>
            <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
              <div className="border-t border-line pt-2"><dt className="text-sm text-muted">Applicant</dt><dd className="font-semibold">{l.ownerName}</dd></div>
              <div className="border-t border-line pt-2"><dt className="text-sm text-muted">Price from</dt><dd className="font-mono font-semibold">{l.priceFrom ? `PKR ${l.priceFrom.toLocaleString("en-US")}` : "-"}</dd></div>
              {type.fields.map((f) => <div key={f.key} className="border-t border-line pt-2"><dt className="text-sm text-muted">{f.label}{f.required ? " *" : ""}</dt><dd className="font-semibold">{fmt(l.attributes[f.key])}</dd></div>)}
            </dl>
          </Card>
          <Card title="Documents"><DocViewer docs={docs} demo={isDemo} /></Card>
          {l.gallery?.length ? <Card title="Photos"><div className="grid grid-cols-2 gap-2 md:grid-cols-4">{l.gallery.map((g) => <Photo key={g} src={g} alt="" className="aspect-square rounded-xl" />)}</div></Card> : null}
        </div>
        <ReviewPanel listing={l} type={type} nextId={nextId} />
      </div>
    </>
  );
}

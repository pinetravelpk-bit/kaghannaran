import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { FileCheck2, PhoneCall, Search, BadgeCheck, RotateCcw, ArrowRight } from "lucide-react";
import { getBusinessTypes } from "@/lib/data";
import { PageHero } from "@/components/site/PageHero";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { photo } from "@/lib/media";

export const metadata = pageMeta({ title: "List your hotel or business in Kaghan Valley for free", description: "Hotels, guest houses, restaurants, jeep drivers, guides and adventure operators in Kaghan, Naran and Shogran can list for free. Every listing is checked by our team.", path: "/list-your-business" });

export default async function ListPage() {
  const types = (await getBusinessTypes()).filter((t) => !t.adminOnly);
  const businesses = types.filter((t) => !t.individual);
  const people = types.filter((t) => t.individual);
  const steps = [
    [FileCheck2, "Submit", "Choose your type and fill in the form made for it. Upload the documents listed."],
    [Search, "Review", "A moderator checks your documents and photos against the checklist for your type."],
    [PhoneCall, "Verify", "We call the number you gave and confirm the location."],
    [BadgeCheck, "Go live", "Approved listings appear in search. Licensed businesses get a Verified badge."],
    [RotateCcw, "Edit anytime", "Changes to an approved listing go back for a quick re-check."],
  ] as const;
  const card = (t: (typeof types)[number]) => (
    <StaggerItem key={t.slug} className="flex h-full flex-col gap-4 rounded-3xl border border-line bg-white p-6">
      <span className="flex items-center gap-3">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-pine text-signal"><Icon name={t.icon} className="size-6" /></span>
        <span><span className="block font-display text-xl font-bold">{t.name}</span><span className="text-sm text-muted">{t.description}</span></span>
      </span>
      <details className="group rounded-2xl bg-ground p-4 text-sm">
        <summary className="cursor-pointer font-semibold">What you’ll need</summary>
        <ul className="mt-3 flex flex-col gap-1.5">
          {t.documents.map((d) => <li key={d.key} className="flex justify-between gap-3"><span>{d.label}</span><span className={d.required ? "font-semibold text-maroon" : "text-muted"}>{d.required ? "Required" : "Optional"}</span></li>)}
        </ul>
        <p className="mt-3 font-semibold">We check</p>
        <ul className="mt-1 list-disc ps-5 text-ink-2">{t.checklist.map((c) => <li key={c}>{c}</li>)}</ul>
      </details>
      <Link href={`/dashboard/new?type=${t.slug}`} className="mt-auto flex items-center justify-center gap-2 rounded-2xl bg-ink py-3.5 font-semibold text-ground hover:bg-maroon">Start <ArrowRight className="size-4 rtl:rotate-180" /></Link>
    </StaggerItem>
  );
  return (
    <>
      <PageHero kicker="For hotels, shops, drivers & guides" title="Get your business in front of every visitor." sub="Listing is reviewed by our team so travellers can trust what they find. Most reviews finish within 1 to 2 working days." image={photo("handicraft")} />
      <section className="px-4 py-16 md:px-6">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-14">
          <Reveal>
            <ol className="grid gap-3 md:grid-cols-5">
              {steps.map(([I, h, p], i) => (
                <li key={h} className="relative flex flex-col gap-2 rounded-2xl bg-pine p-5 text-ground">
                  <span className="font-mono text-xs text-signal">STEP {i + 1}</span>
                  <I className="size-7 text-amber" aria-hidden />
                  <span className="font-display text-xl font-bold">{h}</span>
                  <span className="text-sm text-mist">{p}</span>
                </li>
              ))}
            </ol>
          </Reveal>
          <div className="flex flex-col gap-6">
            <h2 className="font-display text-4xl font-extrabold tracking-tight">Businesses</h2>
            <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{businesses.map(card)}</Stagger>
          </div>
          <div id="guides" className="flex flex-col gap-6">
            <h2 className="font-display text-4xl font-extrabold tracking-tight">Individuals</h2>
            <p className="max-w-2xl text-lg text-muted">Independent guides, trek leaders and porters get their own profile. We verify your CNIC, call you, and check references before you appear in search.</p>
            <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{people.map(card)}</Stagger>
          </div>
        </div>
      </section>
    </>
  );
}

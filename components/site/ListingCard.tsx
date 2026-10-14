import Link from "next/link";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import type { BusinessType, Listing, Stop } from "@/lib/types";
import { Photo } from "@/components/ui/Photo";
import { Icon } from "@/components/ui/Icon";

export function ListingCard({ l, type, stop }: { l: Listing; type?: BusinessType; stop?: Stop }) {
  return (
    <Link href={`/listing/${l.slug}`} className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px_rgba(16,32,31,0.35)]">
      <span className="relative block aspect-[4/3] overflow-hidden">
        {l.image ? (
          <Photo src={l.image} alt={l.name} className="h-full w-full transition duration-700 group-hover:scale-105 [&_img]:transition [&_img]:duration-700 group-hover:[&_img]:scale-110" />
        ) : (
          <span className="flex h-full w-full flex-col items-center justify-center gap-2 bg-pine text-signal">
            {type ? <Icon name={type.icon} className="size-14" /> : null}
            <span className="font-mono text-4xl font-semibold tracking-wider">{l.phone}</span>
          </span>
        )}
        <span className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {type ? (
            <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-ink">
              <Icon name={type.icon} className="size-3.5" /> {type.name}
            </span>
          ) : null}
          {l.featured ? <span className="rounded-full bg-amber px-3 py-1.5 text-xs font-semibold text-ink">Featured</span> : null}
        </span>
      </span>
      <span className="flex flex-1 flex-col gap-2 p-5">
        <span className="flex items-start justify-between gap-2">
          <span className="font-display text-xl leading-tight font-semibold">{l.name}</span>
          {l.verified ? <BadgeCheck className="size-5 shrink-0 text-emerald-700" aria-label="Verified" /> : null}
        </span>
        <span className="flex items-center gap-1.5 text-sm text-muted"><MapPin className="size-4" aria-hidden /> {stop?.name ?? l.address}</span>
        <span className="line-clamp-2 text-sm text-ink-2">{l.description}</span>
        <span className="mt-auto flex items-center justify-between pt-3 text-sm">
          {l.rating ? (
            <span className="flex items-center gap-1 font-semibold"><Star className="size-4 fill-amber text-amber" aria-hidden /> {l.rating.toFixed(1)} <span className="font-normal text-muted">({l.reviews})</span></span>
          ) : <span className="text-muted">New listing</span>}
          {l.priceFrom ? <span className="font-mono text-ink">from PKR {l.priceFrom.toLocaleString("en-US")}</span> : null}
        </span>
      </span>
    </Link>
  );
}

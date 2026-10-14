"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, TriangleAlert, ArrowUpRight } from "lucide-react";
import { clsx } from "clsx";
import type { Stop } from "@/lib/types";
import { Photo } from "@/components/ui/Photo";

export function RouteExplorer({ stops, initial = "naran", labels }: { stops: Stop[]; initial?: string; labels: { new: string; sideTrip: string; places: string } }) {
  const [idx, setIdx] = useState(Math.max(0, stops.findIndex((s) => s.slug === initial)));
  const [newOnly, setNewOnly] = useState(false);
  const strip = useRef<HTMLDivElement>(null);
  const cur = stops[idx];
  const shown = cur.places.filter((p) => !newOnly || p.isNew);
  const newCount = cur.places.filter((p) => p.isNew).length;

  useEffect(() => {
    // scroll only the strip (never the page) so the selected stop is centred
    const box = strip.current;
    const el = box?.querySelector<HTMLElement>(`[data-i="${idx}"]`);
    if (box && el) box.scrollTo({ left: el.offsetLeft - box.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
  }, [idx]);

  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-white">
      {/* stop strip */}
      <div ref={strip} className="no-scrollbar relative overflow-x-auto px-6 pt-7 pb-5">
        <div className="relative flex min-w-[1960px] gap-1">
          <div aria-hidden className="absolute top-5 right-12 left-12 h-0.5 bg-line-2" />
          <motion.div aria-hidden className="absolute top-5 left-12 h-0.5 bg-maroon" animate={{ width: `calc(${(idx / (stops.length - 1)) * 100}% - ${(idx / (stops.length - 1)) * 96}px)` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
          {stops.map((s, i) => {
            const on = i === idx;
            return (
              <button key={s.slug} data-i={i} type="button" aria-pressed={on} onClick={() => setIdx(i)} className="group relative flex min-w-[100px] flex-1 flex-col items-center gap-2.5 px-1 text-center">
                <motion.span
                  animate={{ scale: on ? 1.15 : 1 }}
                  className={clsx(
                    "relative flex size-10 items-center justify-center rounded-full border-2 font-mono text-[13px] font-semibold transition-colors",
                    on ? "border-ink bg-amber text-ink" : s.sideTrip ? "border-dashed border-pine bg-white text-pine group-hover:bg-sage" : i < idx ? "border-maroon bg-maroon text-white" : "border-pine bg-pine text-ground group-hover:bg-pine-2",
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                  {on && <motion.span layoutId="stop-ring" className="absolute -inset-1.5 rounded-full border-2 border-amber" />}
                </motion.span>
                <span className="flex flex-col gap-0.5">
                  <span className={clsx("font-display text-[15px] leading-tight", on ? "font-extrabold" : "font-semibold")}>{s.name}</span>
                  <span className="text-xs text-muted">{s.sideTrip ? labels.sideTrip : s.kind}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* detail */}
      <AnimatePresence mode="wait">
        <motion.div key={cur.slug} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }} className="grid gap-0 border-t border-dashed border-line-2 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="relative min-h-72 overflow-hidden">
            <Photo src={cur.image} alt={cur.name} className="absolute inset-0 h-full w-full [&_img]:animate-kenburns" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgba(10,23,22,0.85)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-6 text-white">
              <span className="eyebrow text-signal">Stop {String(idx + 1).padStart(2, "0")} / {stops.length}{cur.sideTrip ? ` · ${labels.sideTrip}` : ""}{cur.altitude ? ` · ≈ ${cur.altitude.toLocaleString("en-US")} m` : ""}</span>
              <h3 className="font-display text-4xl leading-none font-extrabold tracking-tight md:text-5xl">{cur.name}</h3>
              {cur.nameUr ? <span className="font-urdu text-lg text-mist" lang="ur">{cur.nameUr}</span> : null}
              <p className="max-w-md text-mist">{cur.desc}</p>
            </div>
          </div>
          <div className="flex flex-col gap-5 p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-muted">{cur.places.length} {labels.places}{newCount ? ` · ${newCount} ${labels.new.toLowerCase()}` : ""}</span>
              <div className="flex items-center gap-2">
                <div role="group" aria-label="Filter places" className="flex rounded-full bg-ground p-1">
                  {[["All", false], [`${labels.new} only`, true]].map(([l, v]) => (
                    <button key={String(l)} type="button" aria-pressed={newOnly === v} onClick={() => setNewOnly(v as boolean)} className={clsx("min-h-9 rounded-full px-3.5 text-sm font-semibold", newOnly === v ? "bg-ink text-ground" : "text-ink-2")}>{l as string}</button>
                  ))}
                </div>
                <button type="button" aria-label="Previous stop" disabled={idx === 0} onClick={() => setIdx((i) => Math.max(0, i - 1))} className="flex size-11 items-center justify-center rounded-full border border-line-2 disabled:opacity-40 rtl:rotate-180"><ChevronLeft className="size-5" /></button>
                <button type="button" aria-label="Next stop" disabled={idx === stops.length - 1} onClick={() => setIdx((i) => Math.min(stops.length - 1, i + 1))} className="flex size-11 items-center justify-center rounded-full bg-ink text-ground disabled:opacity-40 rtl:rotate-180"><ChevronRight className="size-5" /></button>
              </div>
            </div>
            <motion.ul layout className="grid gap-3 sm:grid-cols-2">
              <AnimatePresence>
                {shown.map((p, i) => (
                  <motion.li key={p.name} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.03 } }} exit={{ opacity: 0, scale: 0.96 }} className="flex flex-col gap-2 rounded-2xl bg-ground p-4">
                    <span className="flex items-start justify-between gap-2">
                      <span className="font-display text-lg leading-snug font-semibold">{p.name}</span>
                      {p.isNew ? <span className="shrink-0 rounded-md bg-amber px-2 py-1 font-mono text-[10px] font-semibold tracking-widest">{labels.new.toUpperCase()}</span> : null}
                    </span>
                    {p.note ? <span className="text-sm text-ink-2">{p.note}</span> : null}
                    {p.warning ? (
                      <span className="flex items-start gap-2 rounded-xl bg-[#FBEBC8] px-3 py-2 text-[13px] font-medium text-[#5A3A06]">
                        <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden /> {p.warning}
                      </span>
                    ) : null}
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
            {!shown.length ? <p className="rounded-2xl bg-ground p-5 text-muted">No new places at this stop yet.</p> : null}
            <Link href={`/places/${cur.slug}`} className="inline-flex items-center gap-1.5 self-start font-semibold text-maroon hover:underline">
              Hotels, food & services in {cur.name} <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

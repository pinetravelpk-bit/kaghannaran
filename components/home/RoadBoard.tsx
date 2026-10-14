"use client";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Construction } from "lucide-react";
import type { RoadSegment } from "@/lib/types";
import { RoadBadge } from "@/components/ui/StatusBadge";

export type WeatherLite = { name: string; alt: number; temp?: number; label: string };

const ago = (iso: string) => {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins} min ago`;
  const h = Math.round(mins / 60);
  return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`;
};

/** Split-flap style letters that flip in one by one. */
function Flap({ text, delay = 0 }: { text: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <span className="inline-flex gap-[2px]" aria-label={text}>
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          initial={reduce ? false : { rotateX: -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          transition={{ delay: delay + i * 0.05, duration: 0.35 }}
          className="inline-block w-[19px] rounded-[3px] bg-board-2 py-1 text-center text-base font-semibold text-signal [transform-origin:50%_50%_-8px]"
        >
          {ch === " " ? " " : ch}
        </motion.span>
      ))}
    </span>
  );
}

export function RoadBoard({ road, weather }: { road: RoadSegment[]; weather: WeatherLite[] }) {
  const last = road.reduce((a, r) => (r.updatedAt > a ? r.updatedAt : a), road[0]?.updatedAt ?? new Date().toISOString());
  return (
    <div className="rounded-[22px] border border-[#23403B] bg-board/95 p-6 font-mono shadow-2xl shadow-black/40 backdrop-blur" dir="ltr">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-[#2E4A45] pb-4">
        <div className="flex items-center gap-2.5 text-sm font-semibold tracking-[0.16em] text-signal">
          <span className="size-2 animate-pulse-dot rounded-full bg-signal" aria-hidden />
          <Construction className="size-5" aria-hidden /> ROAD STATUS · N-15
        </div>
        <span className="text-[11px] tracking-widest text-[#7F9893]">UPDATED {ago(last).toUpperCase()}</span>
      </div>
      <ul>
        {road.map((r, i) => (
          <li key={r.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-[#1C3330] py-3 text-ground">
            <span className="flex min-w-0 flex-col">
              <span className="text-sm font-semibold tracking-wide uppercase">{r.segment}</span>
              <span className="truncate text-xs text-[#7F9893]">{r.note}</span>
            </span>
            <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1 + i * 0.12 }}>
              <RoadBadge status={r.status} />
            </motion.span>
          </li>
        ))}
      </ul>
      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4" id="weather-mini">
        {weather.map((w, i) => (
          <div key={w.name} className="flex flex-col gap-1 rounded-xl bg-pine px-3 py-2.5 text-ground">
            <span className="text-[10px] tracking-widest text-fog uppercase">{w.name}</span>
            {w.temp !== undefined ? <Flap text={`${Math.round(w.temp)}°`} delay={1.2 + i * 0.15} /> : <span className="text-lg font-semibold text-signal">—°</span>}
            <span className="truncate text-[10px] text-[#7F9893]">{w.label} · {w.alt.toLocaleString("en-US")} m</span>
          </div>
        ))}
      </div>
      <Link href="/road" className="mt-4 inline-block text-xs tracking-widest text-signal hover:underline">FULL ROAD & WEATHER →</Link>
    </div>
  );
}

"use client";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import type { Stop } from "@/lib/types";
import { Counter } from "@/components/ui/Counter";
import { EarthView } from "./EarthView";

const hasWebGL = () => {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
};

/** Animated elevation profile + "valley by numbers" + places-per-stop bars. All numbers come from the data. */
export function Infographic({ stops, trails }: { stops: Stop[]; trails: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const reduce = useReducedMotion();
  const [view, setView] = useState<"3d" | "2d">("3d");
  const [webgl, setWebgl] = useState(true);
  useEffect(() => { if (!hasWebGL()) { setWebgl(false); setView("2d"); } }, []);
  const main = stops.filter((s) => !s.sideTrip);
  const known = main.filter((s) => s.altitude);
  const W = 1000, H = 300, PAD = 40;
  const maxAlt = 4400, minAlt = 600;
  const xOf = (i: number) => PAD + (i / (main.length - 1)) * (W - PAD * 2);
  const yOf = (a: number) => H - PAD - ((a - minAlt) / (maxAlt - minAlt)) * (H - PAD * 2);
  // interpolate altitude for stops without a figure, from neighbours with one
  const alts = main.map((s, i) => {
    if (s.altitude) return s.altitude;
    const prev = [...main.slice(0, i)].reverse().find((x) => x.altitude);
    const next = main.slice(i + 1).find((x) => x.altitude);
    if (!prev || !next) return prev?.altitude ?? next?.altitude ?? 1500;
    const pi = main.indexOf(prev), ni = main.indexOf(next);
    return prev.altitude! + ((next.altitude! - prev.altitude!) * (i - pi)) / (ni - pi);
  });
  const earthStops = main.map((s) => ({ slug: s.slug, name: s.name, major: !!s.altitude }));
  const pts = alts.map((a, i) => [xOf(i), yOf(a)] as const);
  const line = pts.map((p, i) => {
    if (i === 0) return `M ${p[0]} ${p[1]}`;
    const [x0, y0] = pts[i - 1];
    const cx = (x0 + p[0]) / 2;
    return `C ${cx} ${y0}, ${cx} ${p[1]}, ${p[0]} ${p[1]}`;
  }).join(" ");
  const area = `${line} L ${xOf(main.length - 1)} ${H - PAD} L ${xOf(0)} ${H - PAD} Z`;

  const total = stops.reduce((a, s) => a + s.places.length, 0);
  const fresh = stops.reduce((a, s) => a + s.places.filter((p) => p.isNew).length, 0);
  const maxPlaces = Math.max(...stops.map((s) => s.places.length));
  const top = known.at(-1)?.altitude ?? 4173;
  const bottom = known[0]?.altitude ?? 980;

  const tiles = [
    { n: stops.length, l: "stops on the route" },
    { n: total, l: "places to visit" },
    { n: fresh, l: "new finds added" },
    { n: trails, l: "jeep tracks & hikes" },
    { n: top, l: "metres at Babusar Top", s: "" },
    { n: top - bottom, l: "metres of climb from Balakot" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {tiles.map((t, i) => (
          <motion.div key={t.l} initial={reduce ? false : { opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} className="flex flex-col gap-1 rounded-2xl border border-[#2E4A45] bg-pine-2 p-5">
            <Counter to={t.n} className="font-display text-4xl font-extrabold tracking-tight text-signal md:text-5xl" />
            <span className="text-sm text-mist">{t.l}</span>
          </motion.div>
        ))}
      </div>

      <div className="rounded-3xl border border-[#2E4A45] bg-board p-5 md:p-8">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-2xl font-bold text-ground">{view === "3d" ? "The N-15 in 3D, from Balakot to Babusar Top" : "Elevation along the N-15"}</h3>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs tracking-widest text-[#7F9893]">{view === "3d" ? "REAL TERRAIN & SATELLITE IMAGERY" : "APPROXIMATE · LABELLED HEIGHTS KNOWN, OTHERS INTERPOLATED"}</span>
            {webgl ? (
              <div role="radiogroup" aria-label="Chart view" className="flex rounded-full border border-[#2E4A45] p-0.5 font-mono text-xs">
                {(["3d", "2d"] as const).map((v) => (
                  <button key={v} role="radio" aria-checked={view === v} onClick={() => setView(v)} className={clsx("min-h-8 rounded-full px-3 tracking-widest uppercase transition", view === v ? "bg-signal text-ink" : "text-mist hover:text-white")}>{v}</button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        {view === "3d" ? (
          <EarthView stops={earthStops} />
        ) : (
        <div className="overflow-x-auto">
          <svg ref={ref} viewBox={`0 0 ${W} ${H + 60}`} className="min-w-[760px]" role="img" aria-label={`Elevation rises from about ${bottom} metres at Balakot to ${top} metres at Babusar Top.`}>
            {[1000, 2000, 3000, 4000].map((a) => (
              <g key={a}>
                <line x1={PAD} x2={W - PAD} y1={yOf(a)} y2={yOf(a)} stroke="#1C3330" strokeDasharray="4 6" />
                <text x={PAD - 8} y={yOf(a) + 4} textAnchor="end" fontSize="11" fill="#7F9893" fontFamily="JetBrains Mono">{a / 1000}k</text>
              </g>
            ))}
            <motion.path d={area} fill="#F3C64B" initial={{ opacity: 0 }} animate={inView ? { opacity: 0.12 } : {}} transition={{ duration: 1.2, delay: 0.8 }} />
            <motion.path d={line} fill="none" stroke="#F3C64B" strokeWidth={3} strokeLinecap="round" initial={reduce ? false : { pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}} transition={{ duration: 2.2, ease: "easeInOut" }} />
            {main.map((s, i) => (
              <motion.g key={s.slug} initial={reduce ? false : { opacity: 0, y: 8 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 + (i / main.length) * 2 }}>
                <circle cx={pts[i][0]} cy={pts[i][1]} r={s.altitude ? 6 : 3.5} fill={s.altitude ? "#F2A33A" : "#C9D4CF"} stroke="#0A1716" strokeWidth={2} />
                {s.altitude ? (
                  <>
                    <text x={pts[i][0]} y={pts[i][1] - 14} textAnchor="middle" fontSize="12" fill="#EEF1EE" fontFamily="JetBrains Mono" fontWeight={600}>{s.altitude.toLocaleString("en-US")} m</text>
                  </>
                ) : null}
                <text x={pts[i][0]} y={H - PAD + 22} textAnchor="end" fontSize="11" fill={s.altitude ? "#EEF1EE" : "#7F9893"} fontFamily="Geist, ui-sans-serif, sans-serif" transform={`rotate(-35 ${pts[i][0]} ${H - PAD + 22})`}>{s.name}</text>
              </motion.g>
            ))}
          </svg>
        </div>
        )}
      </div>

      <div className="rounded-3xl border border-[#2E4A45] bg-board p-5 md:p-8">
        <h3 className="mb-5 font-display text-2xl font-bold text-ground">Places to visit, by stop</h3>
        <ul className="grid gap-2">
          {stops.map((s, i) => (
            <li key={s.slug} className="grid grid-cols-[140px_minmax(0,1fr)_32px] items-center gap-3 text-sm">
              <span className="truncate text-mist">{s.name}</span>
              <span className="relative h-3 overflow-hidden rounded-full bg-[#1C3330]">
                <motion.span className="absolute inset-y-0 left-0 rounded-full bg-amber rtl:right-0 rtl:left-auto" initial={reduce ? false : { width: 0 }} whileInView={{ width: `${(s.places.length / maxPlaces) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.9, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }} />
              </span>
              <span className="text-right font-mono text-signal">{s.places.length}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

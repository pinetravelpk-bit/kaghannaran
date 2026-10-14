"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "motion/react";
import { clsx } from "clsx";
import { Plus, Minus, Compass, Home, Play, Square, Hand, X, Loader2 } from "lucide-react";
import type { Command, CommandInput, EarthStop, TerrainMeta } from "./EarthScene";

const EarthScene = dynamic(() => import("./EarthScene"), { ssr: false });

const btn = "flex size-10 items-center justify-center rounded-full bg-[#0a1716]/80 text-white shadow-lg backdrop-blur transition hover:bg-[#8E1B1B] disabled:opacity-40";

/** Real-terrain valley map with Google Earth style controls, a road tour and a live elevation strip. */
export function EarthView({ stops }: { stops: EarthStop[] }) {
  const box = useRef<HTMLDivElement>(null);
  const near = useInView(box, { once: true, margin: "400px" });
  const [data, setData] = useState<{ meta: TerrainMeta; heights: Uint16Array } | null>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [touring, setTouring] = useState(false);
  const [tourKm, setTourKm] = useState(0);
  const [command, setCommand] = useState<Command | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const n = useRef(0);
  const send = useCallback((c: CommandInput) => setCommand({ ...c, n: ++n.current } as Command), []);

  useEffect(() => {
    if (!near || data) return;
    Promise.all([
      fetch("/terrain/meta.json").then((r) => r.json()),
      fetch("/terrain/height.bin").then((r) => r.arrayBuffer()),
    ]).then(([meta, buf]) => setData({ meta, heights: new Uint16Array(buf) })).catch(() => setFailed(true));
  }, [near, data]);

  // lighter mesh on phones and low-power devices
  const [step, setStep] = useState(1);
  useEffect(() => { if (window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4) setStep(2); }, []);

  const fly = (slug: string) => { setTouring(false); setFocus(slug); send({ kind: "fly", slug }); };
  const startTour = () => { setInteractive(true); setFocus(null); setTourKm(0); setTouring(true); };
  const stopTour = () => setTouring(false);

  const meta = data?.meta;
  const nextStop = useMemo(() => {
    if (!meta) return null;
    const passed = stops.filter((s) => meta.stops[s.slug] && meta.stops[s.slug].km <= tourKm + 0.5);
    return passed.at(-1) ?? null;
  }, [meta, stops, tourKm]);
  const eleAt = (km: number) => meta?.route.find((r) => r[3] >= km)?.[2] ?? 0;

  return (
    <div className="flex flex-col gap-3">
      <div ref={box} className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[#1a2c2a] sm:aspect-[16/10] lg:aspect-[16/8]">
        {data ? (
          <EarthScene
            meta={data.meta}
            heights={data.heights}
            textureUrl="/terrain/satellite.jpg"
            hiResUrl={step === 1 ? "/terrain/satellite-4k.jpg" : undefined}
            stops={stops}
            interactive={interactive}
            command={command}
            touring={touring}
            tourKm={tourKm}
            onTourKm={setTourKm}
            onTourEnd={() => setTouring(false)}
            onPick={fly}
            step={step}
            onReady={() => setReady(true)}
          />
        ) : null}

        {!ready ? (
          <div className="absolute inset-0 flex items-center justify-center gap-2 font-mono text-xs tracking-widest text-[#7F9893]">
            {failed ? "MAP COULD NOT LOAD. TRY THE 2D CHART." : <><Loader2 className="size-4 animate-spin" />LOADING SATELLITE TERRAIN…</>}
          </div>
        ) : null}

        {ready && !interactive ? (
          // until the visitor opts in, the page scrolls normally over the map (like embedded maps)
          <button type="button" onClick={() => setInteractive(true)} className="absolute inset-0 z-40 flex items-center justify-center bg-black/10">
            <span className="flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink shadow-xl">
              <Hand className="size-4" aria-hidden />Explore in 3D
            </span>
          </button>
        ) : null}

        {ready && interactive ? (
          <>
            <div className="absolute top-3 right-3 z-40 flex flex-col gap-2">
              <button type="button" className={btn} onClick={() => { setTouring(false); setInteractive(false); }} aria-label="Stop exploring"><X className="size-4" /></button>
              <button type="button" className={btn} onClick={() => send({ kind: "zoom", by: 0.6 })} disabled={touring} aria-label="Zoom in"><Plus className="size-4" /></button>
              <button type="button" className={btn} onClick={() => send({ kind: "zoom", by: 1.6 })} disabled={touring} aria-label="Zoom out"><Minus className="size-4" /></button>
              <button type="button" className={btn} onClick={() => send({ kind: "north" })} disabled={touring} aria-label="Face north"><Compass className="size-4" /></button>
              <button type="button" className={btn} onClick={() => { setTouring(false); setFocus(null); send({ kind: "home" }); }} aria-label="Reset view"><Home className="size-4" /></button>
            </div>
            <p className="pointer-events-none absolute top-3 left-3 hidden rounded-full bg-[#0a1716]/70 px-3 py-1.5 font-mono text-[11px] text-white/80 backdrop-blur md:block">
              Drag to rotate · Right-drag to pan · Scroll to zoom · Click a place to fly there
            </p>
          </>
        ) : null}

        {ready ? (
          <div className="absolute bottom-3 left-3 z-40 flex flex-wrap items-center gap-2">
            <button type="button" onClick={touring ? stopTour : startTour} className="flex items-center gap-2 rounded-full bg-amber px-4 py-2.5 text-sm font-semibold text-ink shadow-lg hover:bg-signal">
              {touring ? <><Square className="size-3.5" aria-hidden />Stop tour</> : <><Play className="size-3.5" aria-hidden />Fly the N-15</>}
            </button>
            {touring ? (
              <span className="rounded-full bg-[#0a1716]/85 px-3 py-2 font-mono text-xs text-white backdrop-blur">
                {nextStop?.name ?? "Balakot"} · km {tourKm.toFixed(0)} · {eleAt(tourKm).toLocaleString("en-US")} m
              </span>
            ) : null}
          </div>
        ) : null}

        {meta ? <p className="pointer-events-none absolute right-3 bottom-1.5 hidden max-w-[55%] text-right text-[9px] leading-tight text-white/70 md:block">{meta.credits.join(" · ")}</p> : null}
      </div>

      {meta ? <p className="text-[10px] leading-tight text-[#5E7571] md:hidden">{meta.credits.join(" · ")}</p> : null}
      {meta ? <div className="overflow-x-auto"><div className="min-w-[640px]"><Profile meta={meta} stops={stops} km={touring ? tourKm : focus ? meta.stops[focus]?.km : undefined} onPick={(km) => { setInteractive(true); setTouring(false); setFocus(null); send({ kind: "km", km }); }} /></div></div> : null}

      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {stops.filter((s) => meta?.stops[s.slug]).map((s) => (
          <button key={s.slug} type="button" onClick={() => { setInteractive(true); fly(s.slug); }} className={clsx("shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition", focus === s.slug ? "border-signal bg-signal text-ink" : "border-[#2E4A45] text-mist hover:border-mist hover:text-white")}>
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Real elevation along the road (from the terrain data), with stop ticks and a cursor. Click to fly there. */
function Profile({ meta, stops, km, onPick }: { meta: TerrainMeta; stops: EarthStop[]; km?: number; onPick: (km: number) => void }) {
  const W = 1000, H = 120, P = 6;
  const total = meta.route.at(-1)![3];
  const lo = 500, hi = 4500;
  const x = (k: number) => P + (k / total) * (W - 2 * P);
  const y = (e: number) => H - 18 - ((e - lo) / (hi - lo)) * (H - 30);
  const line = meta.route.filter((_, i) => i % 3 === 0 || i === meta.route.length - 1).map((r, i) => `${i ? "L" : "M"}${x(r[3]).toFixed(1)} ${y(r[2]).toFixed(1)}`).join(" ");
  const ref = useRef<SVGSVGElement>(null);
  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      className="w-full cursor-crosshair"
      role="img"
      aria-label={`Road elevation from ${meta.route[0][2]} m at Balakot to ${meta.route.at(-1)![2]} m at Babusar Top over ${total.toFixed(0)} km.`}
      onClick={(e) => {
        const r = ref.current!.getBoundingClientRect();
        onPick(Math.max(0, Math.min(total, (((e.clientX - r.left) / r.width) * W - P) / (W - 2 * P) * total)));
      }}
    >
      {[1000, 2000, 3000, 4000].map((a) => (
        <g key={a}>
          <line x1={P} x2={W - P} y1={y(a)} y2={y(a)} stroke="#1C3330" strokeDasharray="3 6" />
          <text x={W - P} y={y(a) - 3} textAnchor="end" fontSize="10" fill="#5E7571" fontFamily="JetBrains Mono">{a / 1000}k m</text>
        </g>
      ))}
      <path d={`${line} L ${x(total)} ${H - 18} L ${x(0)} ${H - 18} Z`} fill="#F3C64B" opacity={0.12} />
      <path d={line} fill="none" stroke="#F3C64B" strokeWidth={2} />
      {stops.filter((s) => meta.stops[s.slug]).map((s) => {
        const m = meta.stops[s.slug];
        return (
          <g key={s.slug}>
            <circle cx={x(m.km)} cy={y(m.ele)} r={s.major ? 4 : 2.5} fill={s.major ? "#F2A33A" : "#C9D4CF"} stroke="#0A1716" strokeWidth={1.5} />
            {s.major ? <text x={x(m.km)} y={H - 4} textAnchor={m.km < 5 ? "start" : m.km > total - 5 ? "end" : "middle"} fontSize="10.5" fill="#EEF1EE" fontFamily="Geist, sans-serif">{s.name}</text> : null}
          </g>
        );
      })}
      {km !== undefined ? <line x1={x(km)} x2={x(km)} y1={8} y2={H - 18} stroke="#ffffff" strokeWidth={1.5} /> : null}
      <text x={P} y={12} fontSize="10" fill="#7F9893" fontFamily="JetBrains Mono">ROAD ELEVATION · {total.toFixed(0)} KM · CLICK TO FLY THERE</text>
    </svg>
  );
}

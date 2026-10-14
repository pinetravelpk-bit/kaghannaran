"use client";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Search, ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { RoadSegment, Stop } from "@/lib/types";
import { RoadBoard, type WeatherLite } from "./RoadBoard";

const TerrainScene = dynamic(() => import("./TerrainScene"), { ssr: false, loading: () => <div className="h-full w-full bg-pine" /> });

export function Hero({ t, stops, road, weather }: { t: Dictionary; stops: Stop[]; road: RoadSegment[]; weather: WeatherLite[] }) {
  const reduce = !!useReducedMotion();
  const router = useRouter();
  const tabs = [
    { id: "", label: t.tabs.all },
    { id: "hotel", label: t.tabs.hotel },
    { id: "restaurant", label: t.tabs.restaurant },
    { id: "jeep-operator", label: t.tabs.jeep },
    { id: "tour-guide", label: t.tabs.guide },
    { id: "adventure", label: t.tabs.adventure },
  ];
  const [tab, setTab] = useState("hotel");
  const [q, setQ] = useState("");
  const [stop, setStop] = useState("");
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 120]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0.3]);

  const words1 = t.hero.title1.split(" ");
  const words2 = t.hero.title2.split(" ");

  return (
    <section className="relative isolate overflow-hidden bg-pine text-ground">
      <motion.div style={reduce ? undefined : { y, opacity }} className="absolute inset-0 -z-10" aria-hidden>
        <TerrainScene reduce={reduce} />
      </motion.div>
      {/* readability scrim: solid pine on the text side */}
      <div aria-hidden className="absolute inset-y-0 left-0 -z-10 w-full bg-[linear-gradient(90deg,#12302C_0%,rgba(18,48,44,0.92)_35%,rgba(18,48,44,0.35)_70%,rgba(18,48,44,0.2)_100%)] rtl:bg-[linear-gradient(270deg,#12302C_0%,rgba(18,48,44,0.92)_35%,rgba(18,48,44,0.35)_70%,rgba(18,48,44,0.2)_100%)]" />

      <div className="mx-auto flex min-h-[calc(100svh-120px)] max-w-[1320px] flex-wrap items-center gap-12 px-4 pt-14 pb-24 md:px-6">
        <div className="flex min-w-0 flex-[1_1_540px] flex-col gap-7">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="eyebrow text-signal">
            {t.hero.kicker}
          </motion.span>
          <h1 className="font-display text-[clamp(46px,6.6vw,96px)] leading-[0.95] font-extrabold tracking-[-0.035em]">
            {words1.map((w, i) => (
              <motion.span key={i} className="inline-block pe-[0.25em]" initial={reduce ? false : { opacity: 0, y: 40, rotate: 4 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ delay: 0.15 + i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
                {w}
              </motion.span>
            ))}
            <br />
            {words2.map((w, i) => (
              <motion.span key={i} className="inline-block pe-[0.25em] text-amber" initial={reduce ? false : { opacity: 0, y: 40, rotate: 4 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ delay: 0.45 + i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
                {w}
              </motion.span>
            ))}
          </h1>
          <motion.p initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.8 }} className="max-w-xl text-lg text-mist md:text-xl">
            {t.hero.sub}
          </motion.p>

          <motion.form
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={(e) => {
              e.preventDefault();
              const p = new URLSearchParams();
              if (tab) p.set("type", tab);
              if (q) p.set("q", q);
              if (stop) p.set("stop", stop);
              router.push(`/directory?${p.toString()}`);
            }}
            className="flex max-w-2xl flex-col gap-2.5 rounded-[22px] bg-ground p-2.5 text-ink shadow-2xl shadow-black/30"
          >
            <div role="group" aria-label="Category" className="no-scrollbar flex gap-1 overflow-x-auto px-1 pt-1">
              {tabs.map((x) => (
                <button key={x.id} type="button" aria-pressed={tab === x.id} onClick={() => setTab(x.id)} className={clsx("relative min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition", tab === x.id ? "text-ground" : "text-ink-2 hover:bg-white")}>
                  {tab === x.id && <motion.span layoutId="hero-tab" className="absolute inset-0 -z-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                  <span className="relative">{x.label}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2.5">
              <label className="flex min-w-52 flex-[2_1_220px] flex-col gap-0.5 rounded-2xl bg-white px-4 py-2.5">
                <span className="text-xs font-semibold tracking-wide text-muted uppercase">{t.hero.search}</span>
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.hero.searchPlaceholder} className="bg-transparent text-[17px] outline-none placeholder:text-[#7A8784]" />
              </label>
              <label className="flex min-w-40 flex-[1_1_160px] flex-col gap-0.5 rounded-2xl bg-white px-4 py-2.5">
                <span className="text-xs font-semibold tracking-wide text-muted uppercase">{t.hero.near}</span>
                <select value={stop} onChange={(e) => setStop(e.target.value)} className="bg-transparent text-[17px] outline-none">
                  <option value="">{t.hero.wholeValley}</option>
                  {stops.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
                </select>
              </label>
              <button type="submit" className="flex min-h-14 items-center gap-2.5 rounded-2xl bg-ink px-7 font-semibold text-ground transition hover:bg-maroon">
                <Search className="size-[18px]" aria-hidden /> {t.hero.search}
              </button>
            </div>
          </motion.form>
        </div>

        <motion.div initial={reduce ? false : { opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6, duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="min-w-0 flex-[1_1_440px]">
          <RoadBoard road={road} weather={weather} />
        </motion.div>
      </div>
      <a href="#route" aria-label="Scroll to the route" className="absolute bottom-6 left-1/2 flex size-11 -translate-x-1/2 animate-float items-center justify-center rounded-full border border-white/30 text-white">
        <ChevronDown className="size-5" />
      </a>
    </section>
  );
}

"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { photo } from "@/lib/media";

const SIGHTS = [
  { name: "Saif-ul-Malook", tag: "Lake · below Malika Parbat", note: "The legendary lake, its legend cave, Kach Gali and the start of the Ansoo trek.", img: photo("malikaParbat"), href: "/places/naran", big: true },
  { name: "Lulusar", tag: "Lake · source of the Kunhar", note: "No boating, so it stays quiet.", img: photo("lulusar"), href: "/places/lulusar" },
  { name: "Babusar Top", tag: "4,173 m · zipline & views", note: "Sambaksar Lake is visible from the top.", img: photo("lulusar2"), href: "/places/babusar-top" },
  { name: "Lalazar", tag: "Meadow · jeep from Batakundi", note: "Old Dak Bungalow and a small forest.", img: photo("lalazar"), href: "/places/batakundi" },
  { name: "Jalkhad", tag: "Junction · Noori Top & Pyala Lake", note: "Tiger Peak views where the Sharda road joins.", img: photo("jalkhad"), href: "/places/jalkhad" },
  { name: "Ansoo Lake", tag: "Trek · ≈ 10 hrs return", note: "Start before 9 am. A horse helps at the stream crossings.", img: photo("ansoo"), href: "/trails#ansoo-lake" },
  { name: "Dudipatsar", tag: "Trek · from Besal", note: "Overnight at Mullah ki Basti, then 2 hours to the lake.", img: photo("dudipatsar"), href: "/trails#dudipatsar" },
  { name: "Siri & Paye", tag: "Meadows · jeep from Shogran", note: "Arrive at Paye before 2 pm. Makra Peak trek starts here.", img: photo("shogran"), href: "/places/shogran" },
];

function Tile({ s, i }: { s: (typeof SIGHTS)[number]; i: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  return (
    <motion.a
      ref={ref}
      href={s.href}
      initial={reduce ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay: (i % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative isolate flex flex-col justify-end overflow-hidden rounded-3xl bg-pine p-6 text-white ${s.big ? "min-h-[580px] md:row-span-2" : "min-h-[280px]"}`}
    >
      <motion.span style={reduce ? undefined : { y }} className="absolute -inset-y-[14%] inset-x-0 -z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={s.img} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
      </motion.span>
      <span className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(10,23,22,0)_35%,rgba(10,23,22,0.88)_100%)]" />
      <span className="eyebrow text-signal">{s.tag}</span>
      <span className={`font-display leading-[0.9] font-extrabold tracking-[-0.04em] ${s.big ? "text-6xl md:text-7xl" : "text-4xl md:text-5xl"}`}>{s.name}</span>
      <span className="mt-2 max-w-sm text-mist">{s.note}</span>
      <span className="absolute top-5 right-5 flex size-11 items-center justify-center rounded-full bg-white/15 backdrop-blur transition group-hover:rotate-45 group-hover:bg-amber group-hover:text-ink" aria-hidden>↗</span>
    </motion.a>
  );
}

export function Sights() {
  return (
    <div className="grid auto-rows-[280px] gap-3.5 md:grid-cols-2 lg:grid-cols-3">
      {SIGHTS.map((s, i) => <Tile key={s.name} s={s} i={i} />)}
    </div>
  );
}

export function PlaceMarquee({ names }: { names: string[] }) {
  const list = [...names, ...names];
  return (
    <div className="overflow-hidden border-y border-[#23403B] bg-board py-4" aria-hidden>
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap font-display text-2xl font-semibold text-ground/80">
        {list.map((n, i) => (
          <span key={i} className="flex items-center gap-10">{n}<span className="text-amber">✦</span></span>
        ))}
      </div>
    </div>
  );
}


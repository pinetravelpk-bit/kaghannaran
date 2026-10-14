"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Search, Check } from "lucide-react";
import { clsx } from "clsx";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Stop } from "@/lib/types";
import { OPTIONS, STAY_TYPES } from "@/lib/search";

type TabId = "all" | "hotel" | "restaurant" | "jeep" | "guide" | "adventure";
const TYPE_FOR: Record<TabId, string> = { all: "", hotel: STAY_TYPES, restaurant: "restaurant", jeep: "jeep-operator", guide: "tour-guide", adventure: "adventure" };

function Box({ label, children, grow = 1 }: { label: string; children: React.ReactNode; grow?: number }) {
  return (
    <label style={{ flexGrow: grow }} className="flex min-w-40 basis-40 flex-col gap-0.5 rounded-2xl bg-white px-4 py-2.5">
      <span className="text-xs font-semibold tracking-wide text-muted uppercase">{label}</span>
      {children}
    </label>
  );
}

const input = "w-full bg-transparent text-[17px] outline-none placeholder:text-[#7A8784]";

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className={clsx("flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition", on ? "border-ink bg-ink text-ground" : "border-line-2 bg-white text-ink-2 hover:border-ink")}>
      {on ? <Check className="size-3.5" aria-hidden /> : null}
      {children}
    </button>
  );
}

export function Finder({ t, stops }: { t: Dictionary; stops: Stop[] }) {
  const reduce = !!useReducedMotion();
  const router = useRouter();
  const f = t.finder;
  const tabs: { id: TabId; label: string }[] = [
    { id: "all", label: t.tabs.all },
    { id: "hotel", label: t.tabs.hotel },
    { id: "restaurant", label: t.tabs.restaurant },
    { id: "jeep", label: t.tabs.jeep },
    { id: "guide", label: t.tabs.guide },
    { id: "adventure", label: t.tabs.adventure },
  ];
  const [tab, setTab] = useState<TabId>("all");
  const [stop, setStop] = useState("");
  // per-tab values; cleared when switching tabs so filters never leak between categories
  const [v, setV] = useState<Record<string, string>>({});
  const [multi, setMulti] = useState<string[]>([]);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setV((x) => ({ ...x, [k]: e.target.value }));
  const toggle = (k: string) => setV((x) => ({ ...x, [k]: x[k] ? "" : "1" }));
  const pick = (o: string) => setMulti((m) => (m.includes(o) ? m.filter((x) => x !== o) : [...m, o]));

  const switchTab = (id: TabId) => { setTab(id); setV({}); setMulti([]); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams();
    const type = v.stay || TYPE_FOR[tab];
    if (type) p.set("type", type);
    if (stop) p.set("stop", stop);
    for (const k of ["q", "budget", "route", "seats", "area", "lang", "activity", "age", "family", "firstaid"]) if (v[k]) p.set(k, v[k]);
    if (multi.length) p.set(tab === "restaurant" ? "cuisine" : "amen", multi.join(","));
    router.push(`/directory?${p.toString()}`);
  };

  const near = (
    <Box label={t.hero.near}>
      <select value={stop} onChange={(e) => setStop(e.target.value)} className={input}>
        <option value="">{t.hero.wholeValley}</option>
        {stops.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
      </select>
    </Box>
  );
  const text = (grow = 2) => (
    <Box label={t.hero.search} grow={grow}>
      <input value={v.q ?? ""} onChange={set("q")} placeholder={f.ph[tab]} className={input} />
    </Box>
  );
  const select = (k: string, label: string, opts: { v: string; l: string }[]) => (
    <Box label={label}>
      <select value={v[k] ?? ""} onChange={set(k)} className={input}>
        {opts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </Box>
  );
  const any = (label: string, list: string[]) => [{ v: "", l: label }, ...list.map((x) => ({ v: x, l: x }))];

  const fields: Record<TabId, React.ReactNode> = {
    all: <>{text()}{near}</>,
    hotel: <>{select("stay", f.stayType, OPTIONS.stay)}{near}{select("budget", f.budget, OPTIONS.budget)}</>,
    restaurant: <>{text()}{near}</>,
    jeep: <>{select("route", f.route, any(f.anyRoute, OPTIONS.routes))}{near}{select("seats", f.seats, OPTIONS.seats)}</>,
    guide: <>{select("area", f.area, any(f.anyArea, OPTIONS.areas))}{select("lang", f.language, any(f.anyLanguage, OPTIONS.languages))}</>,
    adventure: <>{select("activity", f.activity, any(f.anyActivity, OPTIONS.activities))}{near}{select("age", f.youngest, [{ v: "", l: f.anyAge }, ...["5", "8", "12", "16"].map((a) => ({ v: a, l: `${a} ${f.years}` }))])}</>,
  };

  const chips: Partial<Record<TabId, React.ReactNode>> = {
    hotel: <>{OPTIONS.amenities.map((o) => <Chip key={o} on={multi.includes(o)} onClick={() => pick(o)}>{o}</Chip>)}</>,
    restaurant: <>{OPTIONS.cuisine.map((o) => <Chip key={o} on={multi.includes(o)} onClick={() => pick(o)}>{o}</Chip>)}<Chip on={!!v.family} onClick={() => toggle("family")}>{f.familyArea}</Chip></>,
    guide: <Chip on={!!v.firstaid} onClick={() => toggle("firstaid")}>{f.firstAid}</Chip>,
  };
  const chipsLabel: Partial<Record<TabId, string>> = { hotel: f.mustHave, restaurant: f.cuisine };

  return (
    <motion.form
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.95, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      onSubmit={submit}
      className="flex max-w-2xl flex-col gap-2.5 rounded-[22px] bg-ground p-2.5 text-ink shadow-2xl shadow-black/30"
    >
      <div role="tablist" aria-label="Category" className="no-scrollbar flex gap-1 overflow-x-auto px-1 pt-1">
        {tabs.map((x) => (
          <button key={x.id} type="button" role="tab" aria-selected={tab === x.id} onClick={() => switchTab(x.id)} className={clsx("relative min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition", tab === x.id ? "text-ground" : "text-ink-2 hover:bg-white")}>
            {tab === x.id && <motion.span layoutId="hero-tab" className="absolute inset-0 -z-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
            <span className="relative">{x.label}</span>
          </button>
        ))}
      </div>
      <motion.div
        key={tab}
        role="tabpanel"
        initial={reduce ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="flex flex-col gap-2.5"
      >
        <div className="flex flex-wrap gap-2.5">
          {fields[tab]}
          <button type="submit" className="flex min-h-14 grow items-center justify-center gap-2.5 rounded-2xl bg-ink px-7 font-semibold text-ground transition hover:bg-maroon sm:grow-0">
            <Search className="size-[18px]" aria-hidden /> {f.cta[tab]}
          </button>
        </div>
        {chips[tab] ? (
          <div className="flex flex-wrap items-center gap-1.5 px-1 pb-1">
            {chipsLabel[tab] ? <span className="me-1 text-xs font-semibold tracking-wide text-muted uppercase">{chipsLabel[tab]}</span> : null}
            {chips[tab]}
          </div>
        ) : null}
      </motion.div>
    </motion.form>
  );
}

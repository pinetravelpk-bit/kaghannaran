import "server-only";
import type { Listing, RoadSegment, Stop } from "@/lib/types";
import type { QA } from "@/lib/seo";
import { distKm, elevationAt, landmarks, nearestRoute, stopGeo } from "@/lib/geo";

/**
 * Written content for each listing, built only from facts the site can measure: the map position,
 * SRTM ground height, the N-15 route from OpenStreetMap, distances to landmarks and to other
 * listings, and the business type. Nothing about rooms, prices or quality is invented; owners add
 * those when they claim a listing.
 */

export type Pos = { lat: number; lon: number };
export const posOf = (l: Listing): Pos | undefined =>
  typeof l.attributes.lat === "number" && typeof l.attributes.lon === "number" ? { lat: l.attributes.lat, lon: l.attributes.lon } : undefined;

const NARAN_BAZAAR = { lat: 34.90847, lon: 73.65231 };
const fmtKm = (km: number) => (km < 1 ? `${Math.max(50, Math.round((km * 1000) / 50) * 50)} m` : `${km < 10 ? km.toFixed(1) : Math.round(km)} km`);
const m = (n: number) => `${n.toLocaleString("en-US")} m`;

const SHOP_KIND: Record<string, string> = {
  "General store": "general store", Handicrafts: "handicraft and gift shop", Clothing: "clothing and shawl shop",
  "Mobile & SIM": "mobile phone and SIM shop", "Outdoor gear": "camping and outdoor gear shop", Pharmacy: "pharmacy", Other: "shop",
};
const SERVICES = (l: Listing) => (Array.isArray(l.attributes.services) ? l.attributes.services : []).map((s) => s.toLowerCase());

/** What the business is, in plain words, from its type and category. */
export function kindOf(l: Listing): string {
  switch (l.type) {
    case "hotel": return "hotel";
    case "guest-house": return "guest house";
    case "camping": return "campsite";
    case "restaurant": return /coffee|cafe|café|donut|creme|subway|deli/i.test(l.name) ? "cafe and place to eat" : "restaurant";
    case "shop": return SHOP_KIND[String(l.attributes.category)] ?? "shop";
    case "fuel": return SERVICES(l).length ? `${SERVICES(l).join(" and ")} service` : "repair service";
    case "jeep-operator": return /bike/i.test(l.name) ? "motorbike rental" : "transport service";
    case "tour-company": return "tour operator";
    default: return "business";
  }
}

const roadOf = (address: string) => {
  const first = address.split(",")[0].trim();
  if (/saif|jheel/i.test(first)) return "saif";
  if (/highway|chilas|babusar|N-15/i.test(first)) return "n15";
  return "";
};

export type Facts = {
  pos: Pos; town: string; townSlug: string; kind: string; ele?: number;
  kmFromBalakot: number; offRoadKm: number; bazaarKm: number; naranRoadKm?: number; road: "saif" | "n15" | "";
};

export function factsOf(l: Listing, stop?: Stop): Facts | undefined {
  const pos = posOf(l);
  if (!pos) return undefined;
  const route = nearestRoute(pos);
  const naran = stopGeo("naran");
  return {
    pos, town: stop?.name ?? "Kaghan Valley", townSlug: stop?.slug ?? "", kind: kindOf(l), ele: elevationAt(pos.lat, pos.lon),
    kmFromBalakot: Math.round(route.km), offRoadKm: route.offKm, bazaarKm: distKm(pos, NARAN_BAZAAR),
    naranRoadKm: naran ? route.km - naran.km : undefined, road: roadOf(l.address) as Facts["road"],
  };
}

/** Where it sits, in one clause: road, side of town, distance to the bazaar or to Naran. */
function placePhrase(f: Facts) {
  if (f.townSlug === "naran" || f.townSlug === "naran-picnic-point") {
    if (f.bazaarKm < 0.35) return "in the Naran Bazaar area, the centre of town";
    if (f.road === "saif") return `on Saif-ul-Malook Road (Jheel Road), which runs east from the bazaar towards the jeep track to the lake, about ${fmtKm(f.bazaarKm)} from Naran Bazaar`;
    const side = (f.naranRoadKm ?? 0) < 0 ? "on the Kaghan side, before the bazaar" : "on the Batakundi side, past the bazaar";
    return `on the N-15 ${side}, about ${fmtKm(f.bazaarKm)} from Naran Bazaar`;
  }
  if (f.naranRoadKm !== undefined && f.offRoadKm < 1.5) {
    const d = Math.abs(f.naranRoadKm);
    return `near the N-15, about ${fmtKm(d)} by road ${f.naranRoadKm < 0 ? "before" : "beyond"} Naran`;
  }
  return `about ${fmtKm(f.bazaarKm)} from Naran Bazaar in a straight line`;
}

/** Season note that holds for the business's height and town. */
function seasonNote(f: Facts) {
  if (f.townSlug === "naran" || f.townSlug === "naran-picnic-point") {
    return "Naran is busiest from June to August. Heavy snow usually closes the road above Kaghan in winter, and many businesses in Naran open only for the summer season.";
  }
  if ((f.ele ?? 0) >= 2600 || ["batakundi", "burawai", "besal", "lulusar", "gittidas", "babusar-top"].includes(f.townSlug)) {
    return "This part of the valley is high and snowbound in winter: the N-15 above Naran usually closes from about November until late spring, so most visits happen between June and September.";
  }
  if (f.townSlug === "kaghan") return "Kaghan is lower than Naran and can usually be reached for more of the year, although heavy snow can still close the road in mid-winter.";
  return "Naran is busiest from June to August. Heavy snow usually closes the road above Kaghan in winter, and many businesses in Naran open only for the summer season.";
}

/** Short summary for cards, meta descriptions and search snippets (about 150 characters). */
export function describe(l: Listing, stop?: Stop) {
  const f = factsOf(l, stop);
  if (!f) return l.description;
  const where = f.townSlug === "naran" && f.bazaarKm < 0.35 ? "in Naran Bazaar" : f.road === "saif" ? `on Saif-ul-Malook Road, ${f.town}` : `in ${f.town}`;
  // the name leads, so no two listings share a description
  const base = `${l.name} is ${/^[aeiou]/i.test(f.kind) ? "an" : "a"} ${f.kind} ${where}, Kaghan Valley${f.ele ? `, at about ${m(f.ele)}` : ""}. ${f.kmFromBalakot} km from Balakot on the N-15${f.townSlug === "naran" && f.bazaarKm >= 0.35 ? `, ${fmtKm(f.bazaarKm)} from Naran Bazaar` : ""}.`;
  // keep it inside a search snippet (about 155 characters)
  return base.length <= 125 ? `${base} Map, directions and nearby places.` : base;
}

export type Nearby = { name: string; href: string; km: number; note?: string };

export function listingContent(l: Listing, stop: Stop | undefined, all: Listing[], typeName: (slug: string) => string, segments: RoadSegment[]) {
  const f = factsOf(l, stop);
  if (!f) return undefined;
  const article = /^[aeiou]/i.test(f.kind) ? "an" : "a";

  const intro = [
    `${l.name} is ${article} ${f.kind} in ${f.town}, in the Kaghan Valley of Mansehra District, Khyber Pakhtunkhwa. It is ${placePhrase(f)}${f.ele ? `, at about ${m(f.ele)} above sea level` : ""}.`,
    `By road it is about ${f.kmFromBalakot} km from Balakot along the N-15${f.townSlug !== "naran" && f.naranRoadKm !== undefined ? `, and about ${fmtKm(Math.abs(f.naranRoadKm))} ${f.naranRoadKm < 0 ? "before" : "beyond"} Naran` : ""}. ${seasonNote(f)}`,
  ];

  const places: Nearby[] = landmarks()
    .map((p) => ({ name: p.name, href: p.href, km: distKm(f.pos, p) }))
    .filter((p) => p.km > 0.2)
    .sort((a, b) => a.km - b.km)
    .slice(0, 5)
    .map((p) => (p.name === "Lake Saif-ul-Malook" ? { ...p, note: "by jeep track from Naran" } : p));

  const others = all.filter((x) => x.id !== l.id && posOf(x));
  const near = (types: string[], max = 4) => others
    .filter((x) => types.includes(x.type))
    .map((x) => ({ name: x.name, href: `/listing/${x.slug}`, km: distKm(f.pos, posOf(x)!) }))
    .filter((x) => x.km < 2.5)
    .sort((a, b) => a.km - b.km)
    .slice(0, max);
  const nearby = [
    { title: "Hotels nearby", items: near(["hotel", "guest-house", "camping"]) },
    { title: "Places to eat nearby", items: near(["restaurant"]) },
    { title: "Shops nearby", items: near(["shop"]) },
    { title: "Transport and repairs nearby", items: near(["jeep-operator", "fuel", "tour-company"], 3) },
  ].filter((g) => g.items.length);

  // which N-15 segment this business sits on, for today's road status
  const segment = segments.find((s) => {
    if (!s.from || !s.to) return false;
    const a = nearestRoute(s.from).km, b = nearestRoute(s.to).km;
    return f.kmFromBalakot >= Math.min(a, b) - 0.5 && f.kmFromBalakot <= Math.max(a, b) + 0.5;
  });

  const closest = places[0];
  const neighbours = nearby.flatMap((g) => g.items).sort((a, b) => a.km - b.km).slice(0, 3).map((x) => x.name);
  const isStay = ["hotel", "guest-house", "camping"].includes(l.type);
  const faq: QA[] = [
    { q: `Where is ${l.name}?`, a: `${l.name} is ${placePhrase(f)}, in ${f.town}, Kaghan Valley. The address is ${l.address}, and the map position is ${f.pos.lat.toFixed(5)}, ${f.pos.lon.toFixed(5)}.` },
    f.townSlug === "naran"
      ? { q: `How far is ${l.name} from Naran Bazaar?`, a: f.bazaarKm < 0.35 ? `${l.name} is in the Naran Bazaar area, within a few minutes' walk of the main market.` : `${l.name} is about ${fmtKm(f.bazaarKm)} from Naran Bazaar in a straight line${f.bazaarKm < 1.5 ? ", close enough to walk" : ""}.` }
      : { q: `How far is ${l.name} from Naran?`, a: `${l.name} is about ${fmtKm(Math.abs(f.naranRoadKm ?? f.bazaarKm))} ${f.naranRoadKm !== undefined && f.offRoadKm < 1.5 ? `by road ${f.naranRoadKm < 0 ? "before" : "beyond"} Naran on the N-15` : "from Naran Bazaar"}.` },
    ...(f.ele ? [{ q: `How high is ${l.name}?`, a: `${l.name} is at about ${m(f.ele)} above sea level, measured from SRTM terrain data. ${f.ele >= 2400 ? "Nights are cold even in summer, so bring warm clothes." : ""}`.trim() }] : []),
    { q: `How do I get to ${l.name}?`, a: `Drive the N-15 up the Kaghan Valley from Balakot. ${l.name} is about ${f.kmFromBalakot} km from Balakot${f.townSlug === "naran" ? ", in Naran" : `, in ${f.town}`}. Use the Directions button on this page for turn-by-turn directions in Google Maps.` },
    ...(closest ? [{ q: `What is near ${l.name}?`, a: `The closest landmark is ${closest.name}, about ${fmtKm(closest.km)} away${closest.note ? ` (${closest.note})` : ""}.${neighbours.length ? ` Other businesses close by include ${neighbours.join(", ")}.` : ""}` }] : []),
    { q: `Is ${l.name} open in winter?`, a: `${seasonNote(f)} Contact ${l.name} directly before travelling out of season.` },
    ...(l.attributes.claimed === false
      ? [{ q: isStay ? `How do I book ${l.name}?` : `How do I contact ${l.name}?`, a: `${l.name} has not claimed this listing yet, so no phone number is shown here. Use the Google Maps link on this page for its current contact details${isStay ? ", or ask in Naran Bazaar on arrival" : ""}.` }]
      : []),
  ];

  const facts: [string, string][] = [
    ["Type", typeName(l.type)],
    ["Town", f.town],
    ["Address", l.address],
    ...(f.ele ? [["Height", `about ${m(f.ele)}`] as [string, string]] : []),
    ["From Balakot", `${f.kmFromBalakot} km on the N-15`],
    ...(f.townSlug === "naran" || f.bazaarKm < 5 ? [["To Naran Bazaar", fmtKm(f.bazaarKm)] as [string, string]] : []),
    ["Map position", `${f.pos.lat.toFixed(5)}, ${f.pos.lon.toFixed(5)}`],
  ];

  return { f, intro, places, nearby, faq, facts, segmentId: segment?.id };
}

/** Introduction and FAQ for a directory page (a type, a town, or both), from the listings on it. */
export function directorySummary(listings: Listing[], what: string, town?: Stop) {
  const placed = listings.map((l) => ({ l, f: factsOf(l, undefined) })).filter((x): x is { l: Listing; f: Facts } => !!x.f);
  if (!placed.length) return undefined;
  const where = town ? `${town.name}, Kaghan Valley` : "the Kaghan Valley";
  const heights = placed.map((x) => x.f.ele).filter((h): h is number => !!h).sort((a, b) => a - b);
  const saif = placed.filter((x) => x.f.road === "saif");
  const bazaar = placed.filter((x) => x.f.bazaarKm < 0.35);
  const byTown = Object.entries(listings.reduce<Record<string, number>>((acc, l) => ({ ...acc, [l.stop]: (acc[l.stop] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1]);
  const names = (xs: { l: Listing }[], n = 5) => xs.slice(0, n).map((x) => x.l.name).join(", ");
  const closest = [...placed].sort((a, b) => a.f.bazaarKm - b.f.bazaarKm);

  const intro = [
    `Kaghan Naran lists ${listings.length} ${what.toLowerCase()} in ${where}${heights.length ? `, at heights from about ${heights[0].toLocaleString("en-US")} m to ${heights.at(-1)!.toLocaleString("en-US")} m` : ""}.${!town && byTown.length > 1 ? ` Most are in ${byTown.slice(0, 3).map(([s, n]) => `${s.replace(/-/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase())} (${n})`).join(", ")}.` : ""}`,
    [
      bazaar.length ? `${bazaar.length} are in the Naran Bazaar area` : "",
      saif.length ? `${saif.length} are on Saif-ul-Malook Road (Jheel Road), east of the bazaar towards the lake jeep track` : "",
    ].filter(Boolean).join(", and ") + (bazaar.length || saif.length ? "." : ""),
    "Every listing shows its map position, height, today's road status and what is nearby. Owners can claim a listing for free to add phone numbers, prices and photos.",
  ].filter(Boolean);

  const faq: QA[] = [
    { q: `How many ${what.toLowerCase()} are there in ${town?.name ?? "Kaghan Valley"}?`, a: `Kaghan Naran currently lists ${listings.length} ${what.toLowerCase()} in ${where}. The list grows as owners add and claim their businesses.` },
    ...(closest[0] && closest[0].f.bazaarKm < 3 ? [{ q: `Which ${what.toLowerCase()} are closest to Naran Bazaar?`, a: `The closest listed ${what.toLowerCase()} to Naran Bazaar are ${names(closest, 5)}.` }] : []),
    ...(saif.length ? [{ q: `Which ${what.toLowerCase()} are on Saif-ul-Malook Road in Naran?`, a: `${saif.length} listed ${what.toLowerCase()} are on Saif-ul-Malook Road (Jheel Road), including ${names(saif, 5)}.` }] : []),
    ...(heights.length ? [{ q: `How high are ${what.toLowerCase()} in ${town?.name ?? "Kaghan Valley"}?`, a: `Listed ${what.toLowerCase()} here sit between about ${heights[0].toLocaleString("en-US")} m and ${heights.at(-1)!.toLocaleString("en-US")} m above sea level, so evenings are cool even in summer.` }] : []),
  ];
  return { intro, faq };
}

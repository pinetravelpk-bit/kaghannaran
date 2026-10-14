import "server-only";
import type { QA } from "@/lib/seo";
import type { RoadReading, Stop } from "@/lib/types";
import { roadKm, routeKm, stopGeo } from "@/lib/geo";

/**
 * Direct answers for the FAQ sections and their FAQPage schema. Figures come from the site's own
 * data: road distances and heights from public/terrain/meta.json, altitudes from lib/seed/stops.ts,
 * and road status from the live checks, so the answers stay in step with the rest of the site.
 */

const m = (n: number) => `${Math.round(n).toLocaleString("en-US")} m`;
const STATUS: Record<RoadReading["status"], string> = { open: "open", caution: "open with caution", closed: "closed", seasonal: "closed for the winter season" };
const when = (iso: string) => new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Karachi" });

export function homeFaq(stops: Stop[]): QA[] {
  const alt = (slug: string) => stops.find((s) => s.slug === slug)?.altitude;
  const toNaran = roadKm("balakot", "naran"), toKaghan = roadKm("balakot", "kaghan"), naranTop = roadKm("naran", "babusar-top");
  return [
    {
      q: "Where is Kaghan Valley?",
      a: `Kaghan Valley is in Mansehra District, Khyber Pakhtunkhwa, northern Pakistan. The N-15 road climbs the valley along the Kunhar River for about ${routeKm()} km, from Balakot (${m(alt("balakot") ?? 980)}) through Kaghan and Naran to the Babusar Pass (${m(alt("babusar-top") ?? 4173)}), which leads on to Chilas in Gilgit-Baltistan.`,
    },
    {
      q: "How far is Naran from Balakot?",
      a: `Naran is about ${toNaran} km from Balakot on the N-15, and Kaghan town is about ${toKaghan} km from Balakot. Plan on 2 to 3 hours for Balakot to Naran, longer in peak season traffic or after rain.`,
    },
    {
      q: "How far is Babusar Top from Naran?",
      a: `Babusar Top is about ${naranTop} km beyond Naran, past Batakundi, Besal and Lulusar Lake. The road climbs from about ${m(alt("naran") ?? 2400)} at Naran to ${m(alt("babusar-top") ?? 4173)} at the pass.`,
    },
    {
      q: "When is the Babusar Pass open?",
      a: "Babusar Pass is a seasonal road. It usually opens in June once snow is cleared and closes again with the first heavy snow, often in October or November. The road status page on this site is checked every hour, so look there before you drive beyond Batakundi.",
    },
    {
      q: "What is the best time to visit Kaghan and Naran?",
      a: "June to September is the main season, when the N-15 is usually open all the way to Babusar Top and the jeep tracks to Saif-ul-Malook and Lalazar are running. Balakot and Kaghan can be visited most of the year, but heavy snow often closes the road above Kaghan in winter.",
    },
    {
      q: "How high is Naran and Lake Saif-ul-Malook?",
      a: `Naran town is at about ${m(alt("naran") ?? 2400)}. Lake Saif-ul-Malook is higher, at about 3,224 m, and is reached by a jeep track from Naran. Lulusar Lake, beside the N-15 further up, is at about ${m(alt("lulusar") ?? 3410)}.`,
    },
    {
      q: "What are the emergency numbers in Kaghan Valley?",
      a: "Call 911, the Pakhtunkhwa Emergency Helpline, which connects police, Rescue 1122, tourist assistance and disaster response. You can also call Rescue 1122 for an ambulance, 15 for police, 1422 for the KP tourist helpline, and 1700 for the PDMA disaster helpline.",
    },
    {
      q: "How do I list my hotel or business on Kaghan Naran?",
      a: "Listing is free. Create an account, choose your business type (hotel, restaurant, jeep, guide, adventure and more) and submit the form with your documents. Our team checks every listing before it is published.",
    },
  ];
}

export function stopFaq(s: Stop, stops: Stop[]): QA[] {
  const g = stopGeo(s.slug);
  const out: QA[] = [];
  const height = s.altitude ?? g?.ele;
  if (height) out.push({ q: `How high is ${s.name}?`, a: `${s.name} is at about ${m(height)} above sea level${s.altitude ? "" : ", measured on the N-15 from SRTM elevation data"}.` });
  if (g && s.slug !== "balakot") {
    const fromNaran = roadKm("naran", s.slug);
    out.push({
      q: `How far is ${s.name} from Balakot?`,
      a: `${s.name} is about ${Math.round(g.km)} km from Balakot along the N-15${fromNaran && s.slug !== "naran" ? `, and about ${fromNaran} km ${g.km < (stopGeo("naran")?.km ?? 0) ? "before" : "beyond"} Naran` : ""}.`,
    });
  }
  if (s.sideTrip) out.push({ q: `How do I get to ${s.name}?`, a: `${s.name} is a side trip off the N-15. ${s.desc}` });
  if (s.places.length) {
    const names = s.places.map((p) => p.name);
    out.push({ q: `What is there to see in ${s.name}?`, a: `Places to visit in and around ${s.name}: ${names.slice(0, -1).join(", ")}${names.length > 1 ? " and " : ""}${names.at(-1)}.` });
  }
  const i = stops.findIndex((x) => x.slug === s.slug);
  const next = stops.slice(i + 1).find((x) => !x.sideTrip);
  if (next) out.push({ q: `What is the next stop after ${s.name}?`, a: `Heading up the valley, the next stop on the N-15 is ${next.name}. ${next.desc}` });
  return out;
}

/** Answers that change with the live road checks. */
export function roadFaq(road: RoadReading[]): QA[] {
  const find = (text: string) => road.find((r) => r.segment.toLowerCase().includes(text));
  const out: QA[] = [];
  const babusar = find("→ babusar") ?? find("babusar");
  if (babusar) out.push({ q: "Is the Babusar Pass road open today?", a: `As of ${when(babusar.checkedAt)} (Pakistan time), ${babusar.segment} is ${STATUS[babusar.status]}. ${babusar.note}` });
  const naran = find("kaghan → naran") ?? find("naran");
  if (naran) out.push({ q: "Is the road to Naran open today?", a: `As of ${when(naran.checkedAt)} (Pakistan time), ${naran.segment} is ${STATUS[naran.status]}. ${naran.note}` });
  out.push({
    q: "How is the road status checked?",
    a: "Each N-15 segment is checked every hour against Google Maps live traffic (when connected), the Open-Meteo forecast at both ends, and the pass season. Our team can override any segment with a local report, which is labelled TEAM on the board.",
  });
  out.push({ q: "Who do I call if I get stuck on the road?", a: "Call 911 or Rescue 1122 in an emergency. For road and weather information, call the KP tourist helpline 1422." });
  return out;
}

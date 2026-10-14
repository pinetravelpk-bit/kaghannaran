import "server-only";
import { getBusinessTypes, getListings, getStops, getTrails } from "@/lib/data";
import { getRoadLive } from "@/lib/road";
import { getWeather } from "@/lib/weather";
import { stopGeo, routeKm } from "@/lib/geo";
import { homeFaq } from "@/lib/faq";
import { SITE, abs } from "@/lib/seo";

/**
 * Plain-text summaries for AI assistants and answer engines (the llms.txt convention).
 * Built from the same live data as the pages, so answers quoted from here stay current.
 */
const when = (iso: string) => new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Karachi" });

export async function llmsText(full: boolean) {
  const [stops, trails, road, weather, listings, types] = await Promise.all([getStops(), getTrails(), getRoadLive(), getWeather(), getListings(), getBusinessTypes()]);
  const services = listings.filter((l) => types.find((t) => t.slug === l.type)?.adminOnly);
  const lines: string[] = [];
  const push = (...x: string[]) => lines.push(...x);

  push(
    `# ${SITE.name}`,
    "",
    `> ${SITE.tagline}. Published by ${SITE.publisher}. Covers the N-15 road through Kaghan Valley, ${SITE.region}, for about ${routeKm()} km from Balakot to the Babusar Pass.`,
    "",
    "## Key facts",
    ...homeFaq(stops).slice(0, 6).map((x) => `- ${x.q} ${x.a}`),
    "",
    `## Road status (live, checked ${when(new Date().toISOString())} Pakistan time)`,
    ...road.map((r) => `- ${r.segment}: ${r.status.toUpperCase()}. ${r.note} (${r.source === "auto" ? "automatic check" : "set by our team"}, ${when(r.checkedAt)})`),
    `- Full page: ${abs("/road")}  JSON: ${abs("/api/road")}`,
    "",
    "## Weather now",
    ...weather.map((w) => `- ${w.name} (${w.alt.toLocaleString("en-US")} m): ${w.temp !== undefined ? `${Math.round(w.temp)} °C, ` : ""}${w.label}${w.advisory ? `. Advisory: ${w.advisory}` : ""}`),
    "",
    "## Emergency and help numbers",
    ...services.map((l) => `- ${l.phone}: ${l.name}. ${l.description}`),
    "",
    "## Main pages",
    `- [Home](${abs("/")}): overview, 3D map, FAQ`,
    `- [Road status and weather](${abs("/road")})`,
    `- [Places, stop by stop](${abs("/places")})`,
    `- [Jeep tracks and hikes](${abs("/trails")})`,
    `- [Directory of hotels, restaurants, jeeps, guides and services](${abs("/directory")})`,
    `- [List a business](${abs("/list-your-business")})`,
    `- [Full text for AI assistants](${abs("/llms-full.txt")})`,
    "",
    "## Stops on the N-15 (in road order)",
    ...stops.map((s) => {
      const g = stopGeo(s.slug);
      const h = s.altitude ?? g?.ele;
      return `- [${s.name}](${abs(`/places/${s.slug}`)})${s.sideTrip ? " (side trip)" : ""}: ${s.desc}${h ? ` Height about ${h.toLocaleString("en-US")} m.` : ""}${g ? ` ${Math.round(g.km)} km from Balakot.` : ""}`;
    }),
  );

  if (full) {
    push("", "## Places to visit at each stop");
    for (const s of stops) {
      push("", `### ${s.name}`, ...s.places.map((p) => `- ${p.name}${p.note ? `: ${p.note}` : ""}${p.warning ? ` Warning: ${p.warning}` : ""}`));
    }
    push("", "## Jeep tracks and hikes", ...trails.map((t) => `- ${t.name} (${t.mode}), from ${t.from}, about ${t.time}.`));
    push("", "## Frequently asked questions", ...homeFaq(stops).flatMap((x) => [`### ${x.q}`, x.a, ""]));
  }

  push("", "## Data sources", "- Road geometry: OpenStreetMap contributors (ODbL). Heights: SRTM via Mapzen Terrain Tiles. Imagery: Sentinel-2 cloudless 2016 by EOX (CC BY 4.0). Weather: Open-Meteo.", "");
  return lines.join("\n");
}

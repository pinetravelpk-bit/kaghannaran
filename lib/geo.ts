import "server-only";
import fs from "node:fs";
import path from "node:path";

/**
 * Real route facts from public/terrain/meta.json (built by scripts/build-terrain.mjs from
 * OpenStreetMap and SRTM): road distance from Balakot, road elevation and coordinates per stop.
 */
type StopGeo = { km: number; ele: number; lat: number; lon: number };
type Meta = { route: [number, number, number, number][]; stops: Record<string, StopGeo> };

let meta: Meta | null = null;
function load(): Meta {
  if (!meta) meta = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public/terrain/meta.json"), "utf8")) as Meta;
  return meta;
}

// side trips off the N-15 are not on the route; approximate centres for maps and schema
const SIDE_TRIPS: Record<string, { lat: number; lon: number }> = {
  shogran: { lat: 34.637, lon: 73.468 },
};

export const routeKm = () => Math.round(load().route.at(-1)![3]);
export const stopGeo = (slug: string): StopGeo | undefined => load().stops[slug];
export const stopPoint = (slug: string) => load().stops[slug] ?? SIDE_TRIPS[slug];

/** Road distance in km between two stops on the N-15, or undefined if either is a side trip. */
export function roadKm(from: string, to: string) {
  const a = load().stops[from], b = load().stops[to];
  return a && b ? Math.round(Math.abs(b.km - a.km)) : undefined;
}

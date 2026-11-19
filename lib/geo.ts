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

// ───────── point facts: height, road position, distances ─────────

let heights: Uint16Array | null = null;
function heightGrid() {
  if (!heights) {
    const buf = fs.readFileSync(path.join(process.cwd(), "public/terrain/height.bin"));
    heights = new Uint16Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length));
  }
  return heights;
}
const Z = 2 ** 12 * 256;
const gx = (lon: number) => ((lon + 180) / 360) * Z;
const gy = (lat: number) => { const r = (lat * Math.PI) / 180; return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * Z; };

/** Ground height in metres at a point, from SRTM terrain data (about 30 to 180 m resolution). */
export function elevationAt(lat: number, lon: number) {
  const m = load() as Meta & { bounds: { west: number; east: number; north: number; south: number }; grid: number };
  const n = m.grid, h = heightGrid();
  const x = ((gx(lon) - gx(m.bounds.west)) / (gx(m.bounds.east) - gx(m.bounds.west))) * (n - 1);
  const y = ((gy(lat) - gy(m.bounds.north)) / (gy(m.bounds.south) - gy(m.bounds.north))) * (n - 1);
  if (x < 0 || y < 0 || x > n - 1 || y > n - 1) return undefined;
  const x0 = Math.min(n - 2, Math.floor(x)), y0 = Math.min(n - 2, Math.floor(y)), fx = x - x0, fy = y - y0;
  const v = (h[y0 * n + x0] * (1 - fx) + h[y0 * n + x0 + 1] * fx) * (1 - fy) + (h[(y0 + 1) * n + x0] * (1 - fx) + h[(y0 + 1) * n + x0 + 1] * fx) * fy;
  return Math.round(v / 10) * 10;
}

/** Straight-line distance in km. */
export function distKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  return 2 * 6371 * Math.asin(Math.sqrt(Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2));
}

/** Closest point on the N-15: road distance from Balakot there, and how far the point is from the road. */
export function nearestRoute(p: { lat: number; lon: number }) {
  let best = { km: 0, offKm: Infinity };
  for (const [lon, lat, , km] of load().route) {
    const d = distKm(p, { lat, lon });
    if (d < best.offKm) best = { km, offKm: d };
  }
  return best;
}

/** Landmarks with known positions, for "what is nearby" distances. */
export function landmarks() {
  const s = load().stops;
  return [
    { name: "Naran Bazaar", lat: 34.90847, lon: 73.65231, href: "/places/naran" },
    { name: "Lake Saif-ul-Malook", lat: 34.8814, lon: 73.6952, href: "/places/naran" },
    { name: "Batakundi", lat: s.batakundi.lat, lon: s.batakundi.lon, href: "/places/batakundi" },
    { name: "Lulusar Lake", lat: s.lulusar.lat, lon: s.lulusar.lon, href: "/places/lulusar" },
    { name: "Babusar Top", lat: s["babusar-top"].lat, lon: s["babusar-top"].lon, href: "/places/babusar-top" },
    { name: "Kaghan town", lat: s.kaghan.lat, lon: s.kaghan.lon, href: "/places/kaghan" },
    { name: "Shogran", ...SIDE_TRIPS.shogran, href: "/places/shogran" },
    { name: "Balakot", lat: s.balakot.lat, lon: s.balakot.lon, href: "/places/balakot" },
  ];
}

// Imports hotels from a Google Maps list export (CSV) into the built-in directory.
//   node scripts/import-hotels.mjs "path/to/maps_data.csv"
// Keeps only facts: name, map position (from the Maps URL) and the Maps link itself.
// Phone numbers, ratings, prices and photos are NOT copied (owners add those when they claim a listing).
// Addresses come from OpenStreetMap reverse geocoding (Nominatim, max 1 request per second, cached).
// Output: lib/seed/hotels.json and supabase/migrations/0004_hotels.sql
import fs from "node:fs";

const csvPath = process.argv[2];
if (!csvPath) throw new Error("Usage: node scripts/import-hotels.mjs <csv>");
const CACHE = ".cache/geocode.json";
fs.mkdirSync(".cache", { recursive: true });
const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, "utf8")) : {};

// valley bounds (Balakot to Babusar Top); anything outside is skipped
const IN_VALLEY = (lat, lon) => lat > 34.5 && lat < 35.2 && lon > 73.3 && lon < 74.1;
// rows we can't classify from the export alone
const SKIP = new Set(["Katha naran"]);

const rows = fs.readFileSync(csvPath, "utf8").trim().split(/\r?\n/).slice(1)
  .map((l) => l.match(/"([^"]*)"/g).map((s) => s.slice(1, -1)))
  .map(([name, , , category, , , url]) => ({ name, category, url }));

const titleWord = (w) => (/^[a-z]/.test(w) && !["and", "by", "de", "x", "of"].includes(w) ? w[0].toUpperCase() + w.slice(1) : w);
function cleanName(n) {
  let s = n.split("|")[0].trim().replace(/\.+$/, "");
  if (s === s.toUpperCase()) s = s.toLowerCase();
  return s.split(" ").map((w, i) => (i === 0 ? w[0].toUpperCase() + w.slice(1) : titleWord(w))).join(" ").replace(/\s+/g, " ");
}
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const meta = JSON.parse(fs.readFileSync("public/terrain/meta.json", "utf8"));
const STOP_NAMES = {
  balakot: "Balakot", ghanool: "Ghanool", kiwai: "Kiwai", malakandi: "Malakandi", "shinu-jared": "Shinu & Jared", "mahandri-manoor": "Mahandri",
  khanian: "Khanian", kaghan: "Kaghan", "naran-picnic-point": "Naran Picnic Point", naran: "Naran", batakundi: "Batakundi", burawai: "Burawai",
  jalkhad: "Jalkhad", besal: "Besal", lulusar: "Lulusar", gittidas: "Gittidas", "babusar-top": "Babusar Top", shogran: "Shogran",
};
const stops = { ...meta.stops, shogran: { lat: 34.637, lon: 73.468, km: null } };
const hav = (aLat, aLon, bLat, bLon) => {
  const r = Math.PI / 180, dLat = (bLat - aLat) * r, dLon = (bLon - aLon) * r;
  return 2 * 6371 * Math.asin(Math.sqrt(Math.sin(dLat / 2) ** 2 + Math.cos(aLat * r) * Math.cos(bLat * r) * Math.sin(dLon / 2) ** 2));
};
const nearestStop = (lat, lon) => Object.entries(stops)
  .map(([slug, s]) => ({ slug, d: hav(lat, lon, s.lat, s.lon) }))
  .sort((a, b) => a.d - b.d)[0];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function reverse(lat, lon) {
  const key = `${lat.toFixed(5)},${lon.toFixed(5)}`;
  if (cache[key]) return cache[key];
  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=17&addressdetails=1&lat=${lat}&lon=${lon}`, {
    headers: { "User-Agent": "kaghannaran.com hotel import (Pine Travel)", "Accept-Language": "en" },
  });
  const j = res.ok ? await res.json() : {};
  cache[key] = j.address ?? {};
  fs.writeFileSync(CACHE, JSON.stringify(cache));
  await sleep(1100);
  return cache[key];
}

const out = [];
for (const r of rows) {
  const m = r.url.match(/!3d([\d.]+)!4d([\d.]+)/);
  if (!m || SKIP.has(r.name)) { console.log("skip (unclear):", r.name); continue; }
  const lat = +m[1], lon = +m[2];
  if (!IN_VALLEY(lat, lon)) { console.log("skip (outside valley):", r.name); continue; }
  const name = cleanName(r.name);
  // a town named in the hotel's own name wins over the nearest stop (small stops are placed approximately)
  const named = Object.entries({ batakundi: /batt?akundi/i, naran: /naran/i, kaghan: /kaghan/i, shogran: /shogran/i }).find(([, re]) => re.test(r.name))?.[0];
  const nearest = nearestStop(lat, lon);
  const near = named && named !== nearest.slug ? { slug: named, d: hav(lat, lon, stops[named].lat, stops[named].lon) } : nearest;
  const a = await reverse(lat, lon);
  const place = STOP_NAMES[near.slug];
  const road = a.road && !/^(unnamed|N-15)$/i.test(a.road) ? a.road : "";
  const locality = near.d < 2.5 ? place : a.village || a.hamlet || a.suburb || a.town || place;
  const address = [road, locality, "Kaghan Valley, Mansehra"].filter(Boolean).filter((v, i, x) => x.indexOf(v) === i).join(", ");
  const type = r.category === "Restaurant" ? "restaurant" : "hotel";
  const where = near.d < 2.5 ? `in ${place}` : `about ${Math.round(near.d)} km from ${place}`;
  const s = stops[near.slug];
  const road_km = s.km != null ? ` ${place} is about ${Math.round(s.km)} km from Balakot on the N-15.` : "";
  out.push({
    id: `gm-${slugify(name)}`, name, type, stop: near.slug, address, lat: +lat.toFixed(6), lon: +lon.toFixed(6), mapsUrl: r.url.split("?")[0],
    description: `${name} is a ${type === "restaurant" ? "restaurant" : "hotel"} ${where}, Kaghan Valley.${road_km} Contact the ${type} directly to confirm rooms, prices and season dates.`,
  });
  console.log(`${name.padEnd(48)} ${near.slug.padEnd(20)} ${address}`);
}

// de-duplicate by slug (the same place can appear twice in a list)
const seen = new Set();
const hotels = out.filter((h) => (seen.has(h.id) ? false : seen.add(h.id)));
fs.writeFileSync("lib/seed/hotels.json", JSON.stringify(hotels, null, 1) + "\n");

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const sql = [
  "-- Hotels in Kaghan Valley from a Google Maps list (name, position and map link only).",
  "-- Generated by scripts/import-hotels.mjs. Unclaimed: no phone, prices or photos until the owner claims the listing.",
  "begin;",
  "set local session_replication_role = replica;",
  "insert into public.listings (slug, type_slug, name, phone, stop_slug, address, description, attributes, status, verified) values",
  hotels.map((h) => `  (${q(h.id.slice(3))}, ${q(h.type)}, ${q(h.name)}, '', ${q(h.stop)}, ${q(h.address)}, ${q(h.description)}, ${q(JSON.stringify({ lat: h.lat, lon: h.lon, mapsUrl: h.mapsUrl, claimed: false }))}, 'approved', false)`).join(",\n"),
  "on conflict (slug) do nothing;",
  "commit;",
  "",
].join("\n");
fs.writeFileSync("supabase/migrations/0004_hotels.sql", sql);
console.log(`\n${hotels.length} listings written (${hotels.filter((h) => h.type === "hotel").length} hotels).`);

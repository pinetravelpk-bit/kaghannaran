// Imports businesses from Google Maps list exports (CSV) into the built-in directory.
//   node scripts/import-places.mjs hotels.csv shops.csv ...
// Keeps only facts: name, business type, map position (from the Maps URL) and the Maps link itself.
// Phone numbers, ratings, reviews, prices and photos are NOT copied (owners add those when they claim a listing).
// Addresses come from OpenStreetMap reverse geocoding (Nominatim, max 1 request per second, cached).
// Places are matched by Google place ID, so a business in several files is listed once.
// Output: lib/seed/imported.json and supabase/migrations/0004_imported_places.sql
import fs from "node:fs";

const files = process.argv.slice(2);
if (!files.length) throw new Error("Usage: node scripts/import-places.mjs <csv> [more.csv]");
const CACHE = ".cache/geocode.json";
fs.mkdirSync(".cache", { recursive: true });
const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, "utf8")) : {};

// valley bounds (Balakot to Babusar Top); anything outside is skipped
const IN_VALLEY = (lat, lon) => lat > 34.5 && lat < 35.2 && lon > 73.3 && lon < 74.1;
// rows that can't be classified or placed reliably from the export alone
const SKIP = {
  "Katha naran": "type unclear",
  "Naran": "no business name",
  "Khyber hotel and resort naran kagan": "named a hotel but listed as a grocery store",
  "Bridge of Lake Saif Ul Malook": "landmark, not a business",
  "سادات مارکیٹ سنبل گلی کیالہ": "placeholder map position",
};
// Urdu-only or mixed names, so every listing gets a readable English name and URL
const RENAME = {
  "باجوڑ گفٹ سنٹر ناران": "Bajaur Gift Center Naran",
  "Naran Market ناران مارکیٹ": "Naran Market",
  "Baig Suzuki center& Rental Bike Naran": "Baig Suzuki Center & Rental Bike Naran",
};

/** RFC 4180 CSV: quoted fields with "" escapes. */
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); rows.push(row); row = []; field = "";
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.length > 1);
}

/** Business type from Google's category (or price band, which Google shows for places to eat). */
// types fixed by hand where the export is misleading
const TYPE = { "Shisha + Coffee shop": "restaurant" };

function typeOf(name, category) {
  // some rows carry an address (with a plus code like "WM53+G2M") in the category column
  const c = /[A-Z0-9]{4}\+[A-Z0-9]{2,3}/.test(category) ? "" : category.toLowerCase();
  const n = name.toLowerCase();
  // Google shows a nightly price (PKR ...) or lodging amenities in place of a category for hotels
  if (/^pkr |free parking|residents association/.test(c)) return "hotel";
  if (/hotel|resort|lodging|cabin|villa|inn\b|cottage|hut|motel/.test(c) || (/hotel|resort|cottage|lodge|chalet|huts?\b|rooms|inn\b/.test(n) && !/store|shop|mall|restaurant|cafe/.test(c))) return "hotel";
  if (/^rs [\d,]|restaurant|caf[eé]|coffee|sandwich|dessert|punjabi|bbq|pizza|fast food|bakery/.test(c) || /coffee|cafe|restaurant|tikka|food/.test(n)) return "restaurant";
  if (/tour operator|travel agency/.test(c) || /tour guide/.test(n)) return "tour-company";
  if (/adventure/.test(n) && /tourist attraction|closed/.test(c)) return "tour-company";
  if (/rent(al)? bike|bike rental/.test(n) || /showroom/.test(c) && /bike/.test(n)) return "jeep-operator";
  if (/repair|tire|tyre|recovery|mechanic/.test(c)) return "fuel";
  return "shop";
}
const SHOP_CATEGORY = (name, category) => {
  const s = `${name} ${category}`.toLowerCase();
  if (/handicraft|gift|kite|toys/.test(s)) return "Handicrafts";
  if (/camping/.test(s)) return "Outdoor gear";
  if (/cloth|shawl/.test(s)) return "Clothing";
  if (/mobile|cell phone|electronic/.test(s)) return "Mobile & SIM";
  if (/pharmac|medical/.test(s)) return "Pharmacy";
  if (/grocery|general|super ?store|cash and carry|dry fruit|bazaa?r|market|mall|store/.test(s)) return "General store";
  return "Other";
};
const FUEL_SERVICES = (name, category) => {
  const s = `${name} ${category}`.toLowerCase();
  return [/tyre|tire|punch/.test(s) && "Tyre repair", /repair|mechanic|suzuki/.test(s) && "Mechanic", /recovery|towing/.test(s) && "Towing"].filter(Boolean);
};
const LABEL = { hotel: "hotel", restaurant: "restaurant", shop: "shop", fuel: "repair and recovery service", "jeep-operator": "bike and transport rental", "tour-company": "tour operator" };

const titleWord = (w) => (/^[a-z]/.test(w) && !["and", "by", "de", "x", "of", "e"].includes(w) ? w[0].toUpperCase() + w.slice(1) : w);
function cleanName(n) {
  let s = (RENAME[n] ?? n).split("|")[0].trim().replace(/\.+$/, "");
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
    headers: { "User-Agent": "kaghannaran.com directory import (Pine Travel)", "Accept-Language": "en" },
  });
  const j = res.ok ? await res.json() : {};
  cache[key] = j.address ?? {};
  fs.writeFileSync(CACHE, JSON.stringify(cache));
  await sleep(1100);
  return cache[key];
}

// businesses already listed keep the type they were given, so re-imports never move them around
const previous = fs.existsSync("lib/seed/imported.json") ? JSON.parse(fs.readFileSync("lib/seed/imported.json", "utf8")) : [];
const prevType = new Map(previous.map((h) => [h.mapsUrl.match(/!19s(ChIJ[A-Za-z0-9_-]+)/)?.[1], h.type]));

const out = [];
const seenPlace = new Set(), seenSlug = new Set();
for (const file of files) {
  const rows = parseCsv(fs.readFileSync(file, "utf8")).slice(1).map(([name, , , category, , , url]) => ({ name, category, url }));
  for (const r of rows) {
    const m = r.url.match(/!3d([\d.]+)!4d([\d.]+)/);
    const placeId = r.url.match(/!19s(ChIJ[A-Za-z0-9_-]+)/)?.[1];
    if (SKIP[r.name]) { console.log(`skip (${SKIP[r.name]}): ${r.name}`); continue; }
    if (!m) { console.log("skip (no map position):", r.name); continue; }
    if (placeId && seenPlace.has(placeId)) continue; // already listed from an earlier file
    const lat = +m[1], lon = +m[2];
    if (!IN_VALLEY(lat, lon)) { console.log("skip (outside valley):", r.name); continue; }
    const name = cleanName(r.name);
    const slug = slugify(name);
    if (!slug || seenSlug.has(slug)) { console.log("skip (duplicate or unreadable name):", r.name); continue; }
    if (placeId) seenPlace.add(placeId);
    seenSlug.add(slug);

    // a town named in the business's own name wins over the nearest stop (small stops are placed approximately)
    const named = Object.entries({ batakundi: /batt?akundi/i, naran: /naran/i, kaghan: /kaghan/i, shogran: /shogran/i }).find(([, re]) => re.test(r.name))?.[0];
    const nearest = nearestStop(lat, lon);
    // ...but only when the business is actually near that town ("Kaghan" in a name often means the valley)
    const namedDist = named ? hav(lat, lon, stops[named].lat, stops[named].lon) : Infinity;
    const near = named && named !== nearest.slug && namedDist < 8 ? { slug: named, d: namedDist } : nearest;
    const a = await reverse(lat, lon);
    const place = STOP_NAMES[near.slug];
    const road = a.road && !/^(unnamed|N-15)$/i.test(a.road) ? a.road : "";
    const locality = near.d < 2.5 ? place : a.village || a.hamlet || a.suburb || a.town || place;
    const address = [road, locality, "Kaghan Valley, Mansehra"].filter(Boolean).filter((v, i, x) => x.indexOf(v) === i).join(", ");
    const type = TYPE[r.name] ?? prevType.get(placeId) ?? typeOf(r.name, r.category);
    const where = near.d < 2.5 ? `in ${place}` : `about ${Math.round(near.d)} km from ${place}`;
    const s = stops[near.slug];
    const roadKm = s.km != null ? ` ${place} is about ${Math.round(s.km)} km from Balakot on the N-15.` : "";
    const confirm = type === "hotel" ? "Contact the hotel directly to confirm rooms, prices and season dates." : "Contact them directly to confirm opening hours, as many places in the valley close in winter.";
    const attrs = type === "shop" ? { category: SHOP_CATEGORY(r.name, r.category) } : type === "fuel" ? { services: FUEL_SERVICES(r.name, r.category) } : {};
    out.push({
      id: `gm-${slug}`, name, type, stop: near.slug, address, lat: +lat.toFixed(6), lon: +lon.toFixed(6), mapsUrl: r.url.split("?")[0], attrs,
      description: `${name} is a ${LABEL[type]} ${where}, Kaghan Valley.${roadKm} ${confirm}`,
    });
    console.log(`${type.padEnd(14)} ${name.slice(0, 44).padEnd(45)} ${near.slug.padEnd(19)} ${address}`);
  }
}

fs.writeFileSync("lib/seed/imported.json", JSON.stringify(out, null, 1) + "\n");

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const sql = [
  "-- Businesses in Kaghan Valley from Google Maps lists (name, type, position and map link only).",
  "-- Generated by scripts/import-places.mjs. Unclaimed: no phone, prices or photos until the owner claims the listing.",
  "begin;",
  "set local session_replication_role = replica;",
  "insert into public.listings (slug, type_slug, name, phone, stop_slug, address, description, attributes, status, verified) values",
  out.map((h) => `  (${q(h.id.slice(3))}, ${q(h.type)}, ${q(h.name)}, '', ${q(h.stop)}, ${q(h.address)}, ${q(h.description)}, ${q(JSON.stringify({ ...h.attrs, lat: h.lat, lon: h.lon, mapsUrl: h.mapsUrl, claimed: false }))}, 'approved', false)`).join(",\n"),
  "on conflict (slug) do nothing;",
  "commit;",
  "",
].join("\n");
fs.writeFileSync("supabase/migrations/0004_imported_places.sql", sql);
const count = out.reduce((a, h) => ({ ...a, [h.type]: (a[h.type] ?? 0) + 1 }), {});
console.log(`\n${out.length} listings written:`, count);

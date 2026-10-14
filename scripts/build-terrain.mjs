// Builds the real-terrain assets for the 3D valley map (components/home/EarthScene.tsx).
//   node scripts/build-terrain.mjs
// Output (committed, so the site never calls these services at runtime):
//   public/terrain/height.bin   512×512 Uint16 heights in metres (row-major, north → south)
//   public/terrain/satellite.jpg    2048×2048 Sentinel-2 cloudless imagery, same bounds (phones)
//   public/terrain/satellite-4k.jpg 4096×4096 from zoom 13 tiles (desktop)
//   public/terrain/meta.json    bounds, N-15 route with elevations, stop positions
// Sources (credited on /credits):
//   Terrain: Mapzen/AWS Terrain Tiles (SRTM and others), terrarium encoding
//   Imagery: Sentinel-2 cloudless 2016 by EOX IT Services GmbH, CC BY 4.0
//   Route:   OpenStreetMap contributors (ODbL), routed with the public OSRM demo server
import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import jpeg from "jpeg-js";

const Z = 12, X0 = 2881, X1 = 2891, Y0 = 1619, Y1 = 1629, T = 256;
const NX = X1 - X0 + 1, NY = Y1 - Y0 + 1;
const W = NX * T, H = NY * T;
const GRID = 512, TEX = 2048;
const OUT = "public/terrain", CACHE = ".cache/terrain";
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(CACHE, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(url, file) {
  const f = path.join(CACHE, file);
  if (fs.existsSync(f)) return fs.readFileSync(f);
  for (let i = 0; i < 4; i++) {
    const res = await fetch(url, { headers: { "User-Agent": "kaghannaran.com terrain build (Pine Travel)" } });
    if (res.ok) { const b = Buffer.from(await res.arrayBuffer()); fs.writeFileSync(f, b); return b; }
    await sleep(800 * (i + 1));
  }
  throw new Error(`Failed: ${url}`);
}
async function eachTile(fn) {
  const jobs = [];
  for (let ty = Y0; ty <= Y1; ty++) for (let tx = X0; tx <= X1; tx++) jobs.push([tx, ty]);
  for (let i = 0; i < jobs.length; i += 8) await Promise.all(jobs.slice(i, i + 8).map(([tx, ty]) => fn(tx, ty)));
}

// ── mercator helpers (global pixel coords at zoom Z) ──
const N = 2 ** Z * T;
const lonOf = (gx) => (gx / N) * 360 - 180;
const latOf = (gy) => (Math.atan(Math.sinh(Math.PI * (1 - (2 * gy) / N))) * 180) / Math.PI;
const gxOf = (lon) => ((lon + 180) / 360) * N;
const gyOf = (lat) => { const r = (lat * Math.PI) / 180; return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * N; };

// ── 1. heights ──
console.log("Terrain tiles…");
const heights = new Float32Array(W * H);
await eachTile(async (tx, ty) => {
  const png = PNG.sync.read(await get(`https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${Z}/${tx}/${ty}.png`, `t-${Z}-${tx}-${ty}.png`));
  const ox = (tx - X0) * T, oy = (ty - Y0) * T;
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
    const i = (y * T + x) * 4, d = png.data;
    heights[(oy + y) * W + ox + x] = d[i] * 256 + d[i + 1] + d[i + 2] / 256 - 32768;
  }
});
const sampleH = (px, py) => {
  const x = Math.min(W - 1.001, Math.max(0, px)), y = Math.min(H - 1.001, Math.max(0, py));
  const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
  const a = heights[y0 * W + x0], b = heights[y0 * W + x0 + 1], c = heights[(y0 + 1) * W + x0], e = heights[(y0 + 1) * W + x0 + 1];
  return a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c * (1 - fx) * fy + e * fx * fy;
};
const grid = new Uint16Array(GRID * GRID);
let minH = Infinity, maxH = -Infinity;
for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) {
  const h = Math.max(0, sampleH((x / (GRID - 1)) * (W - 1), (y / (GRID - 1)) * (H - 1)));
  grid[y * GRID + x] = Math.round(h);
  minH = Math.min(minH, h); maxH = Math.max(maxH, h);
}
fs.writeFileSync(`${OUT}/height.bin`, Buffer.from(grid.buffer));
console.log(`  heights ${Math.round(minH)}–${Math.round(maxH)} m`);

// ── 2. imagery (zoom 13 tiles: 2×2 per terrain tile, same bounds) ──
console.log("Imagery tiles…");
const IZ = Z + 1, IW = W * 2;
const rgba = new Uint8Array(IW * IW * 4);
{
  const jobs = [];
  for (let ty = Y0 * 2; ty <= Y1 * 2 + 1; ty++) for (let tx = X0 * 2; tx <= X1 * 2 + 1; tx++) jobs.push([tx, ty]);
  for (let i = 0; i < jobs.length; i += 8) await Promise.all(jobs.slice(i, i + 8).map(async ([tx, ty]) => {
    const img = jpeg.decode(await get(`https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/${IZ}/${ty}/${tx}.jpg`, `s-${IZ}-${tx}-${ty}.jpg`), { useTArray: true });
    const ox = (tx - X0 * 2) * T, oy = (ty - Y0 * 2) * T;
    for (let y = 0; y < T; y++) rgba.set(img.data.subarray(y * T * 4, (y + 1) * T * 4), ((oy + y) * IW + ox) * 4);
  }));
}
// box-filter down to size×size, with a light contrast lift (Sentinel cloudless is a little flat)
function texture(size, file, quality) {
  const tex = new Uint8Array(size * size * 4);
  const k = IW / size;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const sx0 = Math.floor(x * k), sy0 = Math.floor(y * k), sx1 = Math.max(sx0 + 1, Math.floor((x + 1) * k)), sy1 = Math.max(sy0 + 1, Math.floor((y + 1) * k));
    const acc = [0, 0, 0]; let n = 0;
    for (let sy = sy0; sy < sy1; sy++) for (let sx = sx0; sx < sx1; sx++) { const i = (sy * IW + sx) * 4; acc[0] += rgba[i]; acc[1] += rgba[i + 1]; acc[2] += rgba[i + 2]; n++; }
    const o = (y * size + x) * 4;
    for (let c = 0; c < 3; c++) tex[o + c] = Math.max(0, Math.min(255, (acc[c] / n - 128) * 1.12 + 132));
    tex[o + 3] = 255;
  }
  fs.writeFileSync(`${OUT}/${file}`, jpeg.encode({ data: tex, width: size, height: size }, quality).data);
}
texture(TEX, "satellite.jpg", 82);
texture(4096, "satellite-4k.jpg", 80);

// ── 3. N-15 route ──
console.log("Route…");
const via = [[73.352, 34.548], [73.523, 34.778], [73.651, 34.909], [74.036, 35.149]];
const osrm = JSON.parse(String(await get(`https://router.project-osrm.org/route/v1/driving/${via.map((p) => p.join(",")).join(";")}?overview=full&geometries=geojson`, "route.json")));
const raw = osrm.routes[0].geometry.coordinates;
const hav = (a, b) => {
  const R = 6371, r = Math.PI / 180, dLat = (b[1] - a[1]) * r, dLon = (b[0] - a[0]) * r;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * r) * Math.cos(b[1] * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
};
const pts = [raw[0]];
for (const p of raw.slice(1)) if (hav(pts.at(-1), p) > 0.06) pts.push(p);
pts.push(raw.at(-1));
let km = 0;
const route = pts.map((p, i) => {
  if (i) km += hav(pts[i - 1], p);
  const ele = sampleH(gxOf(p[0]) - X0 * T, gyOf(p[1]) - Y0 * T);
  return [+p[0].toFixed(5), +p[1].toFixed(5), Math.round(ele), +km.toFixed(2)];
});
console.log(`  ${route.length} points, ${km.toFixed(1)} km`);

// ── 4. stops ──
// Towns with reliable coordinates are snapped onto the route; the small stops are placed by their
// usual road distance from Balakot (scaled to this route's length), since OSM has no points for most.
const KNOWN_KM = 150;
const STOPS = {
  balakot: [73.352, 34.548], ghanool: { km: 10 }, kiwai: { km: 24 }, malakandi: { km: 34 },
  "shinu-jared": { km: 39 }, "mahandri-manoor": { km: 46 }, khanian: { km: 54 }, kaghan: [73.523, 34.778],
  "naran-picnic-point": { km: 76 }, naran: [73.651, 34.909], batakundi: [73.7775, 34.9306], burawai: { km: 103 },
  jalkhad: { km: 109 }, besal: { km: 120 }, lulusar: [73.94, 35.08], gittidas: { km: 138 }, "babusar-top": [74.036, 35.149],
};
const scale = km / KNOWN_KM;
let from = 0;
const stops = {};
for (const [slug, p] of Object.entries(STOPS)) {
  let best = from, bd = Infinity;
  for (let i = from; i < route.length; i++) {
    const d = Array.isArray(p) ? hav(p, route[i]) : Math.abs(route[i][3] - p.km * scale);
    if (d < bd) { bd = d; best = i; }
  }
  const r = route[best];
  stops[slug] = { i: best, lon: r[0], lat: r[1], ele: r[2], km: r[3] };
  console.log(`  ${slug.padEnd(20)} km ${String(r[3]).padStart(6)}  ${r[2]} m  ${Array.isArray(p) ? `(snapped ${bd.toFixed(2)} km)` : "(by road distance)"}`);
  from = best + 1;
}

const meta = {
  bounds: { west: lonOf(X0 * T), east: lonOf((X1 + 1) * T), north: latOf(Y0 * T), south: latOf((Y1 + 1) * T) },
  grid: GRID, minH: Math.round(minH), maxH: Math.round(maxH),
  route, stops,
  credits: ["Imagery: Sentinel-2 cloudless 2016 by EOX IT Services GmbH (CC BY 4.0)", "Terrain: Mapzen / AWS Terrain Tiles (SRTM)", "Road: © OpenStreetMap contributors"],
};
fs.writeFileSync(`${OUT}/meta.json`, JSON.stringify(meta));
for (const f of fs.readdirSync(OUT)) console.log(`  ${f}: ${(fs.statSync(`${OUT}/${f}`).size / 1024).toFixed(0)} KB`);

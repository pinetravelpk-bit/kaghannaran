"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Line, OrbitControls, Sky } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

/**
 * Google Earth style view of the Kaghan valley: real SRTM terrain draped with Sentinel-2 satellite
 * imagery, the N-15 from OpenStreetMap, and every stop at its real position.
 * Assets are built by scripts/build-terrain.mjs into public/terrain/.
 */

export type TerrainMeta = {
  bounds: { west: number; east: number; north: number; south: number };
  grid: number;
  minH: number;
  maxH: number;
  route: [number, number, number, number][]; // lon, lat, elevation m, km from Balakot
  stops: Record<string, { i: number; lon: number; lat: number; ele: number; km: number }>;
  credits: string[];
};
export type EarthStop = { slug: string; name: string; major: boolean };
export type Command = { kind: "fly"; slug: string; n: number } | { kind: "km"; km: number; n: number } | { kind: "home"; n: number } | { kind: "zoom"; by: number; n: number } | { kind: "north"; n: number };
export type CommandInput = Command extends infer C ? (C extends Command ? Omit<C, "n"> : never) : never;

const EXAG = 1.35; // vertical exaggeration, like Google Earth's elevation setting
const Z = 2 ** 12 * 256; // mercator pixels at the zoom the assets were built from

const gxOf = (lon: number) => ((lon + 180) / 360) * Z;
const gyOf = (lat: number) => { const r = (lat * Math.PI) / 180; return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * Z; };

/** Projection from lon/lat/metres to scene kilometres, centred on the terrain. */
function useProjection(meta: TerrainMeta, heights: Uint16Array) {
  return useMemo(() => {
    const { west, east, north, south } = meta.bounds;
    const x0 = gxOf(west), x1 = gxOf(east), y0 = gyOf(north), y1 = gyOf(south);
    const kmPerPx = (40075 * Math.cos((((north + south) / 2) * Math.PI) / 180)) / Z;
    const size = (x1 - x0) * kmPerPx;
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    const n = meta.grid;
    const xz = (lon: number, lat: number) => [(gxOf(lon) - cx) * kmPerPx, (gyOf(lat) - cy) * kmPerPx] as const;
    /** terrain height (scene units) at scene x/z, bilinear from the height grid */
    const hAt = (x: number, z: number) => {
      const gx = Math.min(n - 1.001, Math.max(0, ((x + size / 2) / size) * (n - 1)));
      const gz = Math.min(n - 1.001, Math.max(0, ((z + size / 2) / size) * (n - 1)));
      const ix = Math.floor(gx), iz = Math.floor(gz), fx = gx - ix, fz = gz - iz;
      const a = heights[iz * n + ix], b = heights[iz * n + ix + 1], c = heights[(iz + 1) * n + ix], d = heights[(iz + 1) * n + ix + 1];
      return ((a * (1 - fx) + b * fx) * (1 - fz) + (c * (1 - fx) + d * fx) * fz) / 1000 * EXAG;
    };
    const at = (lon: number, lat: number, lift = 0) => { const [x, z] = xz(lon, lat); return new THREE.Vector3(x, hAt(x, z) + lift, z); };
    return { size, xz, hAt, at };
  }, [meta, heights]);
}
type Projection = ReturnType<typeof useProjection>;

function Terrain({ p, heights, n, texture, step }: { p: Projection; heights: Uint16Array; n: number; texture: THREE.Texture; step: number }) {
  const geom = useMemo(() => {
    const seg = Math.floor((n - 1) / step);
    const g = new THREE.PlaneGeometry(p.size, p.size, seg, seg);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let iy = 0; iy <= seg; iy++) for (let ix = 0; ix <= seg; ix++) {
      pos.setY(iy * (seg + 1) + ix, (heights[iy * step * n + ix * step] / 1000) * EXAG);
    }
    g.computeVertexNormals();
    return g;
  }, [p, heights, n, step]);

  // dark rock walls around the edge of the tile
  const skirt = useMemo(() => {
    const s = p.size / 2, out: number[] = [];
    const N = 200, BASE = 0;
    const side = (f: (t: number) => [number, number]) => {
      for (let i = 0; i < N; i++) {
        const [xa, za] = f(i / N), [xb, zb] = f((i + 1) / N);
        const ha = p.hAt(xa, za), hb = p.hAt(xb, zb);
        out.push(xa, ha, za, xa, BASE, za, xb, hb, zb, xb, hb, zb, xa, BASE, za, xb, BASE, zb);
      }
    };
    side((t) => [-s + t * 2 * s, s]);
    side((t) => [s, s - t * 2 * s]);
    side((t) => [s - t * 2 * s, -s]);
    side((t) => [-s, -s + t * 2 * s]);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(out, 3));
    g.computeVertexNormals();
    return g;
  }, [p]);

  return (
    <>
      <mesh geometry={geom}>
        <meshStandardMaterial map={texture} roughness={1} metalness={0} />
      </mesh>
      <mesh geometry={skirt}>
        <meshStandardMaterial color="#3b3328" roughness={1} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}

/** The N-15, draped on the terrain. A faint copy without depth testing shows it through ridges. */
function Road({ p, meta, uptoKm }: { p: Projection; meta: TerrainMeta; uptoKm: number }) {
  const pts = useMemo(() => meta.route.map(([lon, lat]) => p.at(lon, lat, 0.06)), [p, meta]);
  const n = Math.max(2, meta.route.findIndex((r) => r[3] > uptoKm) === -1 ? pts.length : meta.route.findIndex((r) => r[3] > uptoKm));
  return (
    <>
      <Line points={pts} color="#F3C64B" lineWidth={1.5} transparent opacity={0.28} depthTest={false} renderOrder={1} />
      <Line points={pts.slice(0, n)} color="#F3C64B" lineWidth={3.5} renderOrder={2} />
    </>
  );
}

const pill = "flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/20 bg-[#0a1716]/85 px-2.5 py-1 text-[12px] font-semibold text-white shadow-lg backdrop-blur transition hover:bg-[#8E1B1B]";

/** Placemarks. Minor stops only show once the camera is close, so labels don't pile up. */
function Placemarks({ p, meta, stops, onPick }: { p: Projection; meta: TerrainMeta; stops: EarthStop[]; onPick: (slug: string) => void }) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const items = useMemo(() => stops.filter((s) => meta.stops[s.slug]).map((s) => {
    const m = meta.stops[s.slug];
    const ground = p.at(m.lon, m.lat);
    return { ...s, ele: m.ele, ground, top: ground.clone().add(new THREE.Vector3(0, s.major ? 0.9 : 0.55, 0)) };
  }), [p, meta, stops]);
  const { camera } = useThree();
  useFrame(() => {
    items.forEach((s, i) => {
      const el = refs.current[i];
      if (!el) return;
      const d = camera.position.distanceTo(s.top);
      const show = s.major || d < 28;
      el.style.opacity = show ? "1" : "0";
      el.style.pointerEvents = show ? "auto" : "none";
    });
  });
  return (
    <>
      {items.map((s, i) => (
        <group key={s.slug}>
          <Line points={[s.ground, s.top]} color="#ffffff" lineWidth={1.2} transparent opacity={0.8} />
          <mesh position={s.ground}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshBasicMaterial color={s.major ? "#F2A33A" : "#F3C64B"} />
          </mesh>
          <Html position={s.top} center zIndexRange={[30, 0]}>
            <div ref={(el) => { refs.current[i] = el; }} className="-translate-y-1/2 transition-opacity duration-300">
              <button type="button" onClick={() => onPick(s.slug)} className={pill} aria-label={`Fly to ${s.name}`}>
                <span className={s.major ? "size-2 rounded-full bg-[#F2A33A]" : "size-1.5 rounded-full bg-[#F3C64B]"} aria-hidden />
                {s.name}
                <span className="hidden font-mono text-[11px] font-normal text-[#C9D4CF] sm:inline">{s.ele.toLocaleString("en-US")} m</span>
              </button>
            </div>
          </Html>
        </group>
      ))}
    </>
  );
}

const HOME_WIDE = { pos: new THREE.Vector3(-14, 58, 76), target: new THREE.Vector3(-2, 0, 4) };
// portrait screens: look down more steeply so the whole diagonal route fits
const HOME_TALL = { pos: new THREE.Vector3(-6, 140, 66), target: new THREE.Vector3(1, 0, 1) };
const homeFor = (aspect: number) => (aspect < 1 ? HOME_TALL : HOME_WIDE);
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Camera moves: fly-to, follow-the-road tour, zoom buttons, reset. */
function Director({ p, meta, command, touring, onTourKm, onTourEnd, controls }: {
  p: Projection; meta: TerrainMeta; command: Command | null; touring: boolean;
  onTourKm: (km: number) => void; onTourEnd: () => void; controls: React.RefObject<OrbitControlsImpl | null>;
}) {
  const { camera, size } = useThree();
  const flight = useRef<{ fromP: THREE.Vector3; fromT: THREE.Vector3; toP: THREE.Vector3; toT: THREE.Vector3; t: number; dur: number } | null>(null);
  const tourKm = useRef(0);
  const lastReport = useRef(0);
  const total = meta.route.at(-1)![3];

  const pointAtKm = (km: number, lift = 0) => {
    const r = meta.route;
    let i = r.findIndex((x) => x[3] >= km);
    if (i <= 0) i = Math.max(1, i === -1 ? r.length - 1 : 1);
    const a = r[i - 1], b = r[i], f = Math.min(1, Math.max(0, (km - a[3]) / Math.max(1e-6, b[3] - a[3])));
    return p.at(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, lift);
  };

  const flyTo = (toT: THREE.Vector3, toP: THREE.Vector3, dur = 2.2) => {
    const c = controls.current;
    flight.current = { fromP: camera.position.clone(), fromT: c ? c.target.clone() : toT.clone(), toP, toT, t: 0, dur };
  };

  useEffect(() => {
    if (!command) return;
    const c = controls.current;
    if (command.kind === "home") { const h = homeFor(size.width / size.height); flyTo(h.target.clone(), h.pos.clone()); }
    if (command.kind === "fly" || command.kind === "km") {
      const km = command.kind === "fly" ? meta.stops[command.slug]?.km ?? 0 : command.km;
      const t = pointAtKm(km);
      // look along the valley from slightly down-road and to the side
      const back = pointAtKm(Math.max(0, km - 4));
      const dir = t.clone().sub(back).setY(0).normalize();
      const side = new THREE.Vector3(-dir.z, 0, dir.x);
      flyTo(t, t.clone().addScaledVector(dir, -6).addScaledVector(side, 3).add(new THREE.Vector3(0, 4.5, 0)));
    }
    if (command.kind === "zoom" && c) {
      const off = camera.position.clone().sub(c.target).multiplyScalar(command.by);
      if (off.length() > 2 && off.length() < 130) flyTo(c.target.clone(), c.target.clone().add(off), 0.6);
    }
    if (command.kind === "north" && c) {
      const d = camera.position.clone().sub(c.target);
      const flat = Math.hypot(d.x, d.z);
      flyTo(c.target.clone(), c.target.clone().add(new THREE.Vector3(0, d.y, flat)), 0.9);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [command]);

  useEffect(() => { if (touring) { tourKm.current = 0; flight.current = null; } }, [touring]);
  useEffect(() => {
    const h = homeFor(size.width / size.height);
    camera.position.copy(h.pos);
    controls.current?.target.copy(h.target);
    controls.current?.update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const camTarget = useMemo(() => new THREE.Vector3(), []);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);
  useFrame((state, dt) => {
    const c = controls.current;
    if (touring) {
      tourKm.current = Math.min(total, tourKm.current + dt * 3.2); // ~46 s for the whole road
      const km = tourKm.current;
      const here = pointAtKm(km);
      const ahead = pointAtKm(Math.min(total, km + 3));
      const behind = pointAtKm(Math.max(0, km - 3.5));
      const dir = here.clone().sub(behind).setY(0).normalize();
      camTarget.copy(behind).addScaledVector(dir, -2).add(new THREE.Vector3(0, 3, 0));
      // rise until nothing between the camera and the road ahead blocks the view
      for (let s = 0; s <= 0.9; s += 0.05) {
        const gx = camTarget.x + (ahead.x - camTarget.x) * s, gz = camTarget.z + (ahead.z - camTarget.z) * s;
        const need = (p.hAt(gx, gz) + 0.35 - ahead.y * s) / (1 - s);
        if (need > camTarget.y) camTarget.y = need;
      }
      lookTarget.lerp(ahead, 0.08);
      camera.position.lerp(camTarget, 0.05);
      if (c) c.target.copy(lookTarget);
      camera.lookAt(lookTarget);
      if (state.clock.elapsedTime - lastReport.current > 0.1) { lastReport.current = state.clock.elapsedTime; onTourKm(km); }
      if (km >= total) onTourEnd();
      return;
    }
    const f = flight.current;
    if (f && c) {
      f.t = Math.min(1, f.t + dt / f.dur);
      const e = ease(f.t);
      // arc up a little in the middle of long flights, like Google Earth
      const lift = Math.sin(Math.PI * e) * Math.min(14, f.fromP.distanceTo(f.toP) * 0.25);
      camera.position.lerpVectors(f.fromP, f.toP, e).add(new THREE.Vector3(0, lift, 0));
      c.target.lerpVectors(f.fromT, f.toT, e);
      c.update();
      if (f.t >= 1) flight.current = null;
    }
    // keep the view on the tile and above the ground
    if (c) {
      const lim = p.size / 2 - 4;
      c.target.x = THREE.MathUtils.clamp(c.target.x, -lim, lim);
      c.target.z = THREE.MathUtils.clamp(c.target.z, -lim, lim);
      const ground = p.hAt(camera.position.x, camera.position.z) + 0.4;
      if (camera.position.y < ground) camera.position.y = ground;
    }
  });
  return null;
}

export default function EarthScene({ meta, heights, textureUrl, hiResUrl, stops, interactive, command, touring, tourKm, onTourKm, onTourEnd, onPick, step, onReady }: {
  meta: TerrainMeta; heights: Uint16Array; textureUrl: string; hiResUrl?: string; stops: EarthStop[]; interactive: boolean; command: Command | null;
  touring: boolean; tourKm: number; onTourKm: (km: number) => void; onTourEnd: () => void; onPick: (slug: string) => void; step: number; onReady: () => void;
}) {
  const p = useProjection(meta, heights);
  const controls = useRef<OrbitControlsImpl | null>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    // the 2K image shows first; on desktops the sharper 4K one replaces it once downloaded
    const loader = new THREE.TextureLoader();
    const prep = (t: THREE.Texture) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
    let alive = true;
    loader.load(textureUrl, (t) => {
      if (!alive) return;
      setTexture(prep(t));
      onReady();
      if (hiResUrl) loader.load(hiResUrl, (hi) => { if (alive) setTexture((old) => { old?.dispose(); return prep(hi); }); });
    });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textureUrl, hiResUrl]);

  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: HOME_WIDE.pos.toArray(), fov: 40, near: 0.1, far: 600 }} gl={{ antialias: true }} className="!absolute inset-0">
      <Sky distance={4500} sunPosition={[-60, 40, 80]} turbidity={7} rayleigh={1.4} mieCoefficient={0.006} mieDirectionalG={0.85} />
      <fog attach="fog" args={["#c9d6dd", 70, 190]} />
      <hemisphereLight args={["#ffffff", "#6b6152", 1.6]} />
      <directionalLight position={[-40, 50, 60]} intensity={1.1} color="#fff4e0" />
      {texture ? <Terrain p={p} heights={heights} n={meta.grid} texture={texture} step={step} /> : null}
      <Road p={p} meta={meta} uptoKm={touring ? tourKm : Infinity} />
      <Placemarks p={p} meta={meta} stops={stops} onPick={onPick} />
      <OrbitControls
        ref={controls}
        target={HOME_WIDE.target}
        enabled={interactive && !touring}
        enableDamping
        dampingFactor={0.08}
        maxPolarAngle={1.38}
        minDistance={2.5}
        maxDistance={120}
        autoRotate={!interactive && !touring}
        autoRotateSpeed={0.25}
        screenSpacePanning={false}
      />
      <Director p={p} meta={meta} command={command} touring={touring} onTourKm={onTourKm} onTourEnd={onTourEnd} controls={controls} />
    </Canvas>
  );
}

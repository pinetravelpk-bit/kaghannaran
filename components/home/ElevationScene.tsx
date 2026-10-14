"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { fbm, hash } from "@/lib/noise";

/**
 * 3D version of the "Elevation along the N-15" chart: the same left-to-right stops and heights,
 * built as a diorama with mountains, the road, the Kunhar river, bazaars and pine forest.
 */

export type ProfileStop = { slug: string; name: string; alt: number; known: boolean; kind: string };

const L = 60; // route length in scene units, Balakot → Babusar Top
const MIN = 600, MAX = 4400, VH = 18; // altitude range mapped to 0…VH units of height
const X0 = -L / 2 - 4, X1 = L / 2 + 4;
const BACK = -16, FRONT = 6, SLAB = 1.6; // soil slab thickness under the surface
const ROAD_HALF = 1.1, MOUNTAINS = 3.3; // mountains rise beyond this distance behind the road
const BOARD = "#0a1716";

const yOfAlt = (a: number) => ((a - MIN) / (MAX - MIN)) * VH;
const altOfY = (y: number) => (y / VH) * (MAX - MIN) + MIN;
const smooth = (t: number) => { const c = Math.min(1, Math.max(0, t)); return c * c * (3 - 2 * c); };
const roadZ = (x: number) => Math.sin(x * 0.35) * 0.35;
// the Kunhar runs just behind the road, between it and the mountains
const riverZ = (x: number) => roadZ(x) - 2.6 + Math.sin(x * 0.5) * 0.2;

/** Stop sizes for bazaar clusters, by the stop's kind in lib/seed/stops.ts. */
const HOUSES: Record<string, number> = {
  "Gateway town": 18, "Main base": 24, "Valley town": 14, "Bazaar & valley": 12, "Trout & crafts": 7,
  "Naran → Batakundi": 7, "Village": 5, "Jeep junction": 5, "Junction": 3, "Before Naran": 3,
  "Waterfall stop": 2, "Trailhead": 2, "Meadows": 2, "Pass": 3, "National park": 1, "Lake": 0,
};
const WALLS = ["#efe6d2", "#d9c7a7", "#c8b48e", "#f4efe6", "#b99a74"].map((c) => new THREE.Color(c));
const ROOFS = ["#8f2a2a", "#2f5f8a", "#3f7a4a", "#b8452f", "#9aa3a6", "#2a6f6a"].map((c) => new THREE.Color(c));

function useWorld(stops: ProfileStop[]) {
  return useMemo(() => {
    const n = stops.length;
    const xs = stops.map((_, i) => -L / 2 + (i / (n - 1)) * L);
    const ys = stops.map((s) => yOfAlt(s.alt));
    const step = xs[1] - xs[0];
    const base = (x: number) => {
      if (x <= xs[0]) return ys[0];
      if (x >= xs[n - 1]) return ys[n - 1];
      const i = Math.min(n - 2, Math.floor((x - xs[0]) / step));
      return ys[i] + (ys[i + 1] - ys[i]) * smooth((x - xs[i]) / step);
    };
    const lake = stops.findIndex((s) => s.kind === "Lake");
    const lakeX = lake >= 0 ? xs[lake] : X1 + 10;
    const lakeZ = roadZ(lakeX) - 2.7;
    const riverEnd = lakeX; // the Kunhar starts at Lulusar Lake
    const riverOn = (x: number) => smooth((riverEnd - x) / 1.5);

    const heightAt = (x: number, z: number) => {
      const b = base(x);
      const d = z - roadZ(x);
      let h = b;
      if (d < -ROAD_HALF) {
        // behind the road: the river channel, then mountains that grow with distance
        const k = smooth((-d - MOUNTAINS) / 7);
        const m = fbm(x * 0.12 + 5, z * 0.12) * 7 + Math.pow(fbm(x * 0.06 + 11, z * 0.08 + 3), 2.5) * 12;
        const dz = z - riverZ(x);
        const dip = 0.6 * Math.exp(-(dz * dz) / 0.9) * riverOn(x);
        h = b + 0.15 * smooth((-d - ROAD_HALF) / 1.5) - dip + m * k;
        const ld = Math.hypot((x - lakeX) / 1.4, z - lakeZ);
        if (ld < 3) h = THREE.MathUtils.lerp(b + 0.05, h, smooth((ld - 0.9) / 2.1));
      } else if (d > ROAD_HALF) {
        // in front: a gentle slope with low hills
        const k = smooth((d - ROAD_HALF) / 2);
        const hills = fbm(x * 0.2, z * 0.2 + 9) * 0.7 * smooth((d - 2.5) / 1.5);
        h = b - 0.35 * k + hills;
      }
      return h;
    };
    return { xs, ys, base, heightAt, lakeX, lakeZ, riverEnd };
  }, [stops]);
}

type World = ReturnType<typeof useWorld>;

function colorFor(h: number, x: number, z: number, out: THREE.Color) {
  const alt = altOfY(h);
  const v = hash(Math.floor(x * 3), Math.floor(z * 3));
  if (alt < 2300) out.set("#5b8c4c").lerp(new THREE.Color("#2f5e3c"), fbm(x * 0.3, z * 0.3, 3) * 0.9);
  else if (alt < 3300) out.set("#3f6b45").lerp(new THREE.Color("#7d8a5a"), smooth((alt - 2300) / 1000));
  else if (alt < 4150) out.set("#8a8473").lerp(new THREE.Color("#a29c8c"), v * 0.5);
  else out.set("#f4f6f4");
  return out.offsetHSL(0, 0, (v - 0.5) * 0.04);
}

function Terrain({ w }: { w: World }) {
  const geom = useMemo(() => {
    const g = new THREE.PlaneGeometry(X1 - X0, FRONT - BACK, 340, 130);
    g.rotateX(-Math.PI / 2);
    g.translate((X0 + X1) / 2, 0, (FRONT + BACK) / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const h = w.heightAt(x, z);
      pos.setY(i, h);
      colorFor(h, x, z, c);
      // bare earth along the road shoulders and river banks
      const dRoad = Math.abs(z - roadZ(x));
      if (dRoad < ROAD_HALF + 0.15) c.lerp(new THREE.Color("#7a6c55"), 0.6);
      colors.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, [w]);

  // soil walls around the visible edges so it reads as a diorama block
  const skirt = useMemo(() => {
    const pos: number[] = [];
    const edge = (pts: [number, number][]) => {
      for (let i = 0; i < pts.length - 1; i++) {
        const [xa, za] = pts[i], [xb, zb] = pts[i + 1];
        const ha = w.heightAt(xa, za), hb = w.heightAt(xb, zb);
        const fa = w.base(xa) - SLAB, fb = w.base(xb) - SLAB;
        pos.push(xa, ha, za, xa, fa, za, xb, hb, zb, xb, hb, zb, xa, fa, za, xb, fb, zb);
      }
    };
    const N = 340;
    edge(Array.from({ length: N + 1 }, (_, i) => [X0 + ((X1 - X0) * i) / N, FRONT] as [number, number]));
    edge(Array.from({ length: 131 }, (_, i) => [X0, FRONT - ((FRONT - BACK) * i) / 130] as [number, number]));
    edge(Array.from({ length: 131 }, (_, i) => [X1, BACK + ((FRONT - BACK) * i) / 130] as [number, number]));
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    return g;
  }, [w]);

  return (
    <>
      <mesh geometry={geom} receiveShadow castShadow>
        <meshStandardMaterial vertexColors flatShading roughness={0.95} />
      </mesh>
      <mesh geometry={skirt}>
        <meshStandardMaterial color="#3a2f22" roughness={1} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}

/** Flat ribbon along z = f(x), as non-indexed triangles ordered left → right (so drawRange can "draw" it). */
function ribbon(xa: number, xb: number, step: number, zf: (x: number) => number, yf: (x: number) => number, half: number, keep: (x: number) => boolean = () => true) {
  const pos: number[] = [];
  for (let x = xa; x < xb; x += step) {
    if (!keep(x)) continue;
    const x2 = Math.min(xb, x + step);
    const pts = [x, x2].map((px) => {
      const dz = (zf(px + 0.01) - zf(px - 0.01)) / 0.02;
      const len = Math.hypot(dz, 1);
      const nx = -dz / len, nz = 1 / len;
      const y = yf(px), z = zf(px);
      return [[px + nx * half, y, z + nz * half], [px - nx * half, y, z - nz * half]];
    });
    const [[a1, a2], [b1, b2]] = pts;
    pos.push(...a1, ...b1, ...a2, ...b1, ...b2, ...a2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

function Road({ w, progress }: { w: World; progress: React.RefObject<number> }) {
  const asphalt = useMemo(() => ribbon(X0, X1, 0.12, roadZ, (x) => w.base(x) + 0.05, 0.42), [w]);
  const dashes = useMemo(() => ribbon(X0, X1, 0.12, roadZ, (x) => w.base(x) + 0.07, 0.05, (x) => Math.floor((x - X0) / 0.36) % 2 === 0), [w]);
  useFrame(() => {
    const p = progress.current ?? 1;
    for (const g of [asphalt, dashes]) {
      const total = g.attributes.position.count;
      g.setDrawRange(0, Math.floor((total / 6) * p) * 6);
    }
  });
  return (
    <>
      <mesh geometry={asphalt} receiveShadow>
        <meshStandardMaterial color="#2b2f2e" roughness={0.85} polygonOffset polygonOffsetFactor={-2} />
      </mesh>
      <mesh geometry={dashes}>
        <meshBasicMaterial color="#F3C64B" polygonOffset polygonOffsetFactor={-4} toneMapped={false} />
      </mesh>
    </>
  );
}

function Water({ w }: { w: World }) {
  const river = useMemo(() => ribbon(X0, w.riverEnd - 0.4, 0.15, riverZ, (x) => w.base(x) - 0.22, 0.34), [w]);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => { if (mat.current) mat.current.emissiveIntensity = 0.35 + Math.sin(clock.elapsedTime * 1.6) * 0.08; });
  return (
    <>
      <mesh geometry={river}>
        <meshStandardMaterial ref={mat} color="#5fc4e6" emissive="#2d8fb5" emissiveIntensity={0.35} roughness={0.15} />
      </mesh>
      {w.lakeX < X1 ? (
        <mesh position={[w.lakeX, w.base(w.lakeX) + 0.12, w.lakeZ]} rotation-x={-Math.PI / 2} scale={[1.3, 0.85, 1]}>
          <circleGeometry args={[1, 40]} />
          <meshStandardMaterial color="#4fb3d9" emissive="#1f6f8f" emissiveIntensity={0.4} roughness={0.1} />
        </mesh>
      ) : null}
    </>
  );
}

/** Bazaar clusters: houses with coloured tin roofs, sized by how big each stop is. */
function Bazaars({ w, stops }: { w: World; stops: ProfileStop[] }) {
  const walls = useRef<THREE.InstancedMesh>(null);
  const roofs = useRef<THREE.InstancedMesh>(null);
  const items = useMemo(() => {
    const out: { x: number; z: number; y: number; w: number; d: number; h: number; r: number; wall: number; roof: number }[] = [];
    stops.forEach((s, i) => {
      const count = HOUSES[s.kind] ?? 2;
      for (let k = 0; k < count; k++) {
        const r1 = hash(i * 13.1 + k, k * 7.7), r2 = hash(k * 3.3, i * 5.9 + 1), r3 = hash(i + k * 0.37, 9.1);
        const front = k % 4 !== 3;
        const x = w.xs[i] + (r1 - 0.5) * (count > 10 ? 2.6 : 1.6);
        const z = front ? roadZ(x) + ROAD_HALF + 0.2 + r2 * 0.9 : roadZ(x) - ROAD_HALF - 0.2 - r2 * 0.6;
        const tall = count > 10 && r3 > 0.7; // multi-storey hotels in the bigger towns
        out.push({ x, z, y: w.heightAt(x, z), w: 0.3 + r3 * 0.25, d: 0.28 + r1 * 0.18, h: tall ? 0.42 + r2 * 0.18 : 0.22 + r2 * 0.14, r: (r2 - 0.5) * 0.5, wall: Math.floor(r1 * WALLS.length), roof: Math.floor(r3 * ROOFS.length) });
      }
    });
    return out;
  }, [w, stops]);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    items.forEach((b, i) => {
      q.setFromEuler(e.set(0, b.r, 0));
      m.compose(new THREE.Vector3(b.x, b.y + b.h / 2, b.z), q, new THREE.Vector3(b.w, b.h, b.d));
      walls.current!.setMatrixAt(i, m);
      walls.current!.setColorAt(i, WALLS[b.wall]);
      q.setFromEuler(e.set(0, b.r + Math.PI / 4, 0));
      m.compose(new THREE.Vector3(b.x, b.y + b.h + 0.09, b.z), q, new THREE.Vector3(Math.max(b.w, b.d) * 0.78, 0.18, Math.max(b.w, b.d) * 0.78));
      roofs.current!.setMatrixAt(i, m);
      roofs.current!.setColorAt(i, ROOFS[b.roof]);
    });
    for (const r of [walls.current!, roofs.current!]) { r.instanceMatrix.needsUpdate = true; if (r.instanceColor) r.instanceColor.needsUpdate = true; }
  }, [items]);

  return (
    <>
      <instancedMesh ref={walls} args={[undefined, undefined, items.length]} castShadow receiveShadow>
        <boxGeometry />
        <meshStandardMaterial roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={roofs} args={[undefined, undefined, items.length]} castShadow>
        <coneGeometry args={[1, 1, 4]} />
        <meshStandardMaterial roughness={0.5} metalness={0.25} flatShading />
      </instancedMesh>
    </>
  );
}

/** Pine forest below the tree line, kept off the road, river and towns. */
function Forest({ w, stops }: { w: World; stops: ProfileStop[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const trees = useMemo(() => {
    const towns = w.xs.filter((_, i) => (HOUSES[stops[i].kind] ?? 2) >= 5);
    const out: { x: number; y: number; z: number; s: number; c: number }[] = [];
    for (let i = 0; i < 4200 && out.length < 1100; i++) {
      const x = X0 + 1 + hash(i, 1.7) * (X1 - X0 - 2);
      const z = BACK + 2 + hash(2.3, i) * (FRONT - BACK - 2.6);
      if (Math.abs(z - roadZ(x)) < ROAD_HALF + 0.3) continue;
      if (x < w.riverEnd && Math.abs(z - riverZ(x)) < 0.75) continue;
      if (towns.some((tx) => Math.abs(tx - x) < 1.6 && Math.abs(z) < 3)) continue;
      if (fbm(x * 0.25 + 4, z * 0.25, 3) < 0.42) continue; // clustered forests
      const y = w.heightAt(x, z);
      if (altOfY(y) > 3350) continue; // tree line
      out.push({ x, y, z, s: 0.7 + hash(i, 9) * 0.7, c: hash(i, 4) });
    }
    return out;
  }, [w, stops]);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4(), c = new THREE.Color();
    trees.forEach((t, i) => {
      m.makeScale(t.s, t.s, t.s).setPosition(t.x, t.y + 0.27 * t.s, t.z);
      ref.current!.setMatrixAt(i, m);
      ref.current!.setColorAt(i, c.set(t.c > 0.5 ? "#1f4a33" : "#2c5c3a"));
    });
    ref.current!.instanceMatrix.needsUpdate = true;
    if (ref.current!.instanceColor) ref.current!.instanceColor.needsUpdate = true;
  }, [trees]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, trees.length]} castShadow>
      <coneGeometry args={[0.17, 0.55, 6]} />
      <meshStandardMaterial roughness={0.9} flatShading />
    </instancedMesh>
  );
}

const label = "pointer-events-none whitespace-nowrap select-none";

/** Stop pins with altitude tags, names along the front edge like the chart's x-axis, and a height ruler. */
function Markers({ w, stops, progress, started }: { w: World; stops: ProfileStop[]; progress: React.RefObject<number>; started: boolean }) {
  const pins = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const p = progress.current ?? 1;
    pins.current?.children.forEach((g, i) => {
      const shown = p >= i / (stops.length - 1) - 0.001 ? 1 : 0;
      const pulse = stops[i].known ? 1 + Math.sin(clock.elapsedTime * 2.4 + i) * 0.12 : 1;
      g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, shown * pulse, 0.15));
    });
  });
  return (
    <>
      <group ref={pins}>
        {stops.map((s, i) => {
          const x = w.xs[i], y = w.ys[i] + 0.05, z = roadZ(x);
          return (
            <group key={s.slug} position={[x, y, z]} scale={0}>
              <mesh position={[0, 0.35, 0]}>
                <cylinderGeometry args={[0.025, 0.025, 0.7, 6]} />
                <meshBasicMaterial color="#0A1716" />
              </mesh>
              <mesh position={[0, 0.75, 0]}>
                <sphereGeometry args={[s.known ? 0.22 : 0.13, 20, 20]} />
                <meshBasicMaterial color={s.known ? "#F2A33A" : "#C9D4CF"} toneMapped={false} />
              </mesh>
            </group>
          );
        })}
      </group>
      {stops.map((s, i) => (
        <group key={s.slug}>
          {s.known ? (
            <Html position={[w.xs[i], w.ys[i] + 1.35, roadZ(w.xs[i])]} center zIndexRange={[20, 0]}>
              <span style={{ transitionDelay: `${300 + (i / stops.length) * 2000}ms` }} className={`${label} block rounded-md bg-board/80 px-1.5 py-0.5 font-mono text-[12px] font-semibold text-ground transition-opacity duration-500 ${started ? "opacity-100" : "opacity-0"}`}>
                {s.alt.toLocaleString("en-US")} m
              </span>
            </Html>
          ) : null}
          <Html position={[w.xs[i], w.base(w.xs[i]) - SLAB, FRONT]} zIndexRange={[20, 0]}>
            <span style={{ transform: "translate(-100%, 6px) rotate(-35deg)", transformOrigin: "100% 0" }} className={`${label} block text-[11px] ${s.known ? "text-ground" : "text-[#7F9893]"}`}>
              {s.name}
            </span>
          </Html>
        </group>
      ))}
      {/* height ruler at the Balakot end */}
      <group position={[X0 + 1.6, 0, -1.6]}>
        <mesh position={[0, yOfAlt(4400) / 2 + (yOfAlt(MIN) - SLAB) / 2, 0]}>
          <boxGeometry args={[0.08, yOfAlt(4400) - yOfAlt(MIN) + SLAB, 0.08]} />
          <meshBasicMaterial color="#2E4A45" />
        </mesh>
        {[1000, 2000, 3000, 4000].map((a) => (
          <group key={a} position={[0, yOfAlt(a), 0]}>
            <mesh position={[0.3, 0, 0]}>
              <boxGeometry args={[0.6, 0.05, 0.05]} />
              <meshBasicMaterial color="#7F9893" />
            </mesh>
            <Html position={[-0.25, 0, 0]} zIndexRange={[20, 0]}>
              <span style={{ transform: "translate(-100%, -50%)" }} className={`${label} block font-mono text-[11px] text-[#7F9893]`}>{a / 1000}k</span>
            </Html>
          </group>
        ))}
      </group>
    </>
  );
}

/** Drives the draw-in animation and a gentle, pointer-following camera sway. */
function Rig({ reduce, started, progress }: { reduce: boolean; started: boolean; progress: React.RefObject<number> }) {
  const { camera, pointer } = useThree();
  const t = useRef(0);
  const look = useMemo(() => new THREE.Vector3(0, 8, -2), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, dt) => {
    if (started && progress.current! < 1) progress.current = reduce ? 1 : Math.min(1, progress.current! + dt / 2.4);
    t.current += reduce ? 0 : dt;
    const intro = reduce ? 1 : smooth(progress.current!);
    target.set(
      THREE.MathUtils.lerp(-14, 0, intro) + Math.sin(t.current * 0.15) * 2 + (reduce ? 0 : pointer.x * 3),
      THREE.MathUtils.lerp(14, 23, intro) + (reduce ? 0 : pointer.y * 1.5),
      THREE.MathUtils.lerp(44, 58, intro),
    );
    camera.position.lerp(target, reduce ? 1 : 0.06);
    camera.lookAt(look);
  });
  return null;
}

export default function ElevationScene({ stops, started, active, reduce }: { stops: ProfileStop[]; started: boolean; active: boolean; reduce: boolean }) {
  const w = useWorld(stops);
  const progress = useRef(reduce ? 1 : 0);
  return (
    <Canvas
      shadows
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.5]}
      camera={{ position: [-14, 14, 44], fov: 32, near: 0.5, far: 240 }}
      gl={{ antialias: true }}
      className="!absolute inset-0"
    >
      <color attach="background" args={[BOARD]} />
      <fog attach="fog" args={[BOARD, 70, 130]} />
      <hemisphereLight args={["#e9f1ee", "#1d2b28", 1.05]} />
      <directionalLight
        position={[-30, 42, 26]}
        intensity={2.3}
        color="#fff1d6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.0006}
      />
      <Terrain w={w} />
      <Water w={w} />
      <Road w={w} progress={progress} />
      <Bazaars w={w} stops={stops} />
      <Forest w={w} stops={stops} />
      <Markers w={w} stops={stops} progress={progress} started={started} />
      <Rig reduce={reduce} started={started} progress={progress} />
    </Canvas>
  );
}

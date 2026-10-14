"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/* ── tiny deterministic value-noise (no deps) ── */
function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function noise(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x: number, y: number) {
  let v = 0, amp = 0.5, f = 1;
  for (let i = 0; i < 6; i++) { v += amp * noise(x * f, y * f); f *= 2.03; amp *= 0.5; }
  return v;
}

const SIZE = 120;
const SEG = 220;
/** River path: x position of the Kunhar along z. */
const riverX = (z: number) => Math.sin(z * 0.045) * 9 + Math.sin(z * 0.11) * 3;

function heightAt(x: number, z: number) {
  const d = Math.abs(x - riverX(z));
  const valley = Math.min(1, d / 26); // 0 at river, 1 far away
  const ridge = fbm(x * 0.035 + 10, z * 0.035) * 26;
  const peaks = Math.pow(fbm(x * 0.02 + 3, z * 0.02 + 7), 3) * 70;
  return (ridge + peaks) * Math.pow(valley, 1.6) - 1.5;
}

function Terrain() {
  const geom = useMemo(() => {
    const g = new THREE.PlaneGeometry(SIZE, SIZE * 2, SEG, SEG * 2);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    const grass = new THREE.Color("#4f8a4a"), pine = new THREE.Color("#285a3e"), rock = new THREE.Color("#8a8473"), snow = new THREE.Color("#f4f6f4");
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const h = heightAt(x, z);
      pos.setY(i, h);
      if (h < 4) c.copy(grass).lerp(pine, Math.max(0, h) / 4);
      else if (h < 16) c.copy(pine).lerp(rock, (h - 4) / 12);
      else if (h < 24) c.copy(rock).lerp(snow, (h - 16) / 8);
      else c.copy(snow);
      colors.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geom} receiveShadow>
      <meshStandardMaterial vertexColors flatShading roughness={0.95} metalness={0} />
    </mesh>
  );
}

function River() {
  const geom = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let z = -SIZE; z <= SIZE; z += 2) pts.push(new THREE.Vector3(riverX(z), -1.1, z));
    const curve = new THREE.CatmullRomCurve3(pts);
    return new THREE.TubeGeometry(curve, 300, 0.9, 6, false);
  }, []);
  return (
    <mesh geometry={geom}>
      <meshStandardMaterial color="#5fc4e6" emissive="#2d8fb5" emissiveIntensity={0.35} roughness={0.2} />
    </mesh>
  );
}

/** Glowing markers for stops along the road. */
function Stops() {
  const group = useRef<THREE.Group>(null);
  const zs = useMemo(() => [-90, -60, -35, -10, 15, 40, 65, 90], []);
  useFrame(({ clock }) => {
    group.current?.children.forEach((m, i) => {
      const s = 1 + Math.sin(clock.elapsedTime * 2 + i) * 0.25;
      m.scale.setScalar(s);
    });
  });
  return (
    <group ref={group}>
      {zs.map((z, i) => (
        <mesh key={z} position={[riverX(z) + 2.2, 0.6, z]}>
          <sphereGeometry args={[0.55, 16, 16]} />
          <meshBasicMaterial color={i === zs.length - 1 ? "#F2A33A" : "#F3C64B"} />
        </mesh>
      ))}
    </group>
  );
}

function Snowfall() {
  const ref = useRef<THREE.Points>(null);
  const COUNT = 900;
  const positions = useMemo(() => {
    const p = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      p[i * 3] = (Math.random() - 0.5) * 80;
      p[i * 3 + 1] = Math.random() * 40;
      p[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    return p;
  }, []);
  useFrame((_, dt) => {
    const a = ref.current?.geometry.attributes.position as THREE.BufferAttribute | undefined;
    if (!a) return;
    for (let i = 0; i < COUNT; i++) {
      let y = a.getY(i) - dt * 2.2;
      if (y < 0) y = 40;
      a.setY(i, y);
    }
    a.needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.18} color="#ffffff" transparent opacity={0.7} depthWrite={false} />
    </points>
  );
}

/** Slow fly-through up the valley with pointer parallax. */
function Rig({ reduce }: { reduce: boolean }) {
  const { camera, pointer } = useThree();
  const t = useRef(0);
  useFrame((_, dt) => {
    if (!reduce) t.current += dt;
    const z = 80 - ((t.current * 3) % 150);
    const target = new THREE.Vector3(riverX(z - 30), 2, z - 30);
    camera.position.lerp(new THREE.Vector3(riverX(z) + pointer.x * 6, 16 + pointer.y * 3, z), 0.05);
    camera.lookAt(target);
  });
  return null;
}

export default function TerrainScene({ reduce = false }: { reduce?: boolean }) {
  return (
    <Canvas camera={{ position: [0, 16, 80], fov: 55, near: 0.1, far: 400 }} dpr={[1, 1.75]} gl={{ antialias: true }}>
      <color attach="background" args={["#12302C"]} />
      <fog attach="fog" args={["#1A3F3A", 55, 190]} />
      <hemisphereLight args={["#eaf5ef", "#2a4a44", 1.25]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[40, 60, 20]} intensity={2.4} color="#fff1d6" />
      <Terrain />
      <River />
      <Stops />
      {!reduce && <Snowfall />}
      <Rig reduce={reduce} />
    </Canvas>
  );
}

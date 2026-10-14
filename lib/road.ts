import "server-only";
import { unstable_cache } from "next/cache";
import { getRoad } from "@/lib/data";
import { getForecasts, type Forecast } from "@/lib/weather";
import type { LatLon, RoadReading, RoadSegment, RoadStatus } from "@/lib/types";

/**
 * Automatic road status for the N-15.
 *
 * Google has no public feed of road closures, so each segment is checked three ways:
 *  1. Google Maps Routes API (when GOOGLE_MAPS_API_KEY is set): live driving time vs. normal time,
 *     and whether Google has to detour around the segment (a sign it is blocked).
 *  2. Open-Meteo forecast at both ends: snow, heavy rain, thunderstorms.
 *  3. Season: high passes (Babusar) are treated as closed outside their open months.
 * Staff can override any segment from Admin → Road status; an override wins until it expires.
 */

const KEY = process.env.GOOGLE_MAPS_API_KEY;
export const googleConnected = Boolean(KEY);

export type GoogleRoute = { km: number; etaMin: number; normalMin: number } | { noRoute: true };
export type AutoResult = { status: RoadStatus; note: string; google?: GoogleRoute; snowCm?: number; rainMm?: number };
export type RoadLive = RoadReading & { auto?: AutoResult; manualActive: boolean };

const secs = (d?: string) => (d ? Number(d.replace("s", "")) : 0);

async function fetchRoute(from: LatLon, to: LatLon): Promise<GoogleRoute> {
  const res = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
    method: "POST",
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": KEY!,
      "X-Goog-FieldMask": "routes.duration,routes.staticDuration,routes.distanceMeters",
    },
    body: JSON.stringify({
      origin: { location: { latLng: { latitude: from.lat, longitude: from.lon } } },
      destination: { location: { latLng: { latitude: to.lat, longitude: to.lon } } },
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
    }),
  });
  // throwing keeps failures out of the cache, so the next request retries
  if (!res.ok) throw new Error(`Routes API ${res.status}`);
  const r = (await res.json()).routes?.[0];
  if (!r) return { noRoute: true };
  return { km: r.distanceMeters / 1000, etaMin: Math.round(secs(r.duration) / 60), normalMin: Math.round(secs(r.staticDuration) / 60) };
}

// one Google request per segment per hour (~3,600 a month for 5 segments)
const cachedRoute = unstable_cache(fetchRoute, ["google-route-v1"], { revalidate: 3600 });

async function googleRoute(from: LatLon, to: LatLon): Promise<GoogleRoute | undefined> {
  if (!KEY) return undefined;
  try {
    return await cachedRoute(from, to);
  } catch (e) {
    console.error("[road] Google route check failed:", e);
    return undefined;
  }
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthInPakistan = () => Number(new Intl.DateTimeFormat("en", { month: "numeric", timeZone: "Asia/Karachi" }).format(new Date()));

export function assess(seg: RoadSegment, google: GoogleRoute | undefined, wx: Forecast[], month = monthInPakistan()): AutoResult | undefined {
  const snowCm = Math.max(0, ...wx.map((w) => w.snowTodayCm ?? 0));
  const rainMm = Math.max(0, ...wx.map((w) => w.rainTodayMm ?? 0));
  const storm = wx.some((w) => (w.code ?? 0) >= 95);
  const base = { google, snowCm, rainMm };

  if (seg.openMonths?.length && !seg.openMonths.includes(month)) {
    const m = [...seg.openMonths].sort((a, b) => a - b);
    return { ...base, status: "seasonal", note: `Closed for winter. Usually open ${MONTHS[m[0] - 1]} to ${MONTHS[m[m.length - 1] - 1]}.` };
  }
  if (google && "noRoute" in google) return { ...base, status: "closed", note: "Google Maps finds no drivable route. Likely blocked." };
  if (google && seg.normalKm && google.km > seg.normalKm * 1.6) {
    return { ...base, status: "closed", note: `Google Maps is routing around this section (${Math.round(google.km)} km instead of ~${seg.normalKm} km). Likely blocked.` };
  }

  const warnings: string[] = [];
  if (snowCm >= 15) warnings.push(`Heavy snow forecast today (${Math.round(snowCm)} cm). 4x4 or chains advised`);
  else if (snowCm >= 2) warnings.push(`Snow today (${Math.round(snowCm)} cm). Drive carefully`);
  if (rainMm >= 25 || storm) warnings.push("Heavy rain or storms. Landslide risk");
  if (google && google.etaMin > google.normalMin * 1.5 && google.etaMin - google.normalMin >= 15) {
    warnings.push(`Slow traffic: about ${google.etaMin} min (normally ${google.normalMin})`);
  }
  if (warnings.length) return { ...base, status: "caution", note: warnings.join(" · ") };

  const anyWeather = wx.some((w) => w.code !== undefined);
  if (!google && !anyWeather) return undefined; // nothing to go on
  return { ...base, status: "open", note: google ? `About ${google.etaMin} min drive. Traffic normal.` : seg.note || "No weather warnings." };
}

const manualActive = (s: RoadSegment) => s.mode === "manual" && (!s.manualUntil || new Date(s.manualUntil).getTime() > Date.now());

/** Every segment resolved to what visitors should see, plus the automatic reading for admins. */
export async function getRoadLive(): Promise<RoadLive[]> {
  const road = await getRoad();
  const checkable = road.filter((s) => s.from && s.to);
  const [routes, wx] = await Promise.all([
    Promise.all(checkable.map((s) => googleRoute(s.from!, s.to!))),
    getForecasts(checkable.flatMap((s) => [s.from!, s.to!])),
  ]);
  const now = new Date().toISOString();
  return road.map((s) => {
    const i = checkable.indexOf(s);
    const auto = i >= 0 ? assess(s, routes[i], [wx[i * 2], wx[i * 2 + 1]]) : undefined;
    const manual = manualActive(s);
    const google = auto?.google && !("noRoute" in auto.google) ? auto.google : undefined;
    if (manual || !auto) {
      return { id: s.id, segment: s.segment, status: s.status, note: s.note, source: manual ? "manual" : "fallback", checkedAt: s.updatedAt, auto, manualActive: manual };
    }
    return { id: s.id, segment: s.segment, status: auto.status, note: auto.note, source: "auto", checkedAt: now, etaMin: google?.etaMin, normalMin: google?.normalMin, auto, manualActive: false };
  });
}

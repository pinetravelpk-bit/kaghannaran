import "server-only";
import { WEATHER_POINTS } from "@/lib/seed";

export type WeatherNow = {
  slug: string;
  name: string;
  alt: number;
  temp?: number;
  code?: number;
  wind?: number;
  days?: { date: string; max: number; min: number; code: number }[];
};

/** Live weather from Open-Meteo (free, no API key). Cached for 30 minutes. */
export async function getWeather(): Promise<WeatherNow[]> {
  const lat = WEATHER_POINTS.map((p) => p.lat).join(",");
  const lon = WEATHER_POINTS.map((p) => p.lon).join(",");
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=4&timezone=Asia%2FKarachi`;
  try {
    const res = await fetch(url, { next: { revalidate: 1800 }, signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error(String(res.status));
    const json = await res.json();
    const arr = Array.isArray(json) ? json : [json];
    return WEATHER_POINTS.map((p, i) => {
      const w = arr[i];
      return {
        ...p,
        temp: w?.current?.temperature_2m,
        code: w?.current?.weather_code,
        wind: w?.current?.wind_speed_10m,
        days: w?.daily?.time?.map((t: string, j: number) => ({
          date: t, max: w.daily.temperature_2m_max[j], min: w.daily.temperature_2m_min[j], code: w.daily.weather_code[j],
        })),
      };
    });
  } catch {
    return WEATHER_POINTS.map((p) => ({ ...p }));
  }
}

export function weatherLabel(code?: number): string {
  if (code === undefined) return "—";
  if (code === 0) return "Clear";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Fog";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Showers";
  if (code <= 86) return "Snow showers";
  return "Thunderstorm";
}

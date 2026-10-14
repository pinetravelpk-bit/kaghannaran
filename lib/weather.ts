import "server-only";
import { getWeatherAreas } from "@/lib/data";
import type { LatLon, WeatherArea } from "@/lib/types";

export type Forecast = {
  temp?: number;
  code?: number;
  wind?: number;
  snowTodayCm?: number;
  rainTodayMm?: number;
  days?: { date: string; max: number; min: number; code: number }[];
};

export type WeatherNow = Forecast & {
  slug: string;
  name: string;
  alt: number;
  onHome: boolean;
  label: string; // condition text, or the staff override
  overridden: boolean;
  advisory: string;
  advisoryLevel: WeatherArea["advisoryLevel"];
};

/** Live forecasts from Open-Meteo (free, no API key) for any list of points. Cached for 30 minutes. */
export async function getForecasts(points: LatLon[]): Promise<Forecast[]> {
  if (!points.length) return [];
  const lat = points.map((p) => p.lat).join(",");
  const lon = points.map((p) => p.lon).join(",");
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code,snowfall_sum,precipitation_sum&forecast_days=4&timezone=Asia%2FKarachi`;
  try {
    const res = await fetch(url, { next: { revalidate: 1800 }, signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(String(res.status));
    const json = await res.json();
    const arr = Array.isArray(json) ? json : [json];
    return points.map((_, i) => {
      const w = arr[i];
      return {
        temp: w?.current?.temperature_2m,
        code: w?.current?.weather_code,
        wind: w?.current?.wind_speed_10m,
        snowTodayCm: w?.daily?.snowfall_sum?.[0],
        rainTodayMm: w?.daily?.precipitation_sum?.[0],
        days: w?.daily?.time?.map((t: string, j: number) => ({
          date: t, max: w.daily.temperature_2m_max[j], min: w.daily.temperature_2m_min[j], code: w.daily.weather_code[j],
        })),
      };
    });
  } catch {
    return points.map(() => ({}));
  }
}

const active = (until?: string) => !until || new Date(until).getTime() > Date.now();

/** Weather for every area, with any unexpired staff override applied on top of the live reading. */
export async function getWeather(): Promise<WeatherNow[]> {
  const areas = await getWeatherAreas();
  const live = await getForecasts(areas);
  return areas.map((a, i) => {
    const f = live[i];
    const hasOverride = (a.overrideLabel || a.overrideTemp !== undefined) && active(a.overrideUntil);
    return {
      ...f,
      slug: a.slug, name: a.name, alt: a.alt, onHome: a.onHome, advisory: a.advisory, advisoryLevel: a.advisoryLevel,
      temp: hasOverride && a.overrideTemp !== undefined ? a.overrideTemp : f.temp,
      label: hasOverride && a.overrideLabel ? a.overrideLabel : weatherLabel(f.code),
      overridden: !!hasOverride,
    };
  });
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

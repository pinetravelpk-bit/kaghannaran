import { getRoadLive } from "@/lib/road";
import { getWeather } from "@/lib/weather";

export const revalidate = 600;

/** Live N-15 road status and weather as JSON, for apps and AI agents. */
export async function GET() {
  const [road, weather] = await Promise.all([getRoadLive(), getWeather()]);
  return Response.json(
    {
      generatedAt: new Date().toISOString(),
      road: road.map(({ auto: _a, manualActive: _m, ...r }) => r),
      weather: weather.map((w) => ({ area: w.name, altitudeM: w.alt, tempC: w.temp, conditions: w.label, windKmh: w.wind, snowTodayCm: w.snowTodayCm, advisory: w.advisory || undefined, forecast: w.days })),
      source: "https://kaghannaran.com/road",
    },
    { headers: { "Access-Control-Allow-Origin": "*" } },
  );
}

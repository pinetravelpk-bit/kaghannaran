import { getWeatherAreas } from "@/lib/data";
import { getForecasts, weatherLabel } from "@/lib/weather";
import { AdminHeader } from "@/components/admin/ui";
import { WeatherEditor, type LiveView } from "@/components/admin/WeatherEditor";

export const metadata = { title: "Weather" };
export const dynamic = "force-dynamic";

export default async function WeatherAdmin() {
  const areas = await getWeatherAreas();
  const forecasts = await getForecasts(areas);
  const live: Record<string, LiveView> = Object.fromEntries(areas.map((a, i) => [a.slug, { temp: forecasts[i]?.temp, label: weatherLabel(forecasts[i]?.code) }]));
  return (
    <>
      <AdminHeader title="Weather" sub="Live forecasts come from Open-Meteo for every area. Add any area, post an advisory, or override the conditions with a local report. Up to 4 areas marked “On home page” appear on the home board." />
      <WeatherEditor initial={areas} live={live} />
    </>
  );
}

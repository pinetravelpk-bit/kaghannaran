import { getStops, getTrails } from "@/lib/data";
import { stopGeo, stopPoint } from "@/lib/geo";
import { abs } from "@/lib/seo";

export const revalidate = 3600;

/** Every stop on the N-15 with coordinates, height, road distance and places to visit, as JSON. */
export async function GET() {
  const [stops, trails] = await Promise.all([getStops(), getTrails()]);
  return Response.json(
    {
      stops: stops.map((s) => {
        const g = stopGeo(s.slug), p = stopPoint(s.slug);
        return {
          slug: s.slug, name: s.name, nameUrdu: s.nameUr, kind: s.kind, sideTrip: !!s.sideTrip, description: s.desc, url: abs(`/places/${s.slug}`),
          lat: p?.lat, lon: p?.lon, heightM: s.altitude ?? g?.ele, kmFromBalakot: g ? Math.round(g.km) : undefined,
          places: s.places, trails: trails.filter((t) => t.stop === s.slug),
        };
      }),
    },
    { headers: { "Access-Control-Allow-Origin": "*" } },
  );
}

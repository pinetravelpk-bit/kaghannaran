import { photoUri, placesEnabled } from "@/lib/places";
import { isKnownPlace } from "@/lib/known-places";

export const dynamic = "force-dynamic";

/** Redirects to the Google-hosted image for a photo reference. The API key never reaches the browser. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const name = url.searchParams.get("name") ?? "";
  const w = Math.min(1600, Math.max(200, Number(url.searchParams.get("w")) || 800));
  const m = name.match(/^places\/(ChIJ[A-Za-z0-9_-]+)\/photos\/[A-Za-z0-9_-]+$/);
  if (!placesEnabled || !m || !(await isKnownPlace(m[1]))) return new Response("Not found", { status: 404 });
  try {
    const uri = await photoUri(name, w);
    if (!uri) return new Response("Not found", { status: 404 });
    return new Response(null, { status: 302, headers: { Location: uri, "Cache-Control": "private, max-age=3600" } });
  } catch (e) {
    console.error("[photos/media]", e);
    return new Response("Photo unavailable", { status: 502 });
  }
}

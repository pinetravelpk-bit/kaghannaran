import "server-only";
import type { Listing } from "@/lib/types";

/**
 * Hotel photos from the Google Places API (New), shown live with Google's required attribution.
 * Nothing is stored: every page view asks Google for the current photo list, and images load
 * straight from Google. The API key stays on the server. Set GOOGLE_PLACES_API_KEY (or reuse
 * GOOGLE_MAPS_API_KEY) with the "Places API (New)" enabled to switch this on.
 */
const KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
export const placesEnabled = Boolean(KEY);

/** Google place ID from a Maps link (the "!19sChIJ..." part), if the listing has one. */
export const placeIdOf = (l: Pick<Listing, "attributes">) =>
  typeof l.attributes.mapsUrl === "string" ? l.attributes.mapsUrl.match(/!19s(ChIJ[A-Za-z0-9_-]+)/)?.[1] : undefined;

export type PlacePhoto = { name: string; width: number; height: number; author?: string; authorUri?: string };

/** Photo references and their authors for one place (Place Details, photos field only). */
export async function placePhotos(placeId: string, max = 6): Promise<PlacePhoto[]> {
  if (!KEY) return [];
  const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
    headers: { "X-Goog-Api-Key": KEY, "X-Goog-FieldMask": "photos" },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Places API ${res.status}`);
  const j = await res.json();
  return (j.photos ?? []).slice(0, max).map((p: any) => ({
    name: p.name, width: p.widthPx, height: p.heightPx,
    author: p.authorAttributions?.[0]?.displayName, authorUri: p.authorAttributions?.[0]?.uri,
  }));
}

/** Short-lived Google-hosted image URL for a photo reference. */
export async function photoUri(name: string, maxWidth: number) {
  if (!KEY) return undefined;
  const res = await fetch(`https://places.googleapis.com/v1/${name}/media?maxWidthPx=${maxWidth}&skipHttpRedirect=true`, {
    headers: { "X-Goog-Api-Key": KEY },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Places photo ${res.status}`);
  return (await res.json()).photoUri as string | undefined;
}

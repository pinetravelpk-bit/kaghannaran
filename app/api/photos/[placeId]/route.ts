import { placePhotos, placesEnabled } from "@/lib/places";
import { isKnownPlace } from "@/lib/known-places";

export const dynamic = "force-dynamic";

/** Photo list for one listed place, with author credits, from Google Places. */
export async function GET(_: Request, { params }: { params: Promise<{ placeId: string }> }) {
  const { placeId } = await params;
  if (!placesEnabled || !/^ChIJ[A-Za-z0-9_-]+$/.test(placeId) || !(await isKnownPlace(placeId))) {
    return Response.json({ photos: [] }, { status: 404 });
  }
  try {
    const photos = await placePhotos(placeId);
    return Response.json(
      { photos: photos.map((p) => ({ src: `/api/photos/media?name=${encodeURIComponent(p.name)}`, width: p.width, height: p.height, author: p.author, authorUri: p.authorUri })) },
      { headers: { "Cache-Control": "private, max-age=3600" } },
    );
  } catch (e) {
    console.error("[photos]", e);
    return Response.json({ photos: [] }, { status: 502 });
  }
}

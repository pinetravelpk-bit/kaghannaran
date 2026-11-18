import "server-only";
import { getListings } from "@/lib/data";
import { placeIdOf } from "@/lib/places";

/** Only places that belong to an approved listing may be looked up, so the key can't be used for anything else. */
export async function isKnownPlace(placeId: string) {
  const listings = await getListings();
  return listings.some((l) => placeIdOf(l) === placeId);
}

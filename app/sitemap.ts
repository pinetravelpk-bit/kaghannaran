import type { MetadataRoute } from "next";
import { getListings, getStops } from "@/lib/data";
import { isDemo } from "@/lib/supabase/config";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/places", "/directory", "/trails", "/road", "/community", "/list-your-business", "/credits", "/privacy"];
  const stops = await getStops();
  // sample listings are not real businesses, so keep them out of search engines
  const listings = isDemo ? [] : await getListings({ status: "approved" });
  return [
    ...pages.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "daily" as const, priority: p ? 0.8 : 1 })),
    ...stops.map((s) => ({ url: `${SITE_URL}/places/${s.slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...listings.map((l) => ({ url: `${SITE_URL}/listing/${l.slug}`, changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}

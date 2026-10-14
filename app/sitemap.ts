import type { MetadataRoute } from "next";
import { getBusinessTypes, getListings, getStops } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [stops, listings, types] = await Promise.all([getStops(), getListings({ status: "approved" }), getBusinessTypes()]);
  const pages: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
    ["", 1, "hourly"], ["/road", 0.9, "hourly"], ["/places", 0.8, "weekly"], ["/directory", 0.8, "daily"], ["/trails", 0.7, "monthly"],
    ["/community", 0.5, "daily"], ["/list-your-business", 0.5, "monthly"], ["/credits", 0.2, "yearly"], ["/privacy", 0.2, "yearly"],
  ];
  return [
    ...pages.map(([p, priority, changeFrequency]) => ({ url: `${SITE_URL}${p}`, lastModified: now, changeFrequency, priority })),
    ...stops.map((s) => ({ url: `${SITE_URL}/places/${s.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8, ...(s.image ? { images: [s.image] } : {}) })),
    ...types.filter((t) => listings.some((l) => l.type === t.slug)).map((t) => ({ url: `${SITE_URL}/directory?type=${t.slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.6 })),
    ...listings.map((l) => ({ url: `${SITE_URL}/listing/${l.slug}`, lastModified: new Date(l.updatedAt), changeFrequency: "weekly" as const, priority: 0.6, ...(l.image ? { images: [l.image] } : {}) })),
  ];
}

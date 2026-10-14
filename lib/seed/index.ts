import type { ActivityItem, EventItem, Job, Listing, ListingStatus, Profile, RoadSegment, SiteSettings, Trail, WeatherArea } from "@/lib/types";
import { photo } from "@/lib/media";
import { getType } from "./business-types";

export * from "./stops";
export * from "./business-types";

export const TRAILS: Trail[] = [
  { slug: "kiwai-shogran", name: "Kiwai → Shogran", mode: "Jeep", from: "Kiwai village", time: "≈ 8 km · steep", stop: "kiwai" },
  { slug: "shogran-paye", name: "Shogran → Paye Meadows", mode: "Jeep", from: "Shogran", time: "≈ 45 min", stop: "shogran" },
  { slug: "paye-makra", name: "Paye → Makra Peak", mode: "Hike", from: "Paye Meadows", time: "≈ 3.5 hrs · 10 km", stop: "shogran" },
  { slug: "paras-sharan", name: "Paras → Sharan Forest", mode: "Jeep", from: "Paras", time: "≈ 45 min", stop: "paras-sharan" },
  { slug: "sharan-manshi", name: "Sharan → Manshi Top", mode: "Hike", from: "Sharan", time: "3 to 4 hrs", stop: "paras-sharan" },
  { slug: "musa-ka-musalla", name: "Sharan → Musa ka Musalla", mode: "Trek", from: "Sharan", time: "2 to 3 days", stop: "paras-sharan" },
  { slug: "danna-meadows", name: "Khanian → Danna Meadows", mode: "Hike", from: "Khanian", time: "2 to 6 hrs", stop: "khanian" },
  { slug: "maidan-meadows", name: "Kaghan → Maidan Meadows", mode: "Jeep", from: "Kaghan Bazaar", time: "Risky track", stop: "kaghan" },
  { slug: "shingri-top", name: "Kaghan → Shingri Top", mode: "Walk", from: "Kaghan", time: "≈ 2 km", stop: "kaghan" },
  { slug: "saif-ul-malook", name: "Naran → Saif-ul-Malook", mode: "Jeep", from: "Naran", time: "Jeeps from town", stop: "naran" },
  { slug: "ansoo-lake", name: "Saif-ul-Malook → Ansoo Lake", mode: "Hike", from: "Saif-ul-Malook", time: "≈ 10 hrs return", stop: "naran" },
  { slug: "lalazar", name: "Batakundi → Lalazar", mode: "Jeep", from: "Batakundi", time: "≈ 30 min", stop: "batakundi" },
  { slug: "noori-top", name: "Jalkhad → Noori Top → Sharda", mode: "Jeep", from: "Jalkhad", time: "Daylight only", stop: "jalkhad" },
  { slug: "dudipatsar", name: "Besal → Dudipatsar Lake", mode: "Trek", from: "Moon Restaurant, Besal", time: "≈ 8 hrs + 2 hrs", stop: "besal" },
  { slug: "dharamsar", name: "N-15 → Dharamsar Lake", mode: "Jeep", from: "Near Babusar Top", time: "1.5 to 3 hrs", stop: "babusar-top" },
  { slug: "sambaksar", name: "Dharamsar → Sambaksar Lake", mode: "Hike", from: "Dharamsar", time: "≈ 1 hr", stop: "babusar-top" },
];

const d = (daysAgo: number, h = 10) => {
  const t = new Date("2026-10-14T00:00:00+05:00");
  t.setDate(t.getDate() - daysAgo);
  t.setHours(h);
  return t.toISOString();
};

export const ROAD_SEGMENTS: RoadSegment[] = [
  { id: "r1", segment: "Balakot → Kiwai", note: "Riverside stretch along the Kunhar", status: "open", updatedAt: d(0, 8), mode: "auto", from: { lat: 34.548, lon: 73.351 }, to: { lat: 34.676, lon: 73.452 }, normalKm: 24 },
  { id: "r2", segment: "Kiwai → Kaghan → Naran", note: "Main N-15 section", status: "open", updatedAt: d(0, 8), mode: "auto", from: { lat: 34.676, lon: 73.452 }, to: { lat: 34.909, lon: 73.651 }, normalKm: 59 },
  { id: "r3", segment: "Naran → Batakundi", note: "Roadside waterfalls cross the road in places. Drive slowly", status: "open", updatedAt: d(0, 9), mode: "auto", from: { lat: 34.909, lon: 73.651 }, to: { lat: 34.948, lon: 73.737 }, normalKm: 16 },
  { id: "r4", segment: "Batakundi → Babusar Top", note: "Via Besal ford and Lulusar Lake", status: "seasonal", updatedAt: d(1, 17), mode: "auto", from: { lat: 34.948, lon: 73.737 }, to: { lat: 35.149, lon: 74.036 }, normalKm: 55, openMonths: [6, 7, 8, 9, 10] },
  { id: "r5", segment: "Babusar Top → Chilas", note: "Steep descent, check before going", status: "seasonal", updatedAt: d(1, 17), mode: "auto", from: { lat: 35.149, lon: 74.036 }, to: { lat: 35.42, lon: 74.094 }, normalKm: 40, openMonths: [6, 7, 8, 9, 10] },
];

/** Weather areas (coordinates approximate) used with the free Open-Meteo API. Staff can edit these in Admin → Weather. */
const wa = (slug: string, name: string, lat: number, lon: number, alt: number, sort: number, onHome = false): WeatherArea =>
  ({ slug, name, lat, lon, alt, sort, onHome, advisory: "", advisoryLevel: "info" });
export const WEATHER_AREAS: WeatherArea[] = [
  wa("balakot", "Balakot", 34.548, 73.351, 980, 0, true),
  wa("kiwai", "Kiwai", 34.676, 73.452, 1450, 1),
  wa("shogran", "Shogran", 34.637, 73.468, 2360, 2),
  wa("kaghan", "Kaghan", 34.778, 73.523, 2050, 3, true),
  wa("naran", "Naran", 34.909, 73.651, 2400, 4, true),
  wa("saif-ul-malook", "Saif-ul-Malook", 34.877, 73.693, 3224, 5),
  wa("batakundi", "Batakundi", 34.948, 73.737, 2700, 6),
  wa("lulusar", "Lulusar Lake", 35.081, 73.94, 3410, 7),
  { ...wa("babusar-top", "Babusar Top", 35.149, 74.036, 4173, 8, true), advisory: "Pass closes for winter, usually from November. Carry warm clothes even in summer.", advisoryLevel: "warning" },
];

type Seed = Omit<Listing, "checklist" | "history" | "documents" | "slug" | "updatedAt" | "submittedAt"> & { daysAgo: number };

const mk = (s: Seed): Listing => {
  const type = getType(s.type)!;
  const checklist = Object.fromEntries(type.checklist.map((c, i) => [c, s.status === "approved" ? true : s.status === "pending" ? i < 1 : i < 2]));
  const history: Listing["history"] = [{ id: s.id + "-h1", at: d(s.daysAgo, 11), by: s.ownerName, action: "submitted" }];
  if (s.status === "approved") history.push({ id: s.id + "-h2", at: d(Math.max(0, s.daysAgo - 1), 15), by: "Moderator", action: "approved", note: "All documents verified." });
  if (s.status === "changes_requested") history.push({ id: s.id + "-h2", at: d(Math.max(0, s.daysAgo - 1), 15), by: "Moderator", action: "changes_requested", note: "Please upload clearer photos of the rooms and a CNIC back side." });
  if (s.status === "rejected") history.push({ id: s.id + "-h2", at: d(Math.max(0, s.daysAgo - 1), 15), by: "Moderator", action: "rejected", note: "Phone number did not answer after 3 attempts; location could not be confirmed." });
  if (s.status === "suspended") history.push({ id: s.id + "-h2", at: d(Math.max(0, s.daysAgo - 2), 15), by: "Admin", action: "approved" }, { id: s.id + "-h3", at: d(1, 12), by: "Admin", action: "suspended", note: "Multiple traveller complaints about overcharging. Under review." });
  return {
    ...s,
    slug: s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    documents: type.documents.map((doc) => ({ key: doc.key, label: doc.label, fileName: `${doc.key}-${s.id}.jpg` })),
    checklist,
    history,
    submittedAt: d(s.daysAgo, 11),
    updatedAt: d(Math.max(0, s.daysAgo - 1), 15),
  };
};

/**
 * Built-in directory entries: verified public emergency and help numbers that cover the whole valley.
 * Each one links to the public source it was checked against (attributes.source, checked October 2026).
 * Businesses (hotels, restaurants, jeeps, guides) are added by their owners and approved by staff.
 */
const TEAM = { ownerName: "Kaghan Naran team", ownerEmail: "", status: "approved" as const, verified: true, daysAgo: 1 };
const VALLEY = "Valley-wide, Mansehra District, Khyber Pakhtunkhwa";
export const LISTINGS: Listing[] = [
  mk({ ...TEAM, id: "kp-911", type: "govt", name: "Pakhtunkhwa Emergency Helpline 911", phone: "911", stop: "", address: VALLEY,
    description: "Khyber Pakhtunkhwa's single emergency number, live since July 2026. One call reaches the police, Rescue 1122, tourist assistance and disaster response, 24 hours a day.",
    attributes: { department: "KP Home and Tribal Affairs", source: "https://www.zameen.com/news/kp-rolls-out-911-emergency-response-service.html" } }),
  mk({ ...TEAM, id: "rescue-1122", type: "health", name: "Rescue 1122 Mansehra", phone: "1122", stop: "", address: VALLEY,
    description: "Free 24-hour ambulance and rescue service. Rescue 1122 Mansehra teams cover Balakot, Kaghan, Naran and the N-15 for road accidents, landslides and floods.",
    attributes: { emergency: true, source: "https://www.app.com.pk/?p=1252983" } }),
  mk({ ...TEAM, id: "police-15", type: "police", name: "Police Emergency 15", phone: "15", stop: "", address: VALLEY,
    description: "Police emergency number, free from any phone in Pakistan. In the valley, calls are handled by Mansehra District Police.",
    attributes: { kind: "Police station" } }),
  mk({ ...TEAM, id: "kp-tourism-1422", type: "govt", name: "KP Tourist Helpline 1422", phone: "1422", stop: "", address: VALLEY,
    description: "Toll-free tourist helpline of the Khyber Pakhtunkhwa Culture and Tourism Authority, run by the Tourist Facilitation Hub. Ask about road and weather conditions, places to visit and help in an emergency.",
    attributes: { department: "KP Culture and Tourism Authority", source: "https://propakistani.pk/2021/08/17/kp-tourism-dept-activates-24-7-helpline-1422-for-emergencies/" } }),
  mk({ ...TEAM, id: "pdma-1700", type: "govt", name: "PDMA Khyber Pakhtunkhwa Helpline 1700", phone: "1700", stop: "", address: VALLEY,
    description: "Provincial Disaster Management Authority helpline for floods, landslides and heavy snow. The emergency operations centre can also be reached on 091-9219635.",
    attributes: { department: "Provincial Disaster Management Authority", source: "https://www.pdma.gov.pk" } }),
  mk({ ...TEAM, id: "nhmp-130", type: "police", name: "Motorway Police Helpline 130", phone: "130", stop: "", address: "Hazara Motorway and national highways",
    description: "National Highways and Motorway Police helpline for accidents, breakdowns and route information on the motorway and highways to the valley. Calls are free.",
    attributes: { kind: "Check post", source: "https://pta.gov.pk/category/motorway-helpline-calls-made-free-983111816-2023-06-01" } }),
  mk({ ...TEAM, id: "edhi-115", type: "health", name: "Edhi Ambulance 115", phone: "115", stop: "", address: "Nationwide",
    description: "Edhi Foundation's nationwide ambulance service, a second option if Rescue 1122 is busy.",
    attributes: { emergency: true, source: "https://edhi.org" } }),
];

export const EVENTS: EventItem[] = [
  { id: "babusar-opening", title: "Babusar Pass season opening", where: "Babusar Top", stop: "babusar-top", description: "The pass usually reopens in June once snow is cleared. The date is announced by the highway authority each year, so follow the road status page.", status: "approved" },
];

// Jobs, accounts and the activity log come from the database once Supabase is connected.
export const JOBS: Job[] = [];
export const PROFILES: Profile[] = [];
export const ACTIVITY: ActivityItem[] = [];

export const DEFAULT_SETTINGS: SiteSettings = {
  alertBanner: "Babusar Top is a seasonal pass. Check road status before driving beyond Batakundi.",
  heroVideoUrl: "",
  emergencyNumbers: [
    { label: "Emergency", number: "911" },
    { label: "Rescue", number: "1122" },
    { label: "Police", number: "15" },
    { label: "Tourist help", number: "1422" },
  ],
  autoPublishEvents: false,
  requireDocsForGuides: true,
};

export const STATUS_LABEL: Record<ListingStatus, string> = {
  draft: "Draft",
  pending: "Pending review",
  changes_requested: "Changes requested",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
};

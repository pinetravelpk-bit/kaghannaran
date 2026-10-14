import type { ActivityItem, EventItem, Job, Listing, ListingStatus, Profile, RoadSegment, SiteSettings, Trail } from "@/lib/types";
import { photo } from "@/lib/media";
import { getType } from "./business-types";

export * from "./stops";
export * from "./business-types";

export const TRAILS: Trail[] = [
  { slug: "kiwai-shogran", name: "Kiwai → Shogran", mode: "Jeep", from: "Kiwai village", time: "≈ 8 km · steep", stop: "kiwai" },
  { slug: "shogran-paye", name: "Shogran → Paye Meadows", mode: "Jeep", from: "Shogran", time: "≈ 45 min", stop: "shogran" },
  { slug: "paye-makra", name: "Paye → Makra Peak", mode: "Hike", from: "Paye Meadows", time: "≈ 3.5 hrs · 10 km", stop: "shogran" },
  { slug: "paras-sharan", name: "Paras → Sharan Forest", mode: "Jeep", from: "Paras", time: "≈ 45 min", stop: "paras-sharan" },
  { slug: "sharan-manshi", name: "Sharan → Manshi Top", mode: "Hike", from: "Sharan", time: "3–4 hrs", stop: "paras-sharan" },
  { slug: "musa-ka-musalla", name: "Sharan → Musa ka Musalla", mode: "Trek", from: "Sharan", time: "2–3 days", stop: "paras-sharan" },
  { slug: "danna-meadows", name: "Khanian → Danna Meadows", mode: "Hike", from: "Khanian", time: "2–6 hrs", stop: "khanian" },
  { slug: "maidan-meadows", name: "Kaghan → Maidan Meadows", mode: "Jeep", from: "Kaghan Bazaar", time: "Risky track", stop: "kaghan" },
  { slug: "shingri-top", name: "Kaghan → Shingri Top", mode: "Walk", from: "Kaghan", time: "≈ 2 km", stop: "kaghan" },
  { slug: "saif-ul-malook", name: "Naran → Saif-ul-Malook", mode: "Jeep", from: "Naran", time: "Jeeps from town", stop: "naran" },
  { slug: "ansoo-lake", name: "Saif-ul-Malook → Ansoo Lake", mode: "Hike", from: "Saif-ul-Malook", time: "≈ 10 hrs return", stop: "naran" },
  { slug: "lalazar", name: "Batakundi → Lalazar", mode: "Jeep", from: "Batakundi", time: "≈ 30 min", stop: "batakundi" },
  { slug: "noori-top", name: "Jalkhad → Noori Top → Sharda", mode: "Jeep", from: "Jalkhad", time: "Daylight only", stop: "jalkhad" },
  { slug: "dudipatsar", name: "Besal → Dudipatsar Lake", mode: "Trek", from: "Moon Restaurant, Besal", time: "≈ 8 hrs + 2 hrs", stop: "besal" },
  { slug: "dharamsar", name: "N-15 → Dharamsar Lake", mode: "Jeep", from: "Near Babusar Top", time: "1.5–3 hrs", stop: "babusar-top" },
  { slug: "sambaksar", name: "Dharamsar → Sambaksar Lake", mode: "Hike", from: "Dharamsar", time: "≈ 1 hr", stop: "babusar-top" },
];

const d = (daysAgo: number, h = 10) => {
  const t = new Date("2026-10-14T00:00:00+05:00");
  t.setDate(t.getDate() - daysAgo);
  t.setHours(h);
  return t.toISOString();
};

export const ROAD_SEGMENTS: RoadSegment[] = [
  { id: "r1", segment: "Balakot → Kiwai", note: "Riverside stretch along the Kunhar", status: "open", updatedAt: d(0, 8) },
  { id: "r2", segment: "Kiwai → Kaghan → Naran", note: "Main N-15 section", status: "open", updatedAt: d(0, 8) },
  { id: "r3", segment: "Naran → Batakundi", note: "Kiswah waterfall runs across the road. Drive slowly", status: "caution", updatedAt: d(0, 9) },
  { id: "r4", segment: "Batakundi → Babusar Top", note: "Via Besal ford and Lulusar Lake", status: "seasonal", updatedAt: d(1, 17) },
  { id: "r5", segment: "Babusar Top → Chilas", note: "Steep descent, check before going", status: "seasonal", updatedAt: d(1, 17) },
];

/** Weather points (coordinates approximate) used with the free Open-Meteo API. */
export const WEATHER_POINTS = [
  { slug: "balakot", name: "Balakot", lat: 34.548, lon: 73.351, alt: 980 },
  { slug: "kaghan", name: "Kaghan", lat: 34.778, lon: 73.523, alt: 2050 },
  { slug: "naran", name: "Naran", lat: 34.909, lon: 73.651, alt: 2400 },
  { slug: "babusar-top", name: "Babusar Top", lat: 35.149, lon: 74.036, alt: 4173 },
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

/** SAMPLE listings for demo mode only. These are not real businesses. */
export const SAMPLE_LISTINGS: Listing[] = [
  mk({ id: "l1", type: "hotel", name: "Kunhar View Hotel", ownerName: "Sample Owner A", ownerEmail: "owner.a@example.com", phone: "0300-0000001", whatsapp: "0300-0000001", stop: "naran", address: "Main Bazaar, Naran", description: "Riverside rooms with heating and hot water, five minutes from the Saif-ul-Malook jeep stand.", priceFrom: 9000, status: "approved", featured: true, verified: true, rating: 4.6, reviews: 128, image: photo("naranNight", 900), attributes: { rooms: 32, amenities: ["Parking", "Hot water", "Heating", "Wi-Fi", "River view"], season: "Summer only (May–Oct)" }, daysAgo: 40 }),
  mk({ id: "l2", type: "guest-house", name: "Pine Lane Guest House", ownerName: "Sample Owner B", ownerEmail: "owner.b@example.com", phone: "0300-0000002", stop: "shogran", address: "Shogran", description: "Family-run guest house in the forest with home-cooked meals.", priceFrom: 6000, status: "approved", verified: true, rating: 4.8, reviews: 54, image: photo("shogran", 900), attributes: { rooms: 6, meals: true }, daysAgo: 30 }),
  mk({ id: "l3", type: "jeep-operator", name: "Saif Lake Jeep Service", ownerName: "Sample Driver C", ownerEmail: "driver.c@example.com", phone: "0300-0000003", stop: "naran", address: "Jeep stand, Naran", description: "Registered 4x4 jeeps to Saif-ul-Malook and Lalazar, daily from 7 am.", priceFrom: 7000, status: "approved", featured: true, verified: true, rating: 4.5, reviews: 210, image: photo("jeeps", 900), attributes: { vehicles: 4, vehicleModel: "Willys 4x4", routes: ["Naran → Saif-ul-Malook", "Batakundi → Lalazar"], seats: 6 }, daysAgo: 60 }),
  mk({ id: "l4", type: "tour-guide", name: "Guide: Sample Guide D", ownerName: "Sample Guide D", ownerEmail: "guide.d@example.com", phone: "0300-0000004", stop: "naran", address: "Naran", description: "Trek leader for Ansoo Lake and Dudipatsar, 9 seasons. First-aid trained.", priceFrom: 5000, status: "approved", verified: true, rating: 4.9, reviews: 77, image: photo("ansoo", 900), attributes: { languages: ["Urdu", "English", "Hindko"], areas: ["Saif-ul-Malook & Ansoo", "Dudipatsar"], experience: 9, firstAid: true }, daysAgo: 50 }),
  mk({ id: "l5", type: "restaurant", name: "Trout House Shinu", ownerName: "Sample Owner E", ownerEmail: "owner.e@example.com", phone: "0300-0000005", stop: "shinu-jared", address: "Opposite the trout hatchery, Shinu", description: "Pick a live trout from the hatchery and we fry it fresh.", priceFrom: 1800, status: "approved", rating: 4.4, reviews: 96, image: photo("food", 900), attributes: { cuisine: ["Trout", "Desi"], familyArea: true }, daysAgo: 70 }),
  mk({ id: "l6", type: "adventure", name: "Kiwai Zip Line", ownerName: "Sample Owner F", ownerEmail: "owner.f@example.com", phone: "0300-0000006", stop: "kiwai", address: "Kiwai", description: "Zip line across the valley with harnesses, helmets and trained staff.", priceFrom: 1500, status: "approved", featured: true, verified: true, rating: 4.3, reviews: 61, image: photo("kunhar", 900), attributes: { activity: "Zip line", minAge: 8, safetyGear: ["Helmets", "Harness", "Trained staff"] }, daysAgo: 25 }),
  mk({ id: "l7", type: "camping", name: "Batakundi Meadow Camp", ownerName: "Sample Owner G", ownerEmail: "owner.g@example.com", phone: "0300-0000007", stop: "batakundi", address: "Batakundi campground", description: "Tents and bonfire nights on the meadow, start point for Satsar Mala.", priceFrom: 3500, status: "approved", rating: 4.2, reviews: 33, image: photo("camping", 900), attributes: { capacity: 20, facilities: ["Washrooms", "Tents provided", "Bonfire", "Food"] }, daysAgo: 35 }),
  mk({ id: "l8", type: "shop", name: "Jared Walnut Crafts", ownerName: "Sample Owner H", ownerEmail: "owner.h@example.com", phone: "0300-0000008", stop: "shinu-jared", address: "Jared bazaar", description: "Hand-carved walnut-wood furniture and souvenirs.", status: "approved", rating: 4.7, reviews: 19, image: photo("handicraft", 900), attributes: { category: "Handicrafts" }, daysAgo: 45 }),
  // Queue
  mk({ id: "l9", type: "hotel", name: "Lulusar Heights Resort", ownerName: "Sample Owner I", ownerEmail: "owner.i@example.com", phone: "0300-0000009", stop: "lulusar", address: "Near Lulusar Lake", description: "New 18-room resort with lake views. Opening next season.", priceFrom: 14000, status: "pending", image: photo("lulusar2", 900), attributes: { rooms: 18, amenities: ["Parking", "Heating", "Restaurant"] }, daysAgo: 1 }),
  mk({ id: "l10", type: "tour-guide", name: "Guide: Sample Guide J", ownerName: "Sample Guide J", ownerEmail: "guide.j@example.com", phone: "0300-0000010", stop: "paras-sharan", address: "Sharan", description: "Local guide for Manshi Top and Musa ka Musalla.", priceFrom: 4000, status: "pending", image: photo("meadow", 900), attributes: { languages: ["Urdu", "Hindko"], areas: ["Sharan & Manshi Top", "Musa ka Musalla"], experience: 5, firstAid: false }, daysAgo: 0 }),
  mk({ id: "l11", type: "jeep-operator", name: "Paye Meadows Jeeps", ownerName: "Sample Driver K", ownerEmail: "driver.k@example.com", phone: "0300-0000011", stop: "shogran", address: "Shogran jeep stand", description: "Jeeps from Kiwai to Shogran and on to Siri & Paye.", priceFrom: 6000, status: "pending", image: photo("shogran", 900), attributes: { vehicles: 2, routes: ["Kiwai → Shogran", "Shogran → Paye"] }, daysAgo: 2 }),
  mk({ id: "l12", type: "adventure", name: "Naran Rafting Club", ownerName: "Sample Owner L", ownerEmail: "owner.l@example.com", phone: "0300-0000012", stop: "naran", address: "Rafting point, 2 km from Naran", description: "Guided rafting on the Kunhar with life jackets and helmets.", priceFrom: 3000, status: "pending", image: photo("kunhar", 900), attributes: { activity: "River rafting", minAge: 12, safetyGear: ["Helmets", "Life jackets", "Trained staff"] }, daysAgo: 3 }),
  mk({ id: "l13", type: "restaurant", name: "Besal Chai Point", ownerName: "Sample Owner M", ownerEmail: "owner.m@example.com", phone: "0300-0000013", stop: "besal", address: "Besal", description: "Tea, pakoras and parathas for trekkers.", status: "changes_requested", image: photo("dudipatsar", 900), attributes: { cuisine: ["Tea & snacks"] }, daysAgo: 6 }),
  mk({ id: "l14", type: "guest-house", name: "Manoor Valley Homestay", ownerName: "Sample Owner N", ownerEmail: "owner.n@example.com", phone: "0300-0000014", stop: "mahandri-manoor", address: "Biari village, Manoor Valley", description: "Two rooms in a village home with meals.", priceFrom: 4000, status: "pending", image: photo("sheep", 900), attributes: { rooms: 2, meals: true }, daysAgo: 4 }),
  mk({ id: "l15", type: "tour-company", name: "Northern Trails Tours", ownerName: "Sample Owner O", ownerEmail: "owner.o@example.com", phone: "0300-0000015", stop: "balakot", address: "Balakot", description: "Packages from Islamabad to Babusar Top.", status: "rejected", image: photo("balakot", 900), attributes: { packages: ["2–3 day tours", "Family tours"] }, daysAgo: 9 }),
  mk({ id: "l16", type: "hotel", name: "Riverside Inn Kaghan", ownerName: "Sample Owner P", ownerEmail: "owner.p@example.com", phone: "0300-0000016", stop: "kaghan", address: "Kaghan", description: "Budget rooms on the river.", priceFrom: 5000, status: "suspended", image: photo("kaghanNaran", 900), attributes: { rooms: 12 }, daysAgo: 80 }),
  mk({ id: "l17", type: "fuel", name: "Mahandri Filling Station", ownerName: "Sample Owner Q", ownerEmail: "owner.q@example.com", phone: "0300-0000017", stop: "mahandri-manoor", address: "N-15, Mahandri", description: "Petrol, diesel and tyre repair.", status: "approved", attributes: { services: ["Petrol", "Diesel", "Tyre repair"] }, image: photo("batakundi", 900), daysAgo: 90 }),
  mk({ id: "l18", type: "health", name: "Naran Health Centre (sample)", ownerName: "Admin", ownerEmail: "admin@example.com", phone: "1122", stop: "naran", address: "Naran", description: "Add the real facility, phone and hours from the admin panel.", status: "approved", attributes: { facility: "BHU / RHC", emergency: true }, image: photo("restHouse", 900), daysAgo: 100 }),
];

export const SAMPLE_EVENTS: EventItem[] = [
  { id: "e1", title: "Babusar Pass season opening", where: "Babusar Top", stop: "babusar-top", description: "Date announced by the highway authority each year. Follow road updates.", status: "approved" },
  { id: "e2", title: "Naran clean-up drive (sample)", date: "2026-10-25T09:00:00+05:00", where: "Naran bazaar", stop: "naran", description: "Volunteers meet at the bazaar. Bags and gloves provided.", status: "approved" },
  { id: "e3", title: "Balakot market day (sample)", date: "2026-11-02T10:00:00+05:00", where: "Balakot", stop: "balakot", description: "Local produce and crafts.", status: "approved" },
  { id: "e4", title: "Trout festival (sample, pending)", date: "2026-11-10T12:00:00+05:00", where: "Shinu", stop: "shinu-jared", description: "Submitted by a business. Waiting for approval.", status: "pending" },
];

export const SAMPLE_JOBS: Job[] = [
  { id: "j1", title: "Front desk staff", employer: "Kunhar View Hotel (sample)", stop: "naran", type: "Seasonal", salary: "PKR [amount]/month", description: "Check-ins, bookings and guest help. Urdu & English.", contact: "WhatsApp 0300-0000001", status: "approved", postedAt: d(2) },
  { id: "j2", title: "Jeep driver", employer: "Saif Lake Jeep Service (sample)", stop: "naran", type: "Full-time", description: "Valid licence, 3+ years mountain driving.", contact: "0300-0000003", status: "approved", postedAt: d(4) },
  { id: "j3", title: "Cook, desi & BBQ", employer: "Trout House Shinu (sample)", stop: "shinu-jared", type: "Seasonal", description: "Experienced cook for the summer season.", contact: "0300-0000005", status: "approved", postedAt: d(6) },
  { id: "j4", title: "Trek guide", employer: "Northern Trails Tours (sample)", stop: "balakot", type: "Contract", description: "Guides for Dudipatsar and Ansoo groups.", contact: "jobs@example.com", status: "pending", postedAt: d(1) },
];

export const SAMPLE_PROFILES: Profile[] = [
  { id: "u0", name: "Site Admin", email: "admin@example.com", role: "admin", createdAt: d(200), listings: 1 },
  { id: "u1", name: "Moderator One", email: "mod@example.com", role: "moderator", createdAt: d(150), listings: 0 },
  ...SAMPLE_LISTINGS.filter((l) => l.type !== "health").map((l, i) => ({
    id: "u" + (i + 2), name: l.ownerName, email: l.ownerEmail, role: (l.type === "tour-guide" ? "guide" : "business") as Profile["role"], phone: l.phone, createdAt: l.submittedAt, listings: 1,
  })),
  { id: "u90", name: "Traveller Sample", email: "traveller@example.com", role: "traveller", createdAt: d(3), listings: 0 },
];

export const SAMPLE_ACTIVITY: ActivityItem[] = [
  { id: "a1", at: d(0, 9), actor: "Moderator One", action: "updated road status", target: "Naran → Batakundi → Caution" },
  { id: "a2", at: d(0, 8), actor: "Sample Guide J", action: "submitted a guide profile", target: "Guide: Sample Guide J" },
  { id: "a3", at: d(1, 16), actor: "Sample Owner I", action: "submitted a listing", target: "Lulusar Heights Resort" },
  { id: "a4", at: d(1, 12), actor: "Site Admin", action: "suspended", target: "Riverside Inn Kaghan" },
  { id: "a5", at: d(2, 15), actor: "Sample Driver K", action: "submitted a listing", target: "Paye Meadows Jeeps" },
  { id: "a6", at: d(5, 15), actor: "Moderator One", action: "requested changes", target: "Besal Chai Point" },
  { id: "a7", at: d(8, 15), actor: "Moderator One", action: "rejected", target: "Northern Trails Tours" },
];

export const DEFAULT_SETTINGS: SiteSettings = {
  alertBanner: "Babusar Top is a seasonal pass. Check road status before driving beyond Batakundi.",
  heroVideoUrl: "",
  emergencyNumbers: [
    { label: "Rescue & ambulance", number: "1122" },
    { label: "Police", number: "15" },
  ],
  autoPublishEvents: false,
  requireDocsForGuides: true,
};

/** Submissions per week for the admin chart (demo). */
export const SAMPLE_SUBMISSION_TREND = [
  { week: "W33", submitted: 6, approved: 4 },
  { week: "W34", submitted: 9, approved: 7 },
  { week: "W35", submitted: 7, approved: 6 },
  { week: "W36", submitted: 12, approved: 8 },
  { week: "W37", submitted: 10, approved: 9 },
  { week: "W38", submitted: 14, approved: 11 },
  { week: "W39", submitted: 11, approved: 10 },
  { week: "W40", submitted: 16, approved: 12 },
  { week: "W41", submitted: 13, approved: 9 },
];

export const STATUS_LABEL: Record<ListingStatus, string> = {
  draft: "Draft",
  pending: "Pending review",
  changes_requested: "Changes requested",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
};

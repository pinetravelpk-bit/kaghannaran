import type { Listing } from "@/lib/types";

/**
 * Category-specific search filters. Shared by the home-page finder (which builds the URL)
 * and /directory (which applies them). Option values match the listing form options in
 * lib/seed/business-types.ts, so they filter on what owners actually entered.
 */

export const STAY_TYPES = "hotel,guest-house,camping";

export const OPTIONS = {
  budget: [
    { v: "", l: "Any budget" },
    { v: "0-5000", l: "Under Rs 5,000" },
    { v: "5000-10000", l: "Rs 5,000 to 10,000" },
    { v: "10000-20000", l: "Rs 10,000 to 20,000" },
    { v: "20000-", l: "Rs 20,000+" },
  ],
  stay: [
    { v: STAY_TYPES, l: "Any stay" },
    { v: "hotel", l: "Hotel / resort" },
    { v: "guest-house", l: "Guest house" },
    { v: "camping", l: "Camping" },
  ],
  amenities: ["Parking", "Heating", "Hot water", "Wi-Fi", "Family friendly", "River view"],
  cuisine: ["Desi", "BBQ", "Trout", "Chinese", "Fast food", "Tea & snacks"],
  routes: ["Naran → Saif-ul-Malook", "Kiwai → Shogran", "Shogran → Paye", "Batakundi → Lalazar", "Jalkhad → Noori Top", "Dharamsar Lake", "Kaghan → Maidan Meadows", "Paras → Sharan"],
  seats: [{ v: "", l: "Any size" }, { v: "4", l: "4+ seats" }, { v: "6", l: "6+ seats" }, { v: "8", l: "8+ seats" }],
  areas: ["Naran", "Saif-ul-Malook & Ansoo", "Shogran, Siri & Paye", "Sharan & Manshi Top", "Dudipatsar", "Lulusar & Babusar", "Manoor Valley", "Musa ka Musalla"],
  languages: ["Urdu", "English", "Hindko", "Pashto", "Punjabi"],
  activities: ["Zip line", "River rafting", "Paragliding", "Horse riding", "ATV / quad bikes", "Rock climbing", "Fishing"],
};

/** URL params the directory understands, with a human label for the active-filter chips. */
export const FILTER_PARAMS: Record<string, string> = {
  budget: "Budget", amen: "Amenities", cuisine: "Cuisine", family: "Family area", route: "Route",
  seats: "Seats", area: "Area", lang: "Language", firstaid: "First-aid trained", activity: "Activity", age: "Youngest age",
};

const list = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : v === undefined || v === null || v === "" ? [] : [String(v)]);
const num = (v: unknown) => (typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : undefined);

export type FilterParams = Partial<Record<keyof typeof FILTER_PARAMS | "type", string>>;

/** True when a listing matches every category filter in the URL. */
export function matchesFilters(l: Listing, f: FilterParams): boolean {
  const a = l.attributes ?? {};
  if (f.type && !f.type.split(",").includes(l.type)) return false;
  if (f.budget) {
    const [lo, hi] = f.budget.split("-").map((x) => (x ? Number(x) : undefined));
    if (l.priceFrom === undefined) return false;
    if (lo !== undefined && l.priceFrom < lo) return false;
    if (hi !== undefined && l.priceFrom > hi) return false;
  }
  if (f.amen) {
    const have = [...list(a.amenities), ...list(a.facilities)];
    if (!f.amen.split(",").every((x) => have.includes(x))) return false;
  }
  if (f.cuisine && !f.cuisine.split(",").some((x) => list(a.cuisine).includes(x))) return false;
  if (f.family && a.familyArea !== true) return false;
  if (f.route && !list(a.routes).includes(f.route)) return false;
  if (f.seats && (num(a.seats) ?? 0) < Number(f.seats)) return false;
  if (f.area && !list(a.areas).includes(f.area)) return false;
  if (f.lang && !list(a.languages).includes(f.lang)) return false;
  if (f.firstaid && a.firstAid !== true) return false;
  if (f.activity && a.activity !== f.activity) return false;
  if (f.age) {
    const min = num(a.minAge);
    if (min !== undefined && min > Number(f.age)) return false;
  }
  return true;
}

/** Label for an active filter value, e.g. budget "0-5000" → "Under Rs 5,000". */
export function filterValueLabel(key: string, v: string): string {
  if (key === "budget") return OPTIONS.budget.find((o) => o.v === v)?.l ?? v;
  if (key === "seats") return `${v}+ seats`;
  if (key === "age") return `${v} years`;
  if (key === "family" || key === "firstaid") return "Yes";
  return v.split(",").join(", ");
}

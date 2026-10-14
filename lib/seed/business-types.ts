import type { BusinessType, DocDef } from "@/lib/types";

const CNIC: DocDef = { key: "cnic", label: "Owner CNIC (front & back)", required: true, hint: "Clear photo or scan. Only staff can see this." };
const PHOTOS: DocDef = { key: "photos", label: "Photos of the premises", required: true, hint: "At least 3 recent photos." };
const REG: DocDef = { key: "registration", label: "Business registration or tourism licence", required: false, hint: "Speeds up approval and earns a Verified badge." };

const baseChecks = ["Phone number answered", "Location confirmed on map", "Photos are real and recent", "Owner CNIC matches applicant"];

export const BUSINESS_TYPES: BusinessType[] = [
  {
    slug: "hotel", name: "Hotel / Resort", group: "Stay", icon: "BedDouble",
    description: "Hotels, resorts and motels with rooms to rent.",
    fields: [
      { key: "rooms", label: "Number of rooms", type: "number", required: true },
      { key: "roomTypes", label: "Room types", type: "multiselect", options: ["Standard", "Deluxe", "Family", "Suite", "Dormitory"] },
      { key: "amenities", label: "Amenities", type: "multiselect", options: ["Parking", "Hot water", "Heating", "Wi-Fi", "Generator / solar", "Restaurant", "River view", "Family friendly"] },
      { key: "checkIn", label: "Check-in time", type: "text", placeholder: "e.g. 12:00" },
      { key: "season", label: "Open season", type: "select", options: ["All year", "Summer only (May to Oct)", "Custom"] },
    ],
    documents: [CNIC, REG, PHOTOS],
    checklist: [...baseChecks, "Room rates displayed", "Safety: fire extinguisher / exits"],
  },
  {
    slug: "guest-house", name: "Guest house / Homestay", group: "Stay", icon: "Home",
    description: "Family-run guest houses and homestays.",
    fields: [
      { key: "rooms", label: "Rooms", type: "number", required: true },
      { key: "meals", label: "Meals included", type: "boolean" },
      { key: "amenities", label: "Amenities", type: "multiselect", options: ["Parking", "Hot water", "Heating", "Wi-Fi", "Family friendly"] },
    ],
    documents: [CNIC, PHOTOS],
    checklist: baseChecks,
  },
  {
    slug: "camping", name: "Camping site", group: "Stay", icon: "Tent",
    description: "Campsites, camping pods and glamping.",
    fields: [
      { key: "capacity", label: "Tents / pods available", type: "number", required: true },
      { key: "facilities", label: "Facilities", type: "multiselect", options: ["Washrooms", "Tents provided", "Bonfire", "Food", "Electricity", "Security"] },
    ],
    documents: [CNIC, PHOTOS],
    checklist: [...baseChecks, "Washroom facilities verified", "Site not in a landslide / flood zone"],
  },
  {
    slug: "restaurant", name: "Restaurant / Dhaba", group: "Eat & shop", icon: "UtensilsCrossed",
    description: "Restaurants, dhabas, tea stalls and BBQ.",
    fields: [
      { key: "cuisine", label: "Cuisine", type: "multiselect", options: ["Desi", "BBQ", "Trout", "Chinese", "Fast food", "Tea & snacks"] },
      { key: "seating", label: "Seating capacity", type: "number" },
      { key: "hours", label: "Opening hours", type: "text", placeholder: "e.g. 8am to 11pm" },
      { key: "familyArea", label: "Family area", type: "boolean" },
    ],
    documents: [CNIC, { key: "food", label: "Food safety licence", required: false }, PHOTOS],
    checklist: [...baseChecks, "Menu with prices provided", "Kitchen hygiene photos reviewed"],
  },
  {
    slug: "shop", name: "Shop / Store", group: "Eat & shop", icon: "Store",
    description: "General stores, handicrafts, outdoor gear, pharmacies.",
    fields: [
      { key: "category", label: "Shop category", type: "select", options: ["General store", "Handicrafts", "Outdoor gear", "Clothing", "Pharmacy", "Mobile & SIM", "Other"], required: true },
      { key: "hours", label: "Opening hours", type: "text" },
    ],
    documents: [CNIC, PHOTOS],
    checklist: baseChecks,
  },
  {
    slug: "jeep-operator", name: "Jeep / Transport", group: "Get around", icon: "CarFront",
    description: "Jeep owners and drivers, car hire, transport services.",
    fields: [
      { key: "vehicles", label: "Number of vehicles", type: "number", required: true },
      { key: "vehicleModel", label: "Vehicle model(s)", type: "text", placeholder: "e.g. Willys 4x4" },
      { key: "routes", label: "Routes served", type: "multiselect", options: ["Naran → Saif-ul-Malook", "Kiwai → Shogran", "Shogran → Paye", "Batakundi → Lalazar", "Jalkhad → Noori Top", "Dharamsar Lake", "Kaghan → Maidan Meadows", "Paras → Sharan"] },
      { key: "seats", label: "Seats per vehicle", type: "number" },
    ],
    documents: [CNIC, { key: "license", label: "Driving licence", required: true }, { key: "vehicleReg", label: "Vehicle registration", required: true }, { key: "vehiclePhotos", label: "Vehicle photos", required: true }],
    checklist: [...baseChecks, "Driving licence valid", "Vehicle registration matches", "Vehicle roadworthy (photos)"],
  },
  {
    slug: "tour-guide", name: "Tour guide (individual)", group: "People", icon: "UserRoundCheck", individual: true,
    description: "Individual local guides, trek leaders and porters.",
    fields: [
      { key: "languages", label: "Languages spoken", type: "multiselect", options: ["Urdu", "English", "Hindko", "Pashto", "Punjabi", "Gojri", "Shina"], required: true },
      { key: "areas", label: "Areas you guide", type: "multiselect", options: ["Naran", "Saif-ul-Malook & Ansoo", "Shogran, Siri & Paye", "Sharan & Manshi Top", "Dudipatsar", "Lulusar & Babusar", "Manoor Valley", "Musa ka Musalla"], required: true },
      { key: "experience", label: "Years of experience", type: "number", required: true },
      { key: "dailyRate", label: "Daily rate (PKR)", type: "number" },
      { key: "firstAid", label: "First-aid trained", type: "boolean" },
    ],
    documents: [
      { key: "cnic", label: "CNIC (front & back)", required: true },
      { key: "photo", label: "Profile photo", required: true },
      { key: "guideLicence", label: "Guide licence or certificate", required: false, hint: "Earns a Licensed Guide badge." },
      { key: "reference", label: "Reference letter (hotel / tour company)", required: false },
    ],
    checklist: ["Phone number answered", "CNIC matches applicant", "Interview / call completed", "References checked", "Areas & experience plausible"],
  },
  {
    slug: "tour-company", name: "Tour company", group: "People", icon: "Map",
    description: "Registered tour operators and travel agencies.",
    fields: [
      { key: "packages", label: "Package types", type: "multiselect", options: ["Day trips", "2 to 3 day tours", "Treks", "Family tours", "Honeymoon", "Corporate"] },
      { key: "office", label: "Office location", type: "text" },
    ],
    documents: [CNIC, { key: "registration", label: "Company registration (SECP / DTS)", required: true }, PHOTOS],
    checklist: [...baseChecks, "Company registration verified"],
  },
  {
    slug: "adventure", name: "Adventure activity", group: "Adventure", icon: "MountainSnow",
    description: "Zip lines, rafting, paragliding, horse riding, ATVs.",
    fields: [
      { key: "activity", label: "Activity", type: "select", options: ["Zip line", "River rafting", "Paragliding", "Horse riding", "ATV / quad bikes", "Rock climbing", "Fishing", "Other"], required: true },
      { key: "minAge", label: "Minimum age", type: "number" },
      { key: "safetyGear", label: "Safety gear provided", type: "multiselect", options: ["Helmets", "Harness", "Life jackets", "First-aid kit", "Trained staff"] },
    ],
    documents: [CNIC, { key: "safety", label: "Safety certificate / equipment inspection", required: true }, { key: "insurance", label: "Insurance (if any)", required: false }, PHOTOS],
    checklist: [...baseChecks, "Safety certificate valid", "Equipment inspected (photos/video)", "Staff trained"],
  },
  {
    slug: "health", name: "Clinic / Health centre", group: "Services", icon: "Cross", adminOnly: true,
    description: "Hospitals, BHUs, clinics and pharmacies.",
    fields: [
      { key: "facility", label: "Facility type", type: "select", options: ["Hospital", "BHU / RHC", "Private clinic", "Pharmacy"] },
      { key: "emergency", label: "24-hour emergency", type: "boolean" },
    ],
    documents: [],
    checklist: ["Phone number answered", "Location confirmed on map"],
  },
  {
    slug: "police", name: "Police station / Check post", group: "Services", icon: "ShieldCheck", adminOnly: true,
    description: "Police stations, tourist police and check posts.",
    fields: [{ key: "kind", label: "Kind", type: "select", options: ["Police station", "Tourist police", "Check post"] }],
    documents: [],
    checklist: ["Location confirmed on map"],
  },
  {
    slug: "bank-atm", name: "Bank / ATM", group: "Services", icon: "Landmark", adminOnly: true,
    description: "Bank branches and ATMs.",
    fields: [
      { key: "bank", label: "Bank", type: "text" },
      { key: "atm24", label: "24-hour ATM", type: "boolean" },
    ],
    documents: [],
    checklist: ["Location confirmed on map"],
  },
  {
    slug: "fuel", name: "Fuel / Mechanic", group: "Services", icon: "Fuel",
    description: "Petrol pumps, tyre shops, mechanics and towing.",
    fields: [{ key: "services", label: "Services", type: "multiselect", options: ["Petrol", "Diesel", "Tyre repair", "Mechanic", "Towing"] }],
    documents: [CNIC, PHOTOS],
    checklist: baseChecks,
  },
  {
    slug: "govt", name: "Government office", group: "Services", icon: "Building2", adminOnly: true,
    description: "Tourism offices, post offices, rest houses and permit desks.",
    fields: [{ key: "department", label: "Department", type: "text" }],
    documents: [],
    checklist: ["Location confirmed on map"],
  },
];

export const getType = (slug: string) => BUSINESS_TYPES.find((t) => t.slug === slug);
export const PUBLIC_TYPES = BUSINESS_TYPES.filter((t) => !t.adminOnly);

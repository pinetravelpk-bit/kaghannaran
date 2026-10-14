export type Role = "traveller" | "business" | "guide" | "moderator" | "admin";

export type ListingStatus =
  | "draft"
  | "pending"
  | "changes_requested"
  | "approved"
  | "rejected"
  | "suspended";

export type Place = {
  name: string;
  note?: string;
  isNew?: boolean;
  warning?: string;
  image?: string;
};

export type Stop = {
  slug: string;
  order: number;
  name: string;
  nameUr?: string;
  kind: string;
  sideTrip?: boolean;
  altitude?: number; // metres, approximate
  desc: string;
  image?: string;
  places: Place[];
};

export type TrailMode = "Jeep" | "Hike" | "Trek" | "Walk";

export type Trail = {
  slug: string;
  name: string;
  mode: TrailMode;
  from: string;
  time: string;
  stop: string; // stop slug
};

export type RoadStatus = "open" | "caution" | "closed" | "seasonal";

export type RoadSegment = {
  id: string;
  segment: string;
  note: string;
  status: RoadStatus;
  updatedAt: string;
};

export type FieldDef = {
  key: string;
  label: string;
  type: "text" | "number" | "textarea" | "select" | "multiselect" | "boolean";
  options?: string[];
  required?: boolean;
  placeholder?: string;
};

export type DocDef = { key: string; label: string; required: boolean; hint?: string };

export type BusinessType = {
  slug: string;
  name: string;
  group: "Stay" | "Eat & shop" | "Get around" | "Adventure" | "Services" | "People";
  icon: string; // lucide icon name
  individual?: boolean; // for individual people (e.g. tour guides)
  adminOnly?: boolean; // public services added by staff, not by public sign-up
  description: string;
  fields: FieldDef[];
  documents: DocDef[];
  checklist: string[]; // what moderators verify before approving
};

export type ListingDoc = { key: string; label: string; fileName: string; url?: string };

export type ModerationEvent = {
  id: string;
  at: string;
  by: string;
  action: "submitted" | "approved" | "rejected" | "changes_requested" | "suspended" | "resubmitted" | "note";
  note?: string;
};

export type Listing = {
  id: string;
  slug: string;
  type: string; // BusinessType slug
  name: string;
  ownerName: string;
  ownerEmail: string;
  phone: string;
  whatsapp?: string;
  stop: string; // stop slug
  address: string;
  description: string;
  priceFrom?: number;
  status: ListingStatus;
  featured?: boolean;
  verified?: boolean;
  rating?: number;
  reviews?: number;
  image?: string;
  gallery?: string[];
  attributes: Record<string, string | number | boolean | string[]>;
  documents: ListingDoc[];
  checklist: Record<string, boolean>;
  history: ModerationEvent[];
  submittedAt: string;
  updatedAt: string;
};

export type EventItem = {
  id: string;
  title: string;
  date?: string; // ISO; undefined = TBA
  where: string;
  stop: string;
  description: string;
  status: ListingStatus;
};

export type Job = {
  id: string;
  title: string;
  employer: string;
  stop: string;
  type: "Full-time" | "Seasonal" | "Contract" | "Part-time";
  salary?: string;
  description: string;
  contact: string;
  status: ListingStatus;
  postedAt: string;
};

export type Profile = {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  createdAt: string;
  listings: number;
};

export type ActivityItem = {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
};

export type SiteSettings = {
  alertBanner: string;
  heroVideoUrl: string;
  emergencyNumbers: { label: string; number: string }[];
  autoPublishEvents: boolean;
  requireDocsForGuides: boolean;
};

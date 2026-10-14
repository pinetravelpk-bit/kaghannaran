import "server-only";
import { cache } from "react";
import { supabaseServer } from "@/lib/supabase/server";
import { isDemo, isDemoAdmin } from "@/lib/supabase/config";
import * as seed from "@/lib/seed";
import type { ActivityItem, BusinessType, EventItem, Job, Listing, ListingStatus, Profile, Role, RoadSegment, SiteSettings, Stop, Trail, WeatherArea } from "@/lib/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ───────── row mappers ─────────
const toStop = (r: any): Stop => ({
  slug: r.slug, order: r.sort_order, name: r.name, nameUr: r.name_ur ?? undefined, kind: r.kind, sideTrip: r.side_trip,
  altitude: r.altitude ?? undefined, desc: r.description, image: r.image_url ?? undefined, places: r.places ?? [],
});
const toTrail = (r: any): Trail => ({ slug: r.slug, name: r.name, mode: r.mode, from: r.start_from, time: r.time_note, stop: r.stop_slug ?? "" });
const toType = (r: any): BusinessType => ({
  slug: r.slug, name: r.name, group: r.grp, icon: r.icon, description: r.description, individual: r.individual, adminOnly: r.admin_only,
  fields: r.fields ?? [], documents: r.documents ?? [], checklist: r.checklist ?? [],
});
const toListing = (r: any): Listing => ({
  id: r.id, slug: r.slug, type: r.type_slug, name: r.name,
  ownerName: r.owner?.full_name ?? "", ownerEmail: r.owner?.email ?? "",
  phone: r.phone, whatsapp: r.whatsapp ?? undefined, stop: r.stop_slug ?? "", address: r.address, description: r.description,
  priceFrom: r.price_from ?? undefined, status: r.status, featured: r.featured, verified: r.verified,
  rating: r.rating ? Number(r.rating) : undefined, reviews: r.review_count, image: r.image_url ?? undefined, gallery: r.gallery ?? [],
  attributes: r.attributes ?? {}, checklist: r.checklist ?? {},
  documents: (r.listing_documents ?? []).map((d: any) => ({ key: d.doc_key, label: d.label, fileName: d.storage_path.split("/").pop(), url: d.storage_path })),
  history: (r.moderation_events ?? [])
    .map((e: any) => ({ id: e.id, at: e.created_at, by: e.actor_name, action: e.action, note: e.note ?? undefined }))
    .sort((a: any, b: any) => a.at.localeCompare(b.at)),
  submittedAt: r.submitted_at, updatedAt: r.updated_at,
});
const pt = (lat: any, lon: any) => (lat == null || lon == null ? undefined : { lat: Number(lat), lon: Number(lon) });
const toRoad = (r: any): RoadSegment => ({
  id: r.id, segment: r.segment, note: r.note, status: r.status, updatedAt: r.updated_at,
  mode: r.mode ?? "manual", manualUntil: r.manual_until ?? undefined,
  from: pt(r.from_lat, r.from_lon), to: pt(r.to_lat, r.to_lon),
  normalKm: r.normal_km == null ? undefined : Number(r.normal_km), openMonths: r.open_months ?? undefined,
});
const toWeatherArea = (r: any): WeatherArea => ({
  slug: r.slug, name: r.name, lat: r.lat, lon: r.lon, alt: r.alt, sort: r.sort_order, onHome: r.on_home,
  advisory: r.advisory, advisoryLevel: r.advisory_level, overrideLabel: r.override_label ?? undefined,
  overrideTemp: r.override_temp == null ? undefined : Number(r.override_temp), overrideUntil: r.override_until ?? undefined, updatedAt: r.updated_at,
});
const toEvent = (r: any): EventItem => ({ id: r.id, title: r.title, date: r.starts_at ?? undefined, where: r.location, stop: r.stop_slug ?? "", description: r.description, status: r.status });
const toJob = (r: any): Job => ({ id: r.id, title: r.title, employer: r.employer, stop: r.stop_slug ?? "", type: r.job_type, salary: r.salary ?? undefined, description: r.description, contact: r.contact, status: r.status, postedAt: r.created_at });

async function db() {
  return isDemo ? null : await supabaseServer();
}

// ───────── public reference data ─────────
export const getStops = cache(async (): Promise<Stop[]> => {
  const s = await db();
  if (!s) return seed.STOPS;
  const { data, error } = await s.from("stops").select("*").order("sort_order");
  return error || !data?.length ? seed.STOPS : data.map(toStop);
});

export async function getStopBySlug(slug: string) {
  return (await getStops()).find((x) => x.slug === slug);
}

export const getTrails = cache(async (): Promise<Trail[]> => {
  const s = await db();
  if (!s) return seed.TRAILS;
  const { data, error } = await s.from("trails").select("*").order("sort_order");
  return error || !data?.length ? seed.TRAILS : data.map(toTrail);
});

export const getBusinessTypes = cache(async (): Promise<BusinessType[]> => {
  const s = await db();
  if (!s) return seed.BUSINESS_TYPES;
  const { data, error } = await s.from("business_types").select("*");
  return error || !data?.length ? seed.BUSINESS_TYPES : data.map(toType);
});

export const getRoad = cache(async (): Promise<RoadSegment[]> => {
  const s = await db();
  if (!s) return seed.ROAD_SEGMENTS;
  const { data, error } = await s.from("road_segments").select("*").order("sort_order");
  return error || !data?.length ? seed.ROAD_SEGMENTS : data.map(toRoad);
});

export const getWeatherAreas = cache(async (): Promise<WeatherArea[]> => {
  const s = await db();
  if (!s) return seed.WEATHER_AREAS;
  // falls back to the built-in areas until migration 0002 has been run
  const { data, error } = await s.from("weather_areas").select("*").order("sort_order");
  return error || !data?.length ? seed.WEATHER_AREAS : data.map(toWeatherArea);
});

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const s = await db();
  if (!s) return seed.DEFAULT_SETTINGS;
  const { data } = await s.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (!data) return seed.DEFAULT_SETTINGS;
  return {
    alertBanner: data.alert_banner, heroVideoUrl: data.hero_video_url, emergencyNumbers: data.emergency_numbers,
    autoPublishEvents: data.auto_publish_events, requireDocsForGuides: data.require_docs_for_guides,
  };
});

// ───────── listings ─────────
const LISTING_SELECT = "*, owner:profiles(full_name,email), listing_documents(*), moderation_events(*)";

export async function getListings(opts: { status?: ListingStatus | "all"; type?: string; stop?: string; q?: string; featured?: boolean } = {}): Promise<Listing[]> {
  const status = opts.status ?? "approved";
  const s = await db();
  let list: Listing[];
  if (!s) {
    list = seed.LISTINGS;
  } else {
    let query = s.from("listings").select(LISTING_SELECT).order("submitted_at", { ascending: false });
    if (status !== "all") query = query.eq("status", status);
    if (opts.type) query = query.eq("type_slug", opts.type);
    if (opts.stop) query = query.eq("stop_slug", opts.stop);
    if (opts.featured) query = query.eq("featured", true);
    const { data } = await query;
    list = (data ?? []).map(toListing);
  }
  return list.filter((l) =>
    (status === "all" || l.status === status) &&
    (!opts.type || l.type === opts.type) &&
    (!opts.stop || l.stop === opts.stop) &&
    (!opts.featured || l.featured) &&
    (!opts.q || (l.name + " " + l.description + " " + l.address).toLowerCase().includes(opts.q.toLowerCase())),
  );
}

export async function getListing(idOrSlug: string): Promise<Listing | undefined> {
  const s = await db();
  if (!s) return seed.LISTINGS.find((l) => l.id === idOrSlug || l.slug === idOrSlug);
  const isUuid = /^[0-9a-f-]{36}$/i.test(idOrSlug);
  const { data } = await s.from("listings").select(LISTING_SELECT).eq(isUuid ? "id" : "slug", idOrSlug).maybeSingle();
  return data ? toListing(data) : undefined;
}

export async function getMyListings(userId: string): Promise<Listing[]> {
  const s = await db();
  if (!s) return [];
  const { data } = await s.from("listings").select(LISTING_SELECT).eq("owner_id", userId).order("submitted_at", { ascending: false });
  return (data ?? []).map(toListing);
}

// ───────── community ─────────
export async function getEvents(all = false): Promise<EventItem[]> {
  const s = await db();
  if (!s) return all ? seed.EVENTS : seed.EVENTS.filter((e) => e.status === "approved");
  let q = s.from("events").select("*").order("starts_at", { ascending: true, nullsFirst: true });
  if (!all) q = q.eq("status", "approved");
  const { data } = await q;
  return (data ?? []).map(toEvent);
}

export async function getJobs(all = false): Promise<Job[]> {
  const s = await db();
  if (!s) return all ? seed.JOBS : seed.JOBS.filter((e) => e.status === "approved");
  let q = s.from("jobs").select("*").order("created_at", { ascending: false });
  if (!all) q = q.eq("status", "approved");
  const { data } = await q;
  return (data ?? []).map(toJob);
}

// ───────── admin ─────────
export async function getProfiles(): Promise<Profile[]> {
  const s = await db();
  if (!s) return seed.PROFILES;
  const { data } = await s.from("profiles").select("*, listings(count)").order("created_at", { ascending: false });
  return (data ?? []).map((r: any) => ({ id: r.id, name: r.full_name, email: r.email, role: r.role, phone: r.phone ?? undefined, createdAt: r.created_at, listings: r.listings?.[0]?.count ?? 0 }));
}

export async function getActivity(limit = 50): Promise<ActivityItem[]> {
  const s = await db();
  if (!s) return seed.ACTIVITY;
  const { data } = await s.from("activity_log").select("*").order("created_at", { ascending: false }).limit(limit);
  return (data ?? []).map((r: any) => ({ id: String(r.id), at: r.created_at, actor: r.actor_name, action: r.action, target: r.target }));
}

// ───────── auth ─────────
export type SessionUser = { id: string; email: string; name: string; role: Role; demo?: boolean };

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  if (isDemoAdmin) return { id: "demo", email: "admin@example.com", name: "Demo Admin", role: "admin", demo: true };
  if (isDemo) return null;
  const s = await supabaseServer();
  if (!s) return null;
  const { data: { user } } = await s.auth.getUser();
  if (!user) return null;
  const { data: p } = await s.from("profiles").select("full_name, role").eq("id", user.id).maybeSingle();
  return { id: user.id, email: user.email ?? "", name: p?.full_name || user.email || "", role: (p?.role as Role) ?? "traveller" };
});

export const isStaffRole = (r?: Role) => r === "admin" || r === "moderator";

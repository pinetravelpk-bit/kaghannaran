"use server";
import { revalidatePath } from "next/cache";
import { isDemo } from "@/lib/supabase/config";
import type { ListingStatus, Place, Role, RoadSegment, SiteSettings, BusinessType, WeatherArea } from "@/lib/types";
import { demoResult, logActivity, requireStaff, type ActionResult } from "./util";

const fail = (e: unknown): ActionResult => ({ ok: false, message: e instanceof Error ? e.message : "Something went wrong." });

export type Decision = "approved" | "rejected" | "changes_requested" | "suspended" | "note";

export async function moderateListing(input: { id: string; name: string; decision: Decision; note?: string; checklist: Record<string, boolean>; verified?: boolean }): Promise<ActionResult> {
  try {
    if (input.decision !== "approved" && input.decision !== "note" && !input.note?.trim()) return { ok: false, message: "Add a note so the owner knows what to fix." };
    if (isDemo) return demoResult(`${input.name}: ${input.decision.replace("_", " ")}`);
    const { user, s } = await requireStaff();
    const patch: Record<string, unknown> = { checklist: input.checklist };
    if (input.decision !== "note") patch.status = input.decision as ListingStatus;
    if (input.verified !== undefined) patch.verified = input.verified;
    const { data: row, error } = await s!.from("listings").update(patch).eq("id", input.id).select("owner_id, slug").single();
    if (error) throw error;
    await s!.from("moderation_events").insert({ listing_id: input.id, actor_id: user.id, actor_name: user.name, action: input.decision, note: input.note || null });
    if (row?.owner_id && input.decision !== "note") {
      const titles: Record<string, string> = { approved: "Your listing is live 🎉", rejected: "Your listing was not approved", changes_requested: "Changes needed on your listing", suspended: "Your listing has been suspended" };
      await s!.from("notifications").insert({ user_id: row.owner_id, title: titles[input.decision], body: input.note || null, link: "/dashboard" });
    }
    await logActivity(input.decision === "note" ? "added a note on" : input.decision.replace("_", " "), input.name);
    revalidatePath("/admin", "layout");
    revalidatePath("/", "layout");
    return { ok: true, message: `Saved: ${input.name}` };
  } catch (e) { return fail(e); }
}

export async function setListingFlag(id: string, name: string, field: "featured" | "verified", value: boolean): Promise<ActionResult> {
  try {
    if (isDemo) return demoResult(`${name}: ${field} ${value ? "on" : "off"}`);
    const { s } = await requireStaff();
    const { error } = await s!.from("listings").update({ [field]: value }).eq("id", id);
    if (error) throw error;
    await logActivity(`${value ? "set" : "removed"} ${field}`, name);
    revalidatePath("/", "layout");
    return { ok: true, message: "Saved" };
  } catch (e) { return fail(e); }
}

export async function deleteListing(id: string, name: string): Promise<ActionResult> {
  try {
    if (isDemo) return demoResult(`Deleted ${name}`);
    const { s } = await requireStaff();
    const { error } = await s!.from("listings").delete().eq("id", id);
    if (error) throw error;
    await logActivity("deleted", name);
    revalidatePath("/", "layout");
    return { ok: true, message: `Deleted ${name}` };
  } catch (e) { return fail(e); }
}

export async function saveRoadSegment(seg: Omit<RoadSegment, "id" | "updatedAt"> & { id?: string; sort?: number }): Promise<ActionResult> {
  try {
    const what = seg.mode === "manual" ? `${seg.segment} → ${seg.status} (manual)` : `${seg.segment} → automatic`;
    if (isDemo) return demoResult(`Road: ${what}`);
    const { user, s } = await requireStaff();
    const row = {
      segment: seg.segment, note: seg.note, status: seg.status, mode: seg.mode, manual_until: seg.mode === "manual" ? seg.manualUntil ?? null : null,
      from_lat: seg.from?.lat ?? null, from_lon: seg.from?.lon ?? null, to_lat: seg.to?.lat ?? null, to_lon: seg.to?.lon ?? null,
      normal_km: seg.normalKm ?? null, open_months: seg.openMonths?.length ? seg.openMonths : null,
      updated_at: new Date().toISOString(), updated_by: user.id, ...(seg.sort !== undefined ? { sort_order: seg.sort } : {}),
    };
    const q = seg.id ? s!.from("road_segments").update(row).eq("id", seg.id).select("id").single() : s!.from("road_segments").insert(row).select("id").single();
    const { data, error } = await q;
    if (error) throw error;
    await logActivity("updated road status", what);
    revalidatePath("/", "layout");
    return { ok: true, message: "Road status published", id: data.id };
  } catch (e) { return fail(e); }
}

export async function deleteRoadSegment(id: string): Promise<ActionResult> {
  try {
    if (isDemo) return demoResult("Segment removed");
    const { s } = await requireStaff();
    await s!.from("road_segments").delete().eq("id", id);
    revalidatePath("/", "layout");
    return { ok: true, message: "Segment removed" };
  } catch (e) { return fail(e); }
}

export async function saveStop(stop: { slug: string; name: string; nameUr?: string; kind: string; sideTrip?: boolean; altitude?: number; desc: string; image?: string; places: Place[]; order: number }): Promise<ActionResult> {
  try {
    if (isDemo) return demoResult(`Saved ${stop.name}`);
    const { s } = await requireStaff();
    const { error } = await s!.from("stops").upsert({
      slug: stop.slug, sort_order: stop.order, name: stop.name, name_ur: stop.nameUr || null, kind: stop.kind, side_trip: !!stop.sideTrip,
      altitude: stop.altitude || null, description: stop.desc, image_url: stop.image || null, places: stop.places,
    });
    if (error) throw error;
    await logActivity("edited stop", stop.name);
    revalidatePath("/", "layout");
    return { ok: true, message: `Saved ${stop.name}` };
  } catch (e) { return fail(e); }
}

export async function saveSettings(v: SiteSettings): Promise<ActionResult> {
  try {
    if (isDemo) return demoResult("Settings saved");
    const { s } = await requireStaff();
    const { error } = await s!.from("site_settings").upsert({
      id: 1, alert_banner: v.alertBanner, hero_video_url: v.heroVideoUrl, emergency_numbers: v.emergencyNumbers,
      auto_publish_events: v.autoPublishEvents, require_docs_for_guides: v.requireDocsForGuides,
    });
    if (error) throw error;
    await logActivity("updated settings", "Site settings");
    revalidatePath("/", "layout");
    return { ok: true, message: "Settings saved" };
  } catch (e) { return fail(e); }
}

export async function setUserRole(id: string, name: string, role: Role): Promise<ActionResult> {
  try {
    if (isDemo) return demoResult(`${name} is now ${role}`);
    const { user, s } = await requireStaff();
    if (user.role !== "admin") return { ok: false, message: "Only admins can change roles." };
    const { error } = await s!.from("profiles").update({ role }).eq("id", id);
    if (error) throw error;
    await logActivity(`changed role to ${role}`, name);
    return { ok: true, message: `${name} is now ${role}` };
  } catch (e) { return fail(e); }
}

export async function moderateCommunity(kind: "events" | "jobs", id: string, title: string, status: ListingStatus): Promise<ActionResult> {
  try {
    if (isDemo) return demoResult(`${title}: ${status}`);
    const { s } = await requireStaff();
    const { error } = await s!.from(kind).update({ status }).eq("id", id);
    if (error) throw error;
    await logActivity(`${status} ${kind === "events" ? "event" : "job"}`, title);
    revalidatePath("/", "layout");
    return { ok: true, message: `${title}: ${status}` };
  } catch (e) { return fail(e); }
}

export async function saveBusinessType(t: BusinessType): Promise<ActionResult> {
  try {
    if (isDemo) return demoResult(`Saved rules for ${t.name}`);
    const { s } = await requireStaff();
    const { error } = await s!.from("business_types").upsert({
      slug: t.slug, name: t.name, grp: t.group, icon: t.icon, description: t.description, individual: !!t.individual, admin_only: !!t.adminOnly,
      fields: t.fields, documents: t.documents, checklist: t.checklist,
    });
    if (error) throw error;
    await logActivity("edited approval rules", t.name);
    revalidatePath("/", "layout");
    return { ok: true, message: `Saved rules for ${t.name}` };
  } catch (e) { return fail(e); }
}

export async function saveTrails(trails: import("@/lib/types").Trail[]): Promise<ActionResult> {
  try {
    if (isDemo) return demoResult(`Saved ${trails.length} routes`);
    const { s } = await requireStaff();
    const rows = trails.map((t, i) => ({ slug: t.slug, name: t.name, mode: t.mode, start_from: t.from, time_note: t.time, stop_slug: t.stop || null, sort_order: i }));
    const { error } = await s!.from("trails").upsert(rows);
    if (error) throw error;
    const keep = trails.map((t) => t.slug);
    await s!.from("trails").delete().not("slug", "in", `(${keep.map((k) => `"${k}"`).join(",")})`);
    await logActivity("edited trails", `${trails.length} routes`);
    revalidatePath("/", "layout");
    return { ok: true, message: `Saved ${trails.length} routes` };
  } catch (e) { return fail(e); }
}

export async function saveWeatherArea(a: WeatherArea, originalSlug?: string): Promise<ActionResult> {
  try {
    if (isDemo) return demoResult(`Weather: saved ${a.name}`);
    const { user, s } = await requireStaff();
    const row = {
      slug: a.slug, name: a.name, lat: a.lat, lon: a.lon, alt: a.alt, sort_order: a.sort, on_home: a.onHome,
      advisory: a.advisory, advisory_level: a.advisoryLevel, override_label: a.overrideLabel || null,
      override_temp: a.overrideTemp ?? null, override_until: a.overrideUntil ?? null, updated_at: new Date().toISOString(), updated_by: user.id,
    };
    const { error } = originalSlug && originalSlug !== a.slug
      ? await s!.from("weather_areas").update(row).eq("slug", originalSlug)
      : await s!.from("weather_areas").upsert(row);
    if (error) throw error;
    await logActivity("updated weather", a.name + (a.advisory ? `: ${a.advisory}` : ""));
    revalidatePath("/", "layout");
    return { ok: true, message: `Saved weather for ${a.name}` };
  } catch (e) { return fail(e); }
}

export async function deleteWeatherArea(slug: string): Promise<ActionResult> {
  try {
    if (isDemo) return demoResult("Area removed");
    const { s } = await requireStaff();
    const { error } = await s!.from("weather_areas").delete().eq("slug", slug);
    if (error) throw error;
    revalidatePath("/", "layout");
    return { ok: true, message: "Area removed" };
  } catch (e) { return fail(e); }
}

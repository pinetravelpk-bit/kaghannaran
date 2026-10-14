"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isDemo } from "@/lib/supabase/config";
import { supabaseServer } from "@/lib/supabase/server";
import { getBusinessTypes, getSettings } from "@/lib/data";
import { demoResult, logActivity, requireUser, slugify, type ActionResult } from "./util";

const Base = z.object({
  id: z.string().optional(),
  type: z.string().min(1),
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(7, "Phone is required"),
  whatsapp: z.string().optional(),
  stop: z.string().min(1, "Choose the nearest stop"),
  address: z.string().min(2, "Address is required"),
  description: z.string().min(20, "Please write at least 20 characters about the business"),
  priceFrom: z.string().optional(),
});

const MAX_FILE = 8 * 1024 * 1024;

export async function submitListing(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  try {
    const base = Base.parse(Object.fromEntries(form.entries()));
    const types = await getBusinessTypes();
    const type = types.find((t) => t.slug === base.type);
    if (!type || type.adminOnly) return { ok: false, message: "This business type can’t be submitted publicly." };

    // type-specific attributes
    const attributes: Record<string, unknown> = {};
    for (const f of type.fields) {
      if (f.type === "multiselect") attributes[f.key] = form.getAll(`attr_${f.key}`).map(String);
      else if (f.type === "boolean") attributes[f.key] = form.get(`attr_${f.key}`) === "on";
      else if (f.type === "number") { const v = form.get(`attr_${f.key}`); if (v) attributes[f.key] = Number(v); }
      else { const v = form.get(`attr_${f.key}`); if (v) attributes[f.key] = String(v); }
      const val = attributes[f.key];
      if (f.required && (val === undefined || val === "" || (Array.isArray(val) && !val.length))) return { ok: false, message: `“${f.label}” is required.` };
    }

    // documents (admins can relax the CNIC rule for guides in Settings)
    const settings = await getSettings();
    const files: { key: string; label: string; file: File }[] = [];
    for (const d of type.documents) {
      const list = form.getAll(`doc_${d.key}`).filter((x): x is File => x instanceof File && x.size > 0);
      const required = d.required && !(type.individual && d.key === "cnic" && !settings.requireDocsForGuides);
      if (!base.id && required && !list.length) return { ok: false, message: `Please upload: ${d.label}.` };
      for (const file of list) {
        if (file.size > MAX_FILE) return { ok: false, message: `${file.name} is larger than 8 MB.` };
        files.push({ key: d.key, label: d.label, file });
      }
    }
    const photos = form.getAll("photos").filter((x): x is File => x instanceof File && x.size > 0);

    if (isDemo) return demoResult(base.id ? "Changes sent for re-review" : `“${base.name}” submitted for review`);

    const user = await requireUser();
    const s = (await supabaseServer())!;
    const row = {
      type_slug: type.slug, name: base.name, phone: base.phone, whatsapp: base.whatsapp || null, stop_slug: base.stop,
      address: base.address, description: base.description, price_from: base.priceFrom ? Number(base.priceFrom) : null, attributes,
      status: "pending" as const,
    };

    let id = base.id;
    if (id) {
      const { error } = await s.from("listings").update(row).eq("id", id).eq("owner_id", user.id);
      if (error) throw error;
    } else {
      const slug = `${slugify(base.name)}-${Math.random().toString(36).slice(2, 6)}`;
      const { data, error } = await s.from("listings").insert({ ...row, slug, owner_id: user.id }).select("id").single();
      if (error) throw error;
      id = data.id as string;
    }

    // uploads (private documents + public photos)
    for (const f of files) {
      const path = `${user.id}/${id}/${f.key}-${Date.now()}-${f.file.name.replace(/[^\w.-]/g, "_")}`;
      const up = await s.storage.from("documents").upload(path, f.file, { upsert: false });
      if (up.error) throw up.error;
      await s.from("listing_documents").insert({ listing_id: id, doc_key: f.key, label: f.label, storage_path: path });
    }
    const urls: string[] = [];
    for (const p of photos.slice(0, 12)) {
      const path = `${user.id}/${id}/${Date.now()}-${p.name.replace(/[^\w.-]/g, "_")}`;
      const up = await s.storage.from("listing-media").upload(path, p);
      if (up.error) throw up.error;
      urls.push(s.storage.from("listing-media").getPublicUrl(path).data.publicUrl);
    }
    if (urls.length) await s.from("listings").update({ image_url: urls[0], gallery: urls.slice(1) }).eq("id", id);

    await s.from("moderation_events").insert({ listing_id: id, actor_id: user.id, actor_name: user.name, action: base.id ? "resubmitted" : "submitted" });
    await logActivity(base.id ? "resubmitted" : "submitted a listing", base.name);
    revalidatePath("/dashboard");
    revalidatePath("/admin/approvals");
    return { ok: true, id, message: base.id ? "Changes sent. A moderator will re-check them shortly." : "Submitted! We’ll review it and let you know — usually within 1–2 working days." };
  } catch (e) {
    const msg = e instanceof z.ZodError ? e.issues[0]?.message ?? "Please check the form." : e instanceof Error ? e.message : "Something went wrong.";
    return { ok: false, message: msg };
  }
}

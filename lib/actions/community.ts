"use server";
import { z } from "zod";
import { isDemo } from "@/lib/supabase/config";
import { supabaseServer } from "@/lib/supabase/server";
import { demoResult, requireUser, type ActionResult } from "./util";

const EventSchema = z.object({ title: z.string().min(3), starts_at: z.string().optional(), location: z.string().min(2), stop_slug: z.string().optional(), description: z.string().min(10) });
const JobSchema = z.object({ title: z.string().min(3), employer: z.string().min(2), stop_slug: z.string().optional(), job_type: z.string(), salary: z.string().optional(), description: z.string().min(10), contact: z.string().min(5) });

export async function submitCommunity(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const kind = form.get("kind");
  const raw = Object.fromEntries(form.entries());
  try {
    if (kind === "event") {
      const v = EventSchema.parse(raw);
      if (isDemo) return demoResult("Event submitted for review");
      await requireUser();
      const s = await supabaseServer();
      const { error } = await s!.from("events").insert({ ...v, starts_at: v.starts_at || null, stop_slug: v.stop_slug || null, status: "pending" });
      if (error) throw error;
      return { ok: true, message: "Thanks! Your event will appear once a moderator approves it." };
    }
    const v = JobSchema.parse(raw);
    if (isDemo) return demoResult("Job submitted for review");
    await requireUser();
    const s = await supabaseServer();
    const { error } = await s!.from("jobs").insert({ ...v, stop_slug: v.stop_slug || null, status: "pending" });
    if (error) throw error;
    return { ok: true, message: "Thanks! Your job post will appear once a moderator approves it." };
  } catch (e) {
    const msg = e instanceof z.ZodError ? "Please fill in all required fields." : e instanceof Error ? e.message : "Something went wrong.";
    return { ok: false, message: msg };
  }
}

import "server-only";
import { supabaseServer } from "@/lib/supabase/server";
import { isDemo } from "@/lib/supabase/config";
import { getCurrentUser, isStaffRole } from "@/lib/data";

export type ActionResult = { ok: boolean; message: string; demo?: boolean; id?: string };

export const demoResult = (message: string): ActionResult => ({ ok: true, demo: true, message: `${message} (demo mode, nothing was saved)` });

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Please sign in first.");
  return user;
}

export async function requireStaff() {
  const user = await getCurrentUser();
  if (!user || !isStaffRole(user.role)) throw new Error("Staff only.");
  const s = await supabaseServer();
  return { user, s };
}

export async function logActivity(action: string, target: string) {
  if (isDemo) return;
  const s = await supabaseServer();
  const user = await getCurrentUser();
  await s?.from("activity_log").insert({ actor_id: user?.id, actor_name: user?.name ?? "", action, target });
}

export const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);

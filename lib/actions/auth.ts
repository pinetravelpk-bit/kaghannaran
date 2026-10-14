"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isDemo, isDemoAdmin } from "@/lib/supabase/config";
import { supabaseServer } from "@/lib/supabase/server";
import type { ActionResult } from "./util";

export async function signIn(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  if (isDemo) return { ok: false, message: isDemoAdmin ? "Demo mode: sign-in is disabled. You’re already browsing as Demo Admin. Open /admin or /dashboard." : "Accounts open soon. Please check back shortly." };
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/dashboard");
  const s = (await supabaseServer())!;
  const { error } = await s.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: error.message };
  redirect(next.startsWith("/") ? next : "/dashboard");
}

const SignUp = z.object({
  full_name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Enter your phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["traveller", "business", "guide"]),
});

export async function signUp(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const parsed = SignUp.safeParse(Object.fromEntries(form.entries()));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the form." };
  if (isDemo) return { ok: true, demo: true, message: isDemoAdmin ? "Demo mode: account not created. Connect Supabase to enable sign-up." : "Accounts open soon. Please check back shortly." };
  const { email, password, ...meta } = parsed.data;
  const s = (await supabaseServer())!;
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const { error } = await s.auth.signUp({ email, password, options: { data: meta, emailRedirectTo: `${site}/auth/callback?next=${meta.role === "traveller" ? "/" : "/dashboard/new"}` } });
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Check your email to confirm your account, then sign in." };
}

export async function signOut() {
  if (!isDemo) await (await supabaseServer())!.auth.signOut();
  redirect("/");
}

"use client";
import { useActionState, useState } from "react";
import { clsx } from "clsx";
import { Compass, Store, UserRoundCheck } from "lucide-react";
import { signIn, signUp } from "@/lib/actions/auth";
import { Field, Notice, Submit } from "./Field";

export function SignInForm({ next }: { next?: string }) {
  const [state, action] = useActionState(signIn, null);
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next ?? "/dashboard"} />
      {state ? <Notice ok={state.ok}>{state.message}</Notice> : null}
      <Field label="Email" name="email" type="email" required />
      <Field label="Password" name="password" type="password" required />
      <Submit>Sign in</Submit>
    </form>
  );
}

const ROLES = [
  { id: "traveller", label: "Traveller", sub: "Save places, write reviews", I: Compass },
  { id: "business", label: "Business owner", sub: "Hotel, restaurant, shop, jeep…", I: Store },
  { id: "guide", label: "Tour guide", sub: "Individual guide or trek leader", I: UserRoundCheck },
] as const;

export function SignUpForm({ initialRole }: { initialRole?: string }) {
  const [state, action] = useActionState(signUp, null);
  const [role, setRole] = useState<string>(ROLES.some((r) => r.id === initialRole) ? initialRole! : "business");
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="role" value={role} />
      {state ? <Notice ok={state.ok}>{state.message}</Notice> : null}
      <fieldset className="grid gap-2 sm:grid-cols-3">
        <legend className="mb-2 text-sm font-semibold">I am a…</legend>
        {ROLES.map(({ id, label, sub, I }) => (
          <button key={id} type="button" aria-pressed={role === id} onClick={() => setRole(id)} className={clsx("flex flex-col items-start gap-1 rounded-2xl border-2 p-3 text-left transition rtl:text-right", role === id ? "border-ink bg-ground" : "border-line hover:border-ink")}>
            <I className="size-5 text-maroon" aria-hidden /><span className="font-semibold">{label}</span><span className="text-xs text-muted">{sub}</span>
          </button>
        ))}
      </fieldset>
      <Field label="Full name" name="full_name" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" name="email" type="email" required />
        <Field label="Mobile" name="phone" type="tel" required placeholder="03XX XXXXXXX" />
      </div>
      <Field label="Password" name="password" type="password" required hint="At least 8 characters" />
      <Submit>Create account</Submit>
    </form>
  );
}

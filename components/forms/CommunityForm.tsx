"use client";
import { useActionState } from "react";
import { submitCommunity } from "@/lib/actions/community";
import { Field, Submit, Notice } from "./Field";

export function CommunityForm({ kind, stops }: { kind: "job" | "event"; stops: { slug: string; name: string }[] }) {
  const [state, action] = useActionState(submitCommunity, null);
  return (
    <form action={action} className="flex flex-col gap-5 rounded-3xl border border-line bg-white p-6 md:p-8">
      <input type="hidden" name="kind" value={kind} />
      {state ? <Notice ok={state.ok}>{state.message}</Notice> : null}
      <Field label={kind === "job" ? "Job title" : "Event name"} name="title" required />
      {kind === "job" ? (
        <>
          <Field label="Employer / business" name="employer" required />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Type" name="job_type" as="select" options={["Seasonal", "Full-time", "Part-time", "Contract"]} />
            <Field label="Salary (optional)" name="salary" placeholder="PKR per month" />
          </div>
          <Field label="How to apply" name="contact" required placeholder="Phone, WhatsApp or email" />
        </>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Date & time (leave empty if not announced)" name="starts_at" type="datetime-local" />
          <Field label="Venue / location" name="location" required />
        </div>
      )}
      <Field label="Nearest stop" name="stop_slug" as="select" options={[["", "Choose a stop"], ...stops.map((s) => [s.slug, s.name] as [string, string])]} />
      <Field label="Description" name="description" as="textarea" required />
      <Submit>Submit for review</Submit>
    </form>
  );
}

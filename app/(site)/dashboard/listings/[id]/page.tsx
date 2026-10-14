import { notFound, redirect } from "next/navigation";
import { getBusinessTypes, getCurrentUser, getListing, getStops } from "@/lib/data";
import { ListingForm } from "@/components/forms/ListingForm";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { isDemo } from "@/lib/supabase/config";

export const metadata = { title: "Edit listing" };

export default async function EditListing({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in?next=/dashboard");
  const { id } = await params;
  const [l, types, stops] = await Promise.all([getListing(id), getBusinessTypes(), getStops()]);
  if (!l) notFound();
  return (
    <section className="px-4 py-12 md:px-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><span className="eyebrow text-maroon">Edit listing</span><h1 className="font-display text-5xl font-extrabold tracking-tight">{l.name}</h1></div><StatusBadge status={l.status} /></div>
        {l.status === "approved" ? <p className="rounded-xl bg-ground p-4 text-ink-2">Saving changes sends the listing back for a quick re-check. It is hidden from search until a moderator approves it again{isDemo ? " (demo mode: nothing is saved)" : ""}.</p> : null}
        <ListingForm types={types} stops={stops.map((s) => ({ slug: s.slug, name: s.name }))} listing={l} />
      </div>
    </section>
  );
}

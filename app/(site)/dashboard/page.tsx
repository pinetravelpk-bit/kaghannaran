import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, MessageSquareWarning, Pencil, ExternalLink, LogOut } from "lucide-react";
import { getBusinessTypes, getCurrentUser, getMyListings, getStops } from "@/lib/data";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { signOut } from "@/lib/actions/auth";
import type { Listing } from "@/lib/types";

export const metadata = { title: "My listings" };

const STEPS = ["Submitted", "In review", "Verified", "Live"];
const progress = (l: Listing) => (l.status === "approved" ? 4 : l.status === "pending" ? (Object.values(l.checklist).some(Boolean) ? 2 : 1) : 1);

export default async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in?next=/dashboard");
  const [listings, types, stops] = await Promise.all([getMyListings(user.id), getBusinessTypes(), getStops()]);
  return (
    <section className="px-4 py-12 md:px-6">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><span className="eyebrow text-maroon">My account</span><h1 className="font-display text-5xl font-extrabold tracking-tight">Salaam, {user.name.split(" ")[0]}</h1></div>
          <div className="flex gap-2">
            <Link href="/dashboard/new" className="flex items-center gap-2 rounded-full bg-maroon px-6 py-3.5 font-semibold text-white"><Plus className="size-4" />Add a listing</Link>
            <form action={signOut}><button className="flex items-center gap-2 rounded-full border border-line-2 px-5 py-3.5 font-semibold"><LogOut className="size-4" />Sign out</button></form>
          </div>
        </div>
        {!listings.length ? (
          <div className="rounded-3xl bg-sage p-10 text-center"><p className="font-display text-2xl font-bold">No listings yet</p><Link href="/dashboard/new" className="mt-4 inline-block rounded-full bg-ink px-6 py-3 font-semibold text-ground">Add your first listing</Link></div>
        ) : null}
        <ul className="flex flex-col gap-4">
          {listings.map((l, i) => {
            const type = types.find((t) => t.slug === l.type);
            const lastNote = [...l.history].reverse().find((h) => h.note && h.action !== "submitted");
            const p = progress(l);
            return (
              <Reveal as="li" key={l.id} delay={i * 0.05} className="grid overflow-hidden rounded-3xl border border-line bg-white md:grid-cols-[220px_minmax(0,1fr)]">
                <Photo src={l.image} alt={l.name} className="h-44 md:h-full" />
                <div className="flex flex-col gap-4 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div><span className="text-sm text-muted">{type?.name} · {stops.find((s) => s.slug === l.stop)?.name}</span><h2 className="font-display text-2xl font-bold">{l.name}</h2></div>
                    <StatusBadge status={l.status} />
                  </div>
                  {l.status !== "rejected" && l.status !== "suspended" ? (
                    <ol className="grid grid-cols-4 gap-2" aria-label="Review progress">
                      {STEPS.map((s, j) => (
                        <li key={s} className="flex flex-col gap-1.5"><span className={`h-1.5 rounded-full ${j < p ? "bg-emerald-600" : "bg-line-2"}`} /><span className={`text-xs font-semibold ${j < p ? "text-ink" : "text-muted"}`}>{s}</span></li>
                      ))}
                    </ol>
                  ) : null}
                  {lastNote && l.status !== "approved" ? (
                    <p className="flex items-start gap-2 rounded-xl bg-[#FBEBC8] p-3 text-sm text-[#5A3A06]"><MessageSquareWarning className="mt-0.5 size-4 shrink-0" /><span><b>Moderator:</b> {lastNote.note}</span></p>
                  ) : null}
                  <div className="mt-auto flex flex-wrap gap-2">
                    <Link href={`/dashboard/listings/${l.id}`} className="flex items-center gap-1.5 rounded-full border border-line-2 px-4 py-2 text-sm font-semibold"><Pencil className="size-3.5" />{l.status === "changes_requested" ? "Fix & resubmit" : "Edit"}</Link>
                    {l.status === "approved" ? <Link href={`/listing/${l.slug}`} className="flex items-center gap-1.5 rounded-full border border-line-2 px-4 py-2 text-sm font-semibold"><ExternalLink className="size-3.5" />View live</Link> : null}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

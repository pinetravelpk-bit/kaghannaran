import { pageMeta } from "@/lib/seo";
import { redirect } from "next/navigation";
import { getBusinessTypes, getCurrentUser, getStops } from "@/lib/data";
import { ListingForm } from "@/components/forms/ListingForm";

export const metadata = pageMeta({ title: "Add a listing", description: "Add your business to the Kaghan Naran directory.", path: "/dashboard/new", noindex: true });

export default async function NewListing({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const user = await getCurrentUser();
  const { type } = await searchParams;
  if (!user) redirect(`/auth/sign-up?role=${type === "tour-guide" ? "guide" : "business"}`);
  const [types, stops] = await Promise.all([getBusinessTypes(), getStops()]);
  return (
    <section className="px-4 py-12 md:px-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div><span className="eyebrow text-maroon">New listing</span><h1 className="font-display text-5xl font-extrabold tracking-tight">Tell us about it</h1><p className="mt-2 text-lg text-muted">The form changes for each type. A moderator reviews every submission before it goes live.</p></div>
        <ListingForm types={types} stops={stops.map((s) => ({ slug: s.slug, name: s.name }))} initialType={type} />
      </div>
    </section>
  );
}

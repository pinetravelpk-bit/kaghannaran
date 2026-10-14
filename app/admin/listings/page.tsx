import Link from "next/link";
import { getBusinessTypes, getListings, getStops } from "@/lib/data";
import { AdminHeader } from "@/components/admin/ui";
import { ListingsTable } from "@/components/admin/ListingsTable";

export const metadata = { title: "All listings" };

export default async function ListingsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const sp = await searchParams;
  const [all, types, stops] = await Promise.all([getListings({ status: "all" }), getBusinessTypes(), getStops()]);
  return (
    <>
      <AdminHeader title="All listings" sub={`${all.length} listings across ${types.length} types. Star to feature on the home page; badge to mark verified.`} actions={<Link href="/dashboard/new" className="rounded-full bg-ink px-5 py-3 font-semibold text-ground">Add listing</Link>} />
      <ListingsTable listings={all} types={types} stops={Object.fromEntries(stops.map((s) => [s.slug, s.name]))} initialQ={sp.q} initialStatus={sp.status} />
    </>
  );
}

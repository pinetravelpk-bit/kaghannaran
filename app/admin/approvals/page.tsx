import { getBusinessTypes, getListings, getStops } from "@/lib/data";
import { AdminHeader } from "@/components/admin/ui";
import { ApprovalQueue } from "@/components/admin/ApprovalQueue";

export const metadata = { title: "Approval queue" };

export default async function ApprovalsPage() {
  const [all, types, stops] = await Promise.all([getListings({ status: "all" }), getBusinessTypes(), getStops()]);
  return (
    <>
      <AdminHeader title="Approval queue" sub="Every business type has its own documents and checklist. Oldest first keeps us inside the 48-hour promise." />
      <ApprovalQueue listings={all} types={types} stops={Object.fromEntries(stops.map((s) => [s.slug, s.name]))} />
    </>
  );
}

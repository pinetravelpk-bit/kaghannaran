import { getStops, getTrails } from "@/lib/data";
import { AdminHeader } from "@/components/admin/ui";
import { TrailsEditor } from "@/components/admin/TrailsEditor";

export const metadata = { title: "Trails" };

export default async function TrailsAdmin() {
  const [trails, stops] = await Promise.all([getTrails(), getStops()]);
  return (
    <>
      <AdminHeader title="Jeep tracks & hikes" sub="Shown on /trails, stop pages and the home page." />
      <TrailsEditor initial={trails} stops={stops} />
    </>
  );
}

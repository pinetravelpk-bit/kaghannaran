import { getStops } from "@/lib/data";
import { AdminHeader } from "@/components/admin/ui";
import { PlacesEditor } from "@/components/admin/PlacesEditor";

export const metadata = { title: "Places & stops" };

export default async function PlacesAdmin() {
  const stops = await getStops();
  return (
    <>
      <AdminHeader title="Places & stops" sub={`${stops.length} stops from Balakot to Babusar Top. Edits show on the route explorer, stop pages and infographics.`} />
      <PlacesEditor initial={stops} />
    </>
  );
}

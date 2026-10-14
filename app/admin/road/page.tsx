import { getRoad } from "@/lib/data";
import { getRoadLive, googleConnected } from "@/lib/road";
import { AdminHeader } from "@/components/admin/ui";
import { RoadEditor, type AutoView } from "@/components/admin/RoadEditor";

export const metadata = { title: "Road status" };
export const dynamic = "force-dynamic";

export default async function RoadAdmin() {
  const [road, live] = await Promise.all([getRoad(), getRoadLive()]);
  const auto: Record<string, AutoView> = Object.fromEntries(live.map((r) => [r.id, r.auto ? { status: r.auto.status, note: r.auto.note } : null]));
  return (
    <>
      <AdminHeader title="Road status" sub="Segments on Automatic follow live checks. Switch to Manual override to set the status yourself. It goes back to automatic when the override expires." />
      <RoadEditor initial={road} auto={auto} google={googleConnected} />
    </>
  );
}

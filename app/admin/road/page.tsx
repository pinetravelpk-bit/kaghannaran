import { getRoad } from "@/lib/data";
import { AdminHeader } from "@/components/admin/ui";
import { RoadEditor } from "@/components/admin/RoadEditor";

export const metadata = { title: "Road status" };

export default async function RoadAdmin() {
  const road = await getRoad();
  return (
    <>
      <AdminHeader title="Road status" sub="Shown on the home page board and /road. Publish each segment when it changes — the time updates automatically." />
      <RoadEditor initial={road} />
    </>
  );
}

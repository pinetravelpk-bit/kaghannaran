import { getEvents, getJobs } from "@/lib/data";
import { AdminHeader } from "@/components/admin/ui";
import { CommunityModeration } from "@/components/admin/CommunityModeration";

export const metadata = { title: "Events & jobs" };

export default async function CommunityAdmin() {
  const [events, jobs] = await Promise.all([getEvents(true), getJobs(true)]);
  return (
    <>
      <AdminHeader title="Events & jobs" sub="Community posts go live only after approval." />
      <CommunityModeration events={events} jobs={jobs} />
    </>
  );
}

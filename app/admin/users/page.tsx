import { getProfiles } from "@/lib/data";
import { AdminHeader } from "@/components/admin/ui";
import { UsersTable } from "@/components/admin/UsersTable";

export const metadata = { title: "Users & roles" };

export default async function UsersAdmin() {
  const users = await getProfiles();
  return (
    <>
      <AdminHeader title="Users & roles" sub="Only admins can change roles. Moderators can review listings but can’t promote anyone." />
      <UsersTable users={users} />
    </>
  );
}

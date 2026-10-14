import { getSettings } from "@/lib/data";
import { AdminHeader } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata = { title: "Settings" };

export default async function SettingsAdmin() {
  const s = await getSettings();
  return (
    <>
      <AdminHeader title="Settings" sub="Site-wide banner, film, emergency numbers and moderation rules." />
      <SettingsForm initial={s} />
    </>
  );
}

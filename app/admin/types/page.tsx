import { getBusinessTypes } from "@/lib/data";
import { AdminHeader } from "@/components/admin/ui";
import { TypesEditor } from "@/components/admin/TypesEditor";

export const metadata = { title: "Business types & approval rules" };

export default async function TypesAdmin() {
  const types = await getBusinessTypes();
  return (
    <>
      <AdminHeader title="Business types & approval rules" sub="Each type has its own sign-up form, required documents and a checklist moderators tick before approving." />
      <TypesEditor initial={types} />
    </>
  );
}

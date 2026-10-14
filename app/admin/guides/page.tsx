import Link from "next/link";
import { Languages, MapPinned, Award, HeartPulse } from "lucide-react";
import { getListings, getStops } from "@/lib/data";
import { AdminHeader } from "@/components/admin/ui";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Photo } from "@/components/ui/Photo";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";

export const metadata = { title: "Tour guides" };

export default async function GuidesPage() {
  const [all, stops] = await Promise.all([getListings({ status: "all", type: "tour-guide" }), getStops()]);
  const sn = (s: string) => stops.find((x) => x.slug === s)?.name;
  const list = (v: unknown) => (Array.isArray(v) ? v : []);
  return (
    <>
      <AdminHeader title="Tour guides" sub="Individual guides are verified by CNIC, a phone interview and references before they appear in search." />
      <Stagger className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {all.map((g) => (
          <StaggerItem key={g.id} className="flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white">
            <div className="flex items-center gap-4 p-5">
              <Photo src={g.image} alt={g.name} className="size-16 shrink-0 rounded-2xl" />
              <div className="min-w-0 flex-1"><b className="block truncate font-display text-xl">{g.ownerName}</b><span className="text-sm text-muted">{sn(g.stop)} · {g.phone}</span></div>
              <StatusBadge status={g.status} />
            </div>
            <ul className="flex flex-col gap-2 border-t border-line p-5 text-sm">
              <li className="flex gap-2"><Languages className="size-4 shrink-0 text-pine" />{list(g.attributes.languages).join(", ") || "—"}</li>
              <li className="flex gap-2"><MapPinned className="size-4 shrink-0 text-pine" />{list(g.attributes.areas).join(", ") || "—"}</li>
              <li className="flex gap-2"><Award className="size-4 shrink-0 text-pine" />{String(g.attributes.experience ?? "—")} years experience</li>
              <li className="flex gap-2"><HeartPulse className="size-4 shrink-0 text-pine" />First-aid: {g.attributes.firstAid ? "Yes" : "No"}</li>
            </ul>
            <div className="mt-auto flex items-center justify-between gap-2 border-t border-line p-4">
              <span className="text-sm text-muted">{g.documents.length} document{g.documents.length === 1 ? "" : "s"}</span>
              <Link href={`/admin/approvals/${g.id}`} className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-ground">{g.status === "pending" ? "Verify" : "Open"}</Link>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </>
  );
}

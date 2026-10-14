import type { ListingStatus, RoadStatus } from "@/lib/types";
import { clsx } from "clsx";

const L: Record<ListingStatus, [string, string]> = {
  draft: ["Draft", "bg-zinc-200 text-zinc-800"],
  pending: ["Pending", "bg-amber-100 text-amber-900"],
  changes_requested: ["Changes requested", "bg-orange-100 text-orange-900"],
  approved: ["Approved", "bg-emerald-100 text-emerald-900"],
  rejected: ["Rejected", "bg-red-100 text-red-900"],
  suspended: ["Suspended", "bg-zinc-800 text-white"],
};

export function StatusBadge({ status, className }: { status: ListingStatus; className?: string }) {
  const [label, cls] = L[status];
  return (
    <span className={clsx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap", cls, className)}>
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}

const R: Record<RoadStatus, [string, string]> = {
  open: ["OPEN", "bg-[#1E4D3A] text-[#9FE3BF]"],
  caution: ["CAUTION", "bg-[#4A3A12] text-signal"],
  closed: ["CLOSED", "bg-[#4A1414] text-[#FFB4B4]"],
  seasonal: ["SEASONAL", "bg-[#3A2A20] text-[#F2B48A]"],
};

export function RoadBadge({ status }: { status: RoadStatus }) {
  const [label, cls] = R[status];
  return <span className={clsx("rounded-md px-2.5 py-1 font-mono text-[11px] font-semibold tracking-widest whitespace-nowrap", cls)}>{label}</span>;
}

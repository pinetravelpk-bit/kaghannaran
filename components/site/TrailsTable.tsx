import Link from "next/link";
import { clsx } from "clsx";
import type { Stop, Trail, TrailMode } from "@/lib/types";

const CHIP: Record<TrailMode, string> = {
  Jeep: "bg-pine text-ground",
  Hike: "bg-[#F6E3C4] text-[#6B3A10]",
  Trek: "bg-maroon text-white",
  Walk: "bg-sage text-pine",
};

export function TrailsTable({ trails, stops }: { trails: Trail[]; stops: Stop[] }) {
  const stopName = (s: string) => stops.find((x) => x.slug === s)?.name ?? "";
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left rtl:text-right">
        <thead>
          <tr className="font-mono text-[11px] tracking-[0.12em] text-[#6A7A76]">
            <th className="pb-3 font-normal">ROUTE</th><th className="pb-3 font-normal">MODE</th><th className="pb-3 font-normal">STARTS FROM</th><th className="pb-3 font-normal">STOP</th><th className="pb-3 font-normal">TIME / NOTE</th>
          </tr>
        </thead>
        <tbody>
          {trails.map((tr) => (
            <tr key={tr.slug} id={tr.slug} className="group border-t border-line transition hover:bg-ground">
              <td className="py-4 pe-4"><Link href={`/places/${tr.stop}`} className="font-display text-xl font-semibold group-hover:text-maroon">{tr.name}</Link></td>
              <td className="py-4 pe-4"><span className={clsx("rounded-full px-3 py-1 text-xs font-semibold", CHIP[tr.mode])}>{tr.mode}</span></td>
              <td className="py-4 pe-4 text-muted">{tr.from}</td>
              <td className="py-4 pe-4 text-muted">{stopName(tr.stop)}</td>
              <td className="py-4 font-mono text-sm">{tr.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

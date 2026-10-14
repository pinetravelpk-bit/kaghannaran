"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { clsx } from "clsx";
import { LayoutDashboard, ClipboardCheck, Building, UserRoundCheck, CalendarDays, MapPinned, Construction, ListChecks, Users, History, Settings, Globe, Route, CloudSun } from "lucide-react";

const NAV = [
  { group: "Overview", items: [["/admin", "Dashboard", LayoutDashboard], ["/admin/activity", "Activity log", History]] },
  { group: "Moderation", items: [["/admin/approvals", "Approval queue", ClipboardCheck], ["/admin/listings", "All listings", Building], ["/admin/guides", "Tour guides", UserRoundCheck], ["/admin/community", "Events & jobs", CalendarDays]] },
  { group: "Content", items: [["/admin/places", "Places & stops", MapPinned], ["/admin/trails", "Trails", Route], ["/admin/road", "Road status", Construction], ["/admin/weather", "Weather", CloudSun], ["/admin/types", "Business types & rules", ListChecks]] },
  { group: "System", items: [["/admin/users", "Users & roles", Users], ["/admin/settings", "Settings", Settings]] },
] as const;

export function Sidebar({ pending }: { pending: number }) {
  const path = usePathname();
  const active = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));
  return (
    <aside className="flex flex-col gap-6 bg-board p-4 text-ground lg:sticky lg:top-0 lg:h-svh lg:w-72 lg:shrink-0 lg:overflow-y-auto">
      <Link href="/admin" className="flex items-center gap-3 rounded-2xl bg-white p-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Kaghan Naran · Pine Travel" className="h-12 w-auto" />
        <span className="font-mono text-[10px] leading-tight tracking-widest text-ink">ADMIN<br />CONSOLE</span>
      </Link>
      <nav aria-label="Admin" className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-col lg:gap-5 lg:overflow-visible">
        {NAV.map((g) => (
          <div key={g.group} className="flex gap-1 lg:flex-col">
            <span className="hidden px-3 pb-1 font-mono text-[10px] tracking-[0.18em] text-[#5E7571] uppercase lg:block">{g.group}</span>
            {g.items.map(([href, label, I]) => (
              <Link key={href} href={href} className={clsx("relative flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", active(href) ? "text-ink" : "text-mist hover:bg-pine hover:text-white")}>
                {active(href) ? <motion.span layoutId="admin-nav" className="absolute inset-0 rounded-xl bg-amber" transition={{ type: "spring", stiffness: 380, damping: 32 }} /> : null}
                <I className="relative size-[18px]" aria-hidden />
                <span className="relative whitespace-nowrap">{label}</span>
                {href === "/admin/approvals" && pending ? <span className="relative ms-auto rounded-full bg-maroon px-2 py-0.5 font-mono text-[11px] text-white">{pending}</span> : null}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <Link href="/" className="mt-auto hidden items-center gap-2 rounded-xl border border-[#23403B] px-3 py-2.5 text-sm text-mist hover:text-white lg:flex"><Globe className="size-4" />View website</Link>
    </aside>
  );
}

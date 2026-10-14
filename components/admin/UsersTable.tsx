"use client";
import { useState, useTransition } from "react";
import type { Profile, Role } from "@/lib/types";
import { setUserRole } from "@/lib/actions/admin";
import { useToast } from "./Toast";

const ROLES: Role[] = ["traveller", "business", "guide", "moderator", "admin"];
const TONE: Record<Role, string> = { traveller: "bg-ground", business: "bg-sage", guide: "bg-[#F6E3C4]", moderator: "bg-amber", admin: "bg-ink text-ground" };

export function UsersTable({ users }: { users: Profile[] }) {
  const [rows, setRows] = useState(users);
  const [q, setQ] = useState("");
  const [, start] = useTransition();
  const toast = useToast();
  const shown = rows.filter((u) => !q || `${u.name} ${u.email} ${u.phone ?? ""}`.toLowerCase().includes(q.toLowerCase()));
  const counts = ROLES.map((r) => [r, rows.filter((u) => u.role === r).length] as const);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">{counts.map(([r, n]) => <span key={r} className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${TONE[r]}`}>{r} · {n}</span>)}</div>
      <label className="rounded-2xl border border-line bg-white p-2"><span className="sr-only">Search users</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email or phone" className="min-h-11 w-full rounded-xl bg-ground px-3 outline-none" /></label>
      <div className="overflow-x-auto rounded-3xl border border-line bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-ground font-mono text-[11px] tracking-widest text-muted uppercase"><tr><th className="px-5 py-3 font-normal">User</th><th className="px-3 py-3 font-normal">Joined</th><th className="px-3 py-3 font-normal">Listings</th><th className="px-5 py-3 font-normal">Role</th></tr></thead>
          <tbody>
            {shown.map((u) => (
              <tr key={u.id} className="border-t border-line">
                <td className="px-5 py-3"><span className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-full bg-pine font-semibold text-signal">{u.name.slice(0, 1)}</span><span><b className="block">{u.name}</b><span className="text-muted">{u.email}{u.phone ? ` · ${u.phone}` : ""}</span></span></span></td>
                <td className="px-3 py-3">{new Date(u.createdAt).toLocaleDateString("en-GB")}</td>
                <td className="px-3 py-3 font-mono">{u.listings}</td>
                <td className="px-5 py-3">
                  <label className="sr-only" htmlFor={`role-${u.id}`}>Role for {u.name}</label>
                  <select id={`role-${u.id}`} value={u.role} onChange={(e) => { const role = e.target.value as Role; start(async () => { const r = await setUserRole(u.id, u.name, role); toast(r); if (r.ok) setRows((x) => x.map((y) => (y.id === u.id ? { ...y, role } : y))); }); }} className={`rounded-full px-3 py-2 font-semibold capitalize ${TONE[u.role]}`}>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

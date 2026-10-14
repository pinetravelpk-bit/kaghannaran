import { redirect } from "next/navigation";
import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { getCurrentUser, getListings, isStaffRole } from "@/lib/data";
import { isDemo } from "@/lib/supabase/config";
import { Sidebar } from "@/components/admin/Sidebar";
import { ToastProvider } from "@/components/admin/Toast";
import { signOut } from "@/lib/actions/auth";

export const metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in?next=/admin");
  if (!isStaffRole(user.role)) redirect("/dashboard");
  const pending = (await getListings({ status: "pending" })).length;
  return (
    <ToastProvider>
      <div className="flex min-h-svh flex-col bg-[#F3F5F2] lg:flex-row">
        <Sidebar pending={pending} />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white px-4 py-3 md:px-8">
            <form action="/admin/listings" className="flex min-w-60 flex-1 items-center gap-2 rounded-xl bg-ground px-3 py-2 md:max-w-md">
              <label htmlFor="admin-q" className="sr-only">Search listings</label>
              <input id="admin-q" name="q" placeholder="Search listings, owners, phone…" className="w-full bg-transparent text-sm outline-none" />
            </form>
            <div className="flex items-center gap-3">
              {isDemo ? <span className="flex items-center gap-1.5 rounded-full bg-signal px-3 py-1.5 text-xs font-semibold"><FlaskConical className="size-3.5" />Demo data</span> : null}
              <span className="text-sm"><b>{user.name}</b> <span className="text-muted">· {user.role}</span></span>
              {isDemo ? <Link href="/" className="text-sm font-semibold text-maroon">Exit</Link> : <form action={signOut}><button className="text-sm font-semibold text-maroon">Sign out</button></form>}
            </div>
          </header>
          <main className="flex flex-col gap-6 p-4 md:p-8">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}

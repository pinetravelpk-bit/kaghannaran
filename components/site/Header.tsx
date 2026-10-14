import Link from "next/link";
import { getDict } from "@/lib/i18n/server";
import { getCurrentUser, getSettings, isStaffRole } from "@/lib/data";
import { isDemo, isDemoAdmin } from "@/lib/supabase/config";
import { LocaleSwitch } from "./LocaleSwitch";
import { MobileMenu } from "./MobileMenu";
import { Phone, TriangleAlert, LayoutDashboard, UserRound } from "lucide-react";

export async function Header() {
  const { t, locale } = await getDict();
  const [user, settings] = await Promise.all([getCurrentUser(), getSettings()]);
  const links = [
    { href: "/places", label: t.nav.places },
    { href: "/directory?type=hotel", label: t.nav.stay },
    { href: "/directory?type=restaurant", label: t.nav.food },
    { href: "/trails", label: t.nav.trails },
    { href: "/directory?type=tour-guide", label: t.nav.guides },
    { href: "/road", label: t.nav.live },
    { href: "/community", label: t.nav.community },
  ];
  return (
    <>
      {isDemo ? (
        <div className="bg-signal px-4 py-1.5 text-center text-xs font-semibold text-ink">
          {isDemoAdmin ? <>Demo mode: showing sample data. Connect Supabase in <code className="font-mono">.env.local</code> to go live.</> : "Preview: listings marked “Sample” are examples. Business sign-up opens soon."}
        </div>
      ) : null}
      <div className="bg-board text-[13px] text-mist">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2 md:px-6">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            {settings.emergencyNumbers.map((n) => (
              <a key={n.number} href={`tel:${n.number}`} className="flex items-center gap-1.5 text-mist hover:text-signal">
                <Phone className="size-3.5" aria-hidden /> {n.label}: <b className="text-signal">{n.number}</b>
              </a>
            ))}
            {settings.alertBanner ? (
              <span className="hidden items-center gap-1.5 lg:flex"><TriangleAlert className="size-3.5 text-signal" aria-hidden /> {settings.alertBanner}</span>
            ) : null}
          </div>
          <LocaleSwitch locale={locale} />
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b-4 border-maroon bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-6 px-4 py-2 md:px-6">
          <Link href="/" aria-label="Kaghan Naran · Pine Travel, home" className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Kaghan Naran · Pine Travel" className="h-14 w-auto md:h-[68px]" />
          </Link>
          <nav aria-label="Main" className="hidden flex-wrap items-center gap-x-6 gap-y-1 text-[15px] font-medium xl:flex">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="relative text-ink after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-maroon after:transition-all hover:text-maroon hover:after:w-full">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Link href={isStaffRole(user.role) ? "/admin" : "/dashboard"} className="hidden items-center gap-2 rounded-full border border-line-2 px-4 py-2.5 text-sm font-semibold text-ink hover:border-ink sm:flex">
                {isStaffRole(user.role) ? <LayoutDashboard className="size-4" aria-hidden /> : <UserRound className="size-4" aria-hidden />}
                {isStaffRole(user.role) ? t.nav.admin : t.nav.dashboard}
              </Link>
            ) : (
              <Link href="/auth/sign-in" className="hidden rounded-full px-4 py-2.5 text-sm font-semibold text-ink hover:text-maroon sm:block">{t.nav.signIn}</Link>
            )}
            <Link href="/list-your-business" className="hidden rounded-full bg-maroon px-5 py-3 text-sm font-semibold text-white transition hover:bg-maroon-2 md:block">
              {t.nav.list}
            </Link>
            <MobileMenu links={[...links, { href: "/list-your-business", label: t.nav.list }, user ? { href: isStaffRole(user.role) ? "/admin" : "/dashboard", label: isStaffRole(user.role) ? t.nav.admin : t.nav.dashboard } : { href: "/auth/sign-in", label: t.nav.signIn }]} />
          </div>
        </div>
      </header>
    </>
  );
}

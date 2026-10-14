import Link from "next/link";
import { getDict } from "@/lib/i18n/server";
import { AlertSignup } from "./AlertSignup";

export async function Footer() {
  const { t } = await getDict();
  const cols = [
    { title: "Explore", links: [["/places", "Towns & stops"], ["/places#sights", "Lakes & viewpoints"], ["/trails", "Jeep & hiking tracks"], ["/directory?type=adventure", "Adventure activities"]] },
    { title: "Live info", links: [["/road", "Road updates"], ["/road#weather", "Weather"], ["/community#events", "Events"], ["/community#jobs", "Jobs"]] },
    { title: "Businesses", links: [["/list-your-business", "List your business"], ["/list-your-business#guides", "Register as a guide"], ["/dashboard", "My listings"], ["/auth/sign-in", "Sign in"]] },
    { title: "Pine Travel", links: [["/credits", t.footer.credits], ["mailto:[your-email]", "Contact"], ["/privacy", "Privacy"], ["/admin", "Staff login"]] },
  ];
  return (
    <footer className="bg-pine text-ground">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-14 px-4 pt-20 pb-10 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-10 border-b border-[#2E4A45] pb-12">
          <div className="flex max-w-xl flex-col gap-3">
            <span className="eyebrow text-signal">{t.footer.alerts}</span>
            <h2 className="font-display text-3xl leading-tight font-extrabold tracking-tight md:text-5xl">{t.footer.alertsTitle}</h2>
          </div>
          <AlertSignup label={t.footer.mobile} button={t.footer.getAlerts} />
        </div>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="flex flex-col gap-4 lg:col-span-1">
            <span className="self-start rounded-2xl bg-white px-4 py-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Kaghan Naran · Pine Travel" className="h-20 w-auto" />
            </span>
            <p className="max-w-64 text-fog">{t.footer.about} By Pine Travel (SMC-Private) Limited.</p>
          </div>
          {cols.map((c) => (
            <nav key={c.title} aria-label={c.title} className="flex flex-col gap-2.5">
              <span className="font-mono text-xs tracking-[0.12em] text-signal uppercase">{c.title}</span>
              {c.links.map(([href, label]) => (
                <Link key={href} href={href} className="text-ground hover:text-signal">{label}</Link>
              ))}
            </nav>
          ))}
        </div>
        <div className="flex flex-wrap justify-between gap-3 font-mono text-[13px] text-fog">
          <span>© {new Date().getFullYear()} Pine Travel (SMC-Private) Limited</span>
          <span>Balakot · Kaghan · Naran · Babusar</span>
        </div>
      </div>
    </footer>
  );
}

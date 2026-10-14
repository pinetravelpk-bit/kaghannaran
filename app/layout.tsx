import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getDict } from "@/lib/i18n/server";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Kaghan Naran · Valley Directory", template: "%s · Kaghan Naran" },
  description: "Hotels, restaurants, jeep tracks, hiking trails, guides, services, road updates and weather for the Kaghan valley — Balakot to Babusar Top.",
  icons: { icon: "/logo.png" },
  openGraph: { type: "website", siteName: "Kaghan Naran", locale: "en_PK", images: ["/logo.png"] },
};

export const viewport: Viewport = { themeColor: "#12302C" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, dir } = await getDict();
  return (
    <html lang={locale} dir={dir}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=Geist:wght@400;500;600&family=JetBrains+Mono:wght@400;600&family=Noto+Nastaliq+Urdu:wght@400;600&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getDict } from "@/lib/i18n/server";
import { SITE_URL } from "@/lib/site";
import { SITE, graph, organization, website } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

const description = "Live N-15 road status, weather, a 3D map and a directory of places, hotels, guides and emergency numbers for Kaghan Valley, from Balakot and Naran to Babusar Top.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Kaghan Naran Guide: Road Status, Weather, Places, Hotels", template: "%s | Kaghan Naran" },
  description,
  applicationName: SITE.name,
  authors: [{ name: SITE.publisher, url: SITE_URL }],
  creator: SITE.publisher,
  publisher: SITE.publisher,
  category: "travel",
  formatDetection: { telephone: true, address: false, email: false },
  openGraph: { type: "website", siteName: SITE.name, locale: "en_PK", alternateLocale: ["ur_PK"], title: "Kaghan Naran Valley Guide", description },
  twitter: { card: "summary_large_image", title: "Kaghan Naran Valley Guide", description },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION || undefined, other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined },
  // local search signals: the valley centre (Naran) in Khyber Pakhtunkhwa, Pakistan
  other: { "geo.region": "PK-KP", "geo.placename": "Kaghan Valley, Mansehra", "geo.position": `${SITE.center.lat};${SITE.center.lon}`, ICBM: `${SITE.center.lat}, ${SITE.center.lon}` },
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
        <link rel="alternate" type="text/plain" title="LLM summary" href="/llms.txt" />
        <JsonLd data={graph(organization(), website())} />
      </head>
      <body>{children}</body>
    </html>
  );
}

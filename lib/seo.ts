import type { BusinessType, Listing, Stop, Trail } from "@/lib/types";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/site";

/** Site identity and Schema.org (JSON-LD) builders shared by every page. */

export const SITE = {
  name: "Kaghan Naran",
  domain: "kaghannaran.com",
  tagline: "Kaghan Valley guide: road status, weather, places, hotels and services from Balakot to Babusar Top",
  publisher: "Pine Travel (SMC-Private) Limited",
  region: "Mansehra District, Khyber Pakhtunkhwa, Pakistan",
  center: { lat: 34.909, lon: 73.651 }, // Naran
};

export const abs = (path = "/") => new URL(path, SITE_URL).toString();
const ORG_ID = abs("/#organization");
const SITE_ID = abs("/#website");
const VALLEY_ID = abs("/#kaghan-valley");

export type QA = { q: string; a: string };

export const organization = () => ({
  "@type": "Organization",
  "@id": ORG_ID,
  name: SITE.name,
  legalName: SITE.publisher,
  url: abs("/"),
  logo: abs("/logo.png"),
  email: CONTACT_EMAIL,
  areaServed: { "@id": VALLEY_ID },
  knowsAbout: ["Kaghan Valley", "Naran", "Babusar Pass", "N-15 road", "Saif-ul-Malook Lake", "Lulusar Lake"],
});

export const website = () => ({
  "@type": "WebSite",
  "@id": SITE_ID,
  url: abs("/"),
  name: SITE.name,
  description: SITE.tagline,
  inLanguage: ["en", "ur"],
  publisher: { "@id": ORG_ID },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: abs("/directory?q={search_term_string}") },
    "query-input": "required name=search_term_string",
  },
});

export const valley = () => ({
  "@type": ["TouristDestination", "Place"],
  "@id": VALLEY_ID,
  name: "Kaghan Valley",
  alternateName: ["Kaghan Naran", "Kaghan Valley, Pakistan"],
  description: "A Himalayan valley in Mansehra District, Khyber Pakhtunkhwa, Pakistan. The N-15 road follows the Kunhar River from Balakot up to the Babusar Pass.",
  url: abs("/"),
  geo: { "@type": "GeoCoordinates", latitude: SITE.center.lat, longitude: SITE.center.lon },
  containedInPlace: { "@type": "AdministrativeArea", name: "Mansehra District", containedInPlace: { "@type": "AdministrativeArea", name: "Khyber Pakhtunkhwa", containedInPlace: { "@type": "Country", name: "Pakistan" } } },
  touristType: ["Families", "Hikers", "Road trippers", "Nature lovers"],
});

export const breadcrumbs = (items: [string, string][]) => ({
  "@type": "BreadcrumbList",
  itemListElement: [["Home", "/"] as [string, string], ...items].map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: abs(path) })),
});

export const faqPage = (qas: QA[]) => ({
  "@type": "FAQPage",
  mainEntity: qas.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
});

export function stopPlace(s: Stop, geo?: { lat: number; lon: number; ele?: number }) {
  return {
    "@type": ["TouristDestination", "Place"],
    "@id": abs(`/places/${s.slug}#place`),
    name: s.name,
    alternateName: s.nameUr,
    description: s.desc,
    url: abs(`/places/${s.slug}`),
    image: s.image,
    ...(geo ? { geo: { "@type": "GeoCoordinates", latitude: geo.lat, longitude: geo.lon, ...(s.altitude || geo.ele ? { elevation: s.altitude ?? geo.ele } : {}) } } : {}),
    containedInPlace: { "@id": VALLEY_ID },
    includesAttraction: s.places.map((p) => ({ "@type": "TouristAttraction", name: p.name, ...(p.note ? { description: p.note } : {}) })),
  };
}

const SCHEMA_TYPE: Record<string, string> = {
  hotel: "Hotel", "guest-house": "BedAndBreakfast", camping: "Campground", restaurant: "Restaurant", shop: "Store",
  "jeep-operator": "LocalBusiness", "tour-guide": "LocalBusiness", "tour-company": "TravelAgency", adventure: "SportsActivityLocation",
  health: "EmergencyService", police: "PoliceStation", "bank-atm": "BankOrCreditUnion", fuel: "GasStation", govt: "GovernmentOffice",
};

export function listingSchema(l: Listing, type?: BusinessType, stop?: Stop, geo?: { lat: number; lon: number }) {
  return {
    "@type": SCHEMA_TYPE[l.type] ?? "LocalBusiness",
    "@id": abs(`/listing/${l.slug}#business`),
    name: l.name,
    description: l.description,
    url: abs(`/listing/${l.slug}`),
    telephone: l.phone,
    ...(l.image ? { image: l.image } : {}),
    ...(type ? { additionalType: type.name } : {}),
    address: { "@type": "PostalAddress", streetAddress: l.address, addressLocality: stop?.name, addressRegion: "Khyber Pakhtunkhwa", addressCountry: "PK" },
    ...(geo ? { geo: { "@type": "GeoCoordinates", latitude: geo.lat, longitude: geo.lon } } : {}),
    areaServed: stop ? { "@id": abs(`/places/${stop.slug}#place`) } : { "@id": VALLEY_ID },
    ...(l.priceFrom ? { priceRange: `PKR ${l.priceFrom.toLocaleString("en-US")}+` } : {}),
    ...(l.rating && l.reviews ? { aggregateRating: { "@type": "AggregateRating", ratingValue: l.rating, reviewCount: l.reviews } } : {}),
    ...(typeof l.attributes.source === "string" ? { sameAs: [l.attributes.source] } : {}),
  };
}

export const trailList = (trails: Trail[]) => ({
  "@type": "ItemList",
  name: "Jeep tracks and hikes in Kaghan Valley",
  itemListElement: trails.map((t, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: { "@type": "TouristAttraction", name: t.name, description: `${t.mode} from ${t.from}, about ${t.time}.`, containedInPlace: { "@id": abs(`/places/${t.stop}#place`) } },
  })),
});

/** One JSON-LD graph per page, so entities can reference each other by @id. */
export const graph = (...nodes: object[]) => ({ "@context": "https://schema.org", "@graph": nodes });

/** Per-page metadata: canonical URL, Open Graph and Twitter cards in one place. */
/** Shorten to a search-snippet length on a word boundary. */
export const clip = (s: string, max = 158) => (s.length <= max ? s : `${s.slice(0, s.lastIndexOf(" ", max - 1))}…`);

export function pageMeta({ title, description: full, path, image, noindex, absoluteTitle }: { title: string; description: string; path: string; image?: string; noindex?: boolean; absoluteTitle?: boolean }) {
  const description = clip(full);
  const images = image ? [{ url: image, alt: title }] : undefined;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website" as const, siteName: SITE.name, locale: "en_PK", url: path, title, description, ...(images ? { images } : {}) },
    twitter: { card: "summary_large_image" as const, title, description, ...(image ? { images: [image] } : {}) },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

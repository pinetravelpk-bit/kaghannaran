import { PHOTO_FILES, commonsPage, photo, type PhotoKey } from "@/lib/media";
import { PageHero } from "@/components/site/PageHero";

export const metadata = { title: "Credits" };

export default function CreditsPage() {
  return (
    <>
      <PageHero kicker="Credits" title="Photo credits" sub="Placeholder photos are from Wikimedia Commons, used under each file’s Creative Commons licence. Open a file to see its author and licence." />
      <section className="px-4 pt-12 md:px-6">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-3 rounded-3xl border border-line bg-white p-6">
          <h2 className="font-display text-2xl font-bold">3D valley map</h2>
          <ul className="flex list-disc flex-col gap-1.5 ps-5 text-ink-2">
            <li>Satellite imagery: <a className="font-semibold text-maroon underline" href="https://s2maps.eu" target="_blank" rel="noreferrer">Sentinel-2 cloudless</a> by EOX IT Services GmbH (contains modified Copernicus Sentinel data 2016), licensed CC BY 4.0.</li>
            <li>Terrain: <a className="font-semibold text-maroon underline" href="https://registry.opendata.aws/terrain-tiles/" target="_blank" rel="noreferrer">Terrain Tiles</a> by Mapzen on AWS, from SRTM and other public elevation data.</li>
            <li>Road: N-15 route © <a className="font-semibold text-maroon underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>, ODbL.</li>
          </ul>
        </div>
      </section>
      <section className="px-4 py-12 md:px-6">
        <ul className="mx-auto grid max-w-[1320px] gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(PHOTO_FILES) as PhotoKey[]).map((k) => (
            <li key={k} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo(k, 200)} alt="" referrerPolicy="no-referrer" className="size-16 rounded-xl bg-pine object-cover" />
              <a href={commonsPage(PHOTO_FILES[k])} target="_blank" rel="noreferrer" className="text-sm font-semibold break-words text-maroon underline">{PHOTO_FILES[k]}</a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

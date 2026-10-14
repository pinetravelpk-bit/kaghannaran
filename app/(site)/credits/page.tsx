import { PHOTO_FILES, commonsPage, photo, type PhotoKey } from "@/lib/media";
import { PageHero } from "@/components/site/PageHero";

export const metadata = { title: "Photo credits" };

export default function CreditsPage() {
  return (
    <>
      <PageHero kicker="Credits" title="Photo credits" sub="Placeholder photos are from Wikimedia Commons, used under each file’s Creative Commons licence. Open a file to see its author and licence." />
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

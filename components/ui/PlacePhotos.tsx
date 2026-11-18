"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";

type P = { src: string; width: number; height: number; author?: string; authorUri?: string };

/** Fetches a listed place's Google photos once the element is near the screen. */
function usePhotos(placeId: string) {
  const ref = useRef<HTMLDivElement>(null);
  const [photos, setPhotos] = useState<P[] | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      fetch(`/api/photos/${placeId}`).then((r) => (r.ok ? r.json() : { photos: [] })).then((j) => setPhotos(j.photos ?? [])).catch(() => setPhotos([]));
    }, { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  }, [placeId]);
  return { ref, photos };
}

/** Google requires the photo author and "Google Maps" to be shown with each photo. */
function Credit({ p, className, inLink }: { p: P; className?: string; inLink?: boolean }) {
  const open = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); if (p.authorUri) window.open(p.authorUri, "_blank", "noopener"); };
  return (
    <span className={clsx("pointer-events-auto rounded-md bg-black/55 px-2 py-0.5 text-[10px] leading-tight text-white backdrop-blur", className)}>
      {p.author ? <>Photo: {p.authorUri ? (inLink ? <span role="link" tabIndex={0} onClick={open} onKeyDown={(e) => { if (e.key === "Enter") open(e as unknown as React.MouseEvent); }} className="cursor-pointer underline">{p.author}</span> : <a href={p.authorUri} target="_blank" rel="noreferrer" className="underline">{p.author}</a>) : p.author} · </> : null}Google Maps
    </span>
  );
}

/** One cover photo for a listing card. Renders the fallback until (or unless) Google returns a photo. */
export function PlaceCover({ placeId, alt, fallback }: { placeId: string; alt: string; fallback: React.ReactNode }) {
  const { ref, photos } = usePhotos(placeId);
  const [failed, setFailed] = useState(false);
  const p = photos?.[0];
  return (
    <div ref={ref} className="relative h-full w-full">
      {fallback}
      {p && !failed ? (
        <>
          <img src={`${p.src}&w=800`} alt={alt} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          <Credit p={p} inLink className="absolute right-2 bottom-2" />
        </>
      ) : null}
    </div>
  );
}

/** Photo strip for a listing page: up to six photos, each credited. Hidden when there are none. */
export function PlaceGallery({ placeId, name }: { placeId: string; name: string }) {
  const { ref, photos } = usePhotos(placeId);
  const shown = photos?.filter(Boolean) ?? [];
  return (
    <div ref={ref}>
      {shown.length ? (
        <section aria-label={`Photos of ${name}`} className="flex flex-col gap-3">
          <h2 className="font-display text-2xl font-bold">Photos</h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {shown.map((p, i) => (
              <figure key={p.src} className={clsx("relative overflow-hidden rounded-2xl bg-pine-2", i === 0 ? "col-span-2 row-span-2 aspect-[4/3] md:col-span-2" : "aspect-[4/3]")}>
                <img src={`${p.src}&w=${i === 0 ? 1200 : 600}`} alt={`${name}, photo ${i + 1}`} loading="lazy" decoding="async" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                <figcaption className="absolute right-2 bottom-2"><Credit p={p} /></figcaption>
              </figure>
            ))}
          </div>
          <p className="text-xs text-muted">Photos from Google Maps, shown with their authors. They belong to their owners.</p>
        </section>
      ) : null}
    </div>
  );
}

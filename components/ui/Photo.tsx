"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { clsx } from "clsx";

/** Lazy remote photo with a solid fallback (stock URLs can change or fail). */
export function Photo({ src, alt, className, eager }: { src?: string; alt: string; className?: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className={clsx("block overflow-hidden bg-pine-2", className)}>
      {src && !failed ? (
        <img src={src} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" onError={() => setFailed(true)} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
      ) : null}
    </span>
  );
}

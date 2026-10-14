import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import type { ReactNode } from "react";

/** Compact hero used on inner pages: photo with Ken Burns + title. */
export function PageHero({ kicker, title, sub, image, children }: { kicker: string; title: string; sub?: string; image?: string; children?: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden bg-pine text-ground">
      {image ? <Photo src={image} alt="" eager className="absolute inset-0 -z-10 h-full w-full opacity-60 [&_img]:animate-kenburns" /> : null}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#12302C_10%,rgba(18,48,44,0.6)_60%,rgba(18,48,44,0.3))] rtl:bg-[linear-gradient(270deg,#12302C_10%,rgba(18,48,44,0.6)_60%,rgba(18,48,44,0.3))]" />
      <div className="mx-auto flex max-w-[1320px] flex-col gap-4 px-4 pt-20 pb-16 md:px-6 md:pt-28">
        <Reveal><span className="eyebrow text-signal">{kicker}</span></Reveal>
        <Reveal delay={0.05}><h1 className="max-w-4xl font-display text-5xl leading-[0.95] font-extrabold tracking-tight md:text-7xl">{title}</h1></Reveal>
        {sub ? <Reveal delay={0.1}><p className="max-w-2xl text-lg text-mist">{sub}</p></Reveal> : null}
        {children}
      </div>
    </section>
  );
}

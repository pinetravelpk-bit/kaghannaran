import type { ReactNode } from "react";
import { Photo } from "@/components/ui/Photo";
import { photo } from "@/lib/media";
import { Reveal } from "@/components/ui/Reveal";

export function AuthShell({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <section className="grid min-h-[calc(100svh-140px)] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-pine lg:block">
        <Photo src={photo("lulusar")} alt="" className="absolute inset-0 h-full w-full [&_img]:animate-kenburns" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(10,23,22,0.85),transparent_60%)]" />
        <p className="absolute right-10 bottom-10 left-10 font-display text-4xl leading-tight font-extrabold text-white">From Balakot to Babusar Top. Every stop, listed.</p>
      </div>
      <div className="flex items-center justify-center px-4 py-14">
        <Reveal className="flex w-full max-w-lg flex-col gap-6">
          <div><h1 className="font-display text-5xl font-extrabold tracking-tight">{title}</h1><p className="mt-2 text-lg text-muted">{sub}</p></div>
          {children}
        </Reveal>
      </div>
    </section>
  );
}

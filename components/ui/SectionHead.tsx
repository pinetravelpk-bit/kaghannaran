import type { ReactNode } from "react";
import { Reveal } from "./Reveal";
import { clsx } from "clsx";

export function SectionHead({ num, kicker, title, sub, action, dark }: { num?: string; kicker: string; title: string; sub?: string; action?: ReactNode; dark?: boolean }) {
  return (
    <Reveal className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex max-w-3xl flex-col gap-3">
        <span className={clsx("eyebrow", dark ? "text-signal" : "text-maroon")}>{num ? `${num} · ` : ""}{kicker}</span>
        <h2 className="font-display text-4xl leading-none font-extrabold tracking-tight md:text-6xl">{title}</h2>
        {sub ? <p className={clsx("max-w-xl text-lg", dark ? "text-mist" : "text-muted")}>{sub}</p> : null}
      </div>
      {action}
    </Reveal>
  );
}

import type { ReactNode } from "react";
import { clsx } from "clsx";

export function AdminHeader({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="font-display text-4xl font-extrabold tracking-tight">{title}</h1>{sub ? <p className="mt-1 text-muted">{sub}</p> : null}</div>
      {actions}
    </div>
  );
}

export function Card({ children, className, title, action }: { children: ReactNode; className?: string; title?: string; action?: ReactNode }) {
  return (
    <section className={clsx("flex flex-col gap-4 rounded-3xl border border-line bg-white p-5 md:p-6", className)}>
      {title ? <div className="flex items-center justify-between gap-3"><h2 className="font-display text-xl font-bold">{title}</h2>{action}</div> : null}
      {children}
    </section>
  );
}

export const ago = (iso: string) => {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
};

export const hoursSince = (iso: string) => (Date.now() - new Date(iso).getTime()) / 36e5;

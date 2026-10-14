import { ChevronDown } from "lucide-react";
import type { QA } from "@/lib/seo";

/** Visible questions and answers. Pages add the matching FAQPage JSON-LD to their graph. */
export function Faq({ items, title = "Questions people ask", id = "faq" }: { items: QA[]; title?: string; id?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="flex flex-col gap-5">
      <h2 id={`${id}-title`} className="font-display text-4xl font-extrabold tracking-tight">{title}</h2>
      <div className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-white">
        {items.map((x, i) => (
          <details key={x.q} open={i === 0} className="group px-6 py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-xl font-semibold [&::-webkit-details-marker]:hidden">
              <h3>{x.q}</h3>
              <ChevronDown className="size-5 shrink-0 transition group-open:rotate-180" aria-hidden />
            </summary>
            <p className="mt-3 max-w-3xl text-lg leading-relaxed text-ink-2">{x.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

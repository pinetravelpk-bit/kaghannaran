import Link from "next/link";
import { Construction, Phone } from "lucide-react";

/** Live road status and the KP tourist helpline, the two quickest ways to check conditions before leaving. */
export function AlertSignup({ label, button }: { label: string; button: string }) {
  return (
    <div className="flex w-full max-w-md flex-wrap gap-2.5">
      <Link href="/road" className="flex min-h-13 flex-1 items-center justify-center gap-2 rounded-xl bg-amber px-6 font-semibold text-ink transition hover:bg-signal">
        <Construction className="size-4" aria-hidden />{button}
      </Link>
      <a href="tel:1422" className="flex min-h-13 flex-1 items-center justify-center gap-2 rounded-xl border border-[#3C5A55] px-6 font-semibold text-ground hover:border-signal">
        <Phone className="size-4" aria-hidden />{label}
      </a>
    </div>
  );
}

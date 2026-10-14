"use client";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, AlertCircle, FlaskConical } from "lucide-react";
import type { ActionResult } from "@/lib/actions/util";

type T = { id: number; ok: boolean; demo?: boolean; message: string };
const Ctx = createContext<(r: ActionResult) => void>(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<T[]>([]);
  const push = useCallback((r: ActionResult) => {
    const id = Date.now() + Math.random();
    setItems((x) => [...x, { id, ok: r.ok, demo: r.demo, message: r.message }]);
    setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 4200);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed right-4 bottom-4 z-[70] flex w-[min(380px,calc(100vw-32px))] flex-col gap-2">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div key={t.id} layout initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: 40 }} className={`pointer-events-auto flex items-start gap-3 rounded-2xl p-4 text-sm font-medium shadow-2xl ${t.ok ? "bg-ink text-ground" : "bg-red-700 text-white"}`}>
              {t.demo ? <FlaskConical className="mt-0.5 size-5 shrink-0 text-signal" /> : t.ok ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-400" /> : <AlertCircle className="mt-0.5 size-5 shrink-0" />}
              <span>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

"use client";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";

type Toast = { id: number; text: string };
const Ctx = createContext<(text: string) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const n = useRef(0);
  const show = useCallback((text: string) => {
    const id = ++n.current;
    setItems((a) => [...a, { id, text }]);
    setTimeout(() => setItems((a) => a.filter((x) => x.id !== id)), 3200);
  }, []);
  return (
    <Ctx.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-[80] flex flex-col items-center gap-2 px-4 lg:bottom-8">
        {items.map((t) => (
          <div key={t.id} className="pointer-events-auto flex items-center gap-2 rounded-btn bg-graphite-900 px-4 py-3 text-sm text-white shadow-soft animate-rise">
            <CheckCircle2 size={18} className="text-[#9AD9B4]" aria-hidden />
            {t.text}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);

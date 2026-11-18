"use client";
import { useEffect, useState, type RefObject } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../ui/primitives";

/**
 * Телефон: пока карточка с результатом не видна (человек заполняет поля выше),
 * внизу экрана висит плашка с главной цифрой. Тап — прокрутка к результату.
 */
export function StickyResult({ target, area, label, value, tone = "brand" }: {
  target: RefObject<HTMLElement | null>;
  area: RefObject<HTMLElement | null>;
  label: string;
  value: string;
  tone?: "brand" | "success" | "warning" | "error";
}) {
  const [targetVisible, setTargetVisible] = useState(true);
  const [inArea, setInArea] = useState(false);
  useEffect(() => {
    const t = target.current, a = area.current;
    if (!t || !a) return;
    const io1 = new IntersectionObserver(([e]) => setTargetVisible(e.isIntersecting), { threshold: 0.25 });
    const io2 = new IntersectionObserver(([e]) => setInArea(e.isIntersecting), { threshold: 0 });
    io1.observe(t);
    io2.observe(a);
    return () => { io1.disconnect(); io2.disconnect(); };
  }, [target, area]);
  const show = inArea && !targetVisible;
  return (
    <button
      type="button"
      onClick={() => target.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      className={cn(
        "fixed bottom-5 left-3 right-[84px] z-40 flex min-h-14 items-center gap-3 rounded-card bg-graphite-900 py-2.5 pl-4 pr-3 text-left text-white shadow-[0_12px_40px_-12px_rgba(0,0,0,.5)] transition-all duration-300 lg:hidden",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs text-ondark">{label}</span>
        <span className={cn("num block truncate text-xl font-bold tracking-tight",
          tone === "brand" && "text-brand-200", tone === "success" && "text-[#9AD9B4]", tone === "warning" && "text-[#F5C26B]", tone === "error" && "text-[#FF9B85]")}>
          {value}
        </span>
      </span>
      <ChevronDown size={18} className="shrink-0 text-ondark" aria-hidden />
    </button>
  );
}

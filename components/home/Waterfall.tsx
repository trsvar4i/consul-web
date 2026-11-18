"use client";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { formatNum, formatShort } from "@/lib/format";
import { cn } from "../ui/primitives";

/** Выручка → закупки → расходы → остаток: столбики «опускаются» при прокрутке до блока. */
export function Waterfall({ rows }: { rows: { label: string; value: number }[] }) {
  const locale = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setOn(true), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const max = rows[0].value;
  const bars: { label: string; value: number; bottom: number; height: number; last: boolean }[] = [];
  for (let i = 0, level = 0; i < rows.length; i++) {
    const r = rows[i];
    const last = i === rows.length - 1;
    if (i === 0) level = r.value;
    else if (!last) level += r.value;
    bars.push({ ...r, bottom: i === 0 || last ? 0 : level, height: Math.abs(r.value), last });
  }

  return (
    <div ref={ref} className="rounded-block bg-graphite-800 p-5 sm:p-7">
      <div className="flex h-56 items-end gap-3 sm:h-64 sm:gap-5" aria-hidden>
        {bars.map((b, i) => (
          <div key={b.label} className="relative h-full flex-1">
            <div
              className={cn(
                "absolute inset-x-0 rounded-[10px] transition-all duration-700 ease-out",
                i === 0 ? "bg-white/85" : b.last ? "bg-brand-400" : "bg-white/20",
              )}
              style={{
                bottom: `${(b.bottom / max) * 100}%`,
                height: on ? `${(b.height / max) * 100}%` : "0%",
                transitionDelay: `${i * 220}ms`,
              }}
            />
          </div>
        ))}
      </div>
      <dl className="mt-4 grid grid-cols-4 gap-3 sm:gap-5">
        {bars.map((b) => (
          <div key={b.label}>
            <dt className="text-[11px] leading-tight text-ondark sm:text-xs">{b.label}</dt>
            <dd className={cn("num mt-1 text-xs font-semibold sm:text-base", b.last ? "text-brand-400" : "text-white")}>
              <span className="sm:hidden">{b.value < 0 ? "−" : ""}{formatShort(Math.abs(b.value), locale)}</span><span className="hidden sm:inline">{b.value < 0 ? "−" : ""}{formatNum(Math.abs(b.value))}</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

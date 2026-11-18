"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AlertTriangle, ArrowUp, Camera, Check, Mic } from "lucide-react";
import { currency, formatNum } from "@/lib/format";

/**
 * Живой макет приложения в герое: пользователь «пишет» фразу,
 * Consul распознаёт операцию и пересчитывает «можно потратить».
 */
export function HeroCard({ amount }: { amount: number }) {
  const t = useTranslations("landing");
  const h = useTranslations("home");
  const locale = useLocale();
  const before = amount + 3_000_000;
  const [v, setV] = useState(before);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState(0); // 0 typing, 1 sent, 2 out1, 3 out2+recalc

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const full = t("mockIn");
    const timers: ReturnType<typeof setTimeout>[] = [];
    let raf = 0;
    const animate = (from: number, to: number) => {
      const t0 = performance.now();
      const step = (now: number) => {
        const p = reduce ? 1 : Math.min(1, (now - t0) / 900);
        setV(from + (to - from) * (1 - Math.pow(1 - p, 3)));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const run = () => {
      setPhase(0);
      setTyped("");
      setV(before);
      const speed = reduce ? 0 : 55;
      for (let i = 1; i <= full.length; i++) timers.push(setTimeout(() => setTyped(full.slice(0, i)), 600 + i * speed));
      const sent = 600 + full.length * speed + 400;
      timers.push(setTimeout(() => { setPhase(1); setTyped(""); }, sent));
      timers.push(setTimeout(() => setPhase(2), sent + 700));
      timers.push(setTimeout(() => { setPhase(3); animate(before, amount); }, sent + 1400));
      if (!reduce) timers.push(setTimeout(run, sent + 7000));
    };
    run();
    return () => { timers.forEach(clearTimeout); cancelAnimationFrame(raf); };
  }, [amount, before, t]);

  return (
    <div className="relative mx-auto w-full max-w-[420px]">
      {/* знак бренда за макетом: «стороны встречаются» */}
      <div aria-hidden className="absolute -right-6 -top-10 size-40 sm:-right-12 sm:size-48">
        <div className="absolute left-0 top-0 size-[64%] rounded-card bg-brand-500" />
        <div className="absolute bottom-0 right-0 size-[64%] rounded-card bg-brand-200" />
        <div className="absolute left-[36%] top-[36%] size-[28%] rounded-[10px] bg-brand-400" />
      </div>

      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-mist text-graphite-900 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55)]">
        <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-3">
          <span className="grid size-7 place-items-center rounded-full bg-graphite-900 text-xs font-semibold text-white">{t("mockBiz").slice(0, 1)}</span>
          <span className="truncate text-sm font-medium">{t("mockBiz")}</span>
        </div>

        <div className="space-y-3 p-4">
          <div className="rounded-card bg-graphite-900 p-4 text-white">
            <p className="text-xs text-ondark">{h("mockLabel")} · {h("mockPeriod")}</p>
            <p className="num mt-1 text-[36px] font-bold leading-none tracking-tight">
              {formatNum(v)} <span className="text-base font-semibold text-brand-400">{currency(locale)}</span>
            </p>
            <svg viewBox="0 0 400 50" className="mt-3 h-10 w-full" aria-hidden>
              <path d="M0,40 L40,34 L80,36 L120,22 L160,30 L200,18 L240,24 L280,12 L320,16 L360,6 L400,4" fill="none" stroke="#E0566D" strokeWidth="2.5" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-btn bg-white p-3">
              <p className="text-[11px] text-gray-700">{h("exRevenue").split(" (")[0]}</p>
              <p className="num text-sm font-semibold">50 000 000</p>
            </div>
            <div className="flex items-start gap-1.5 rounded-btn bg-white p-3">
              <AlertTriangle size={14} className="mt-0.5 shrink-0 text-warning" aria-hidden />
              <p className="text-[12px] leading-snug text-warning">{t("mockAlert")}</p>
            </div>
          </div>

          {/* «чат» */}
          <div className="min-h-[112px] space-y-1.5" aria-live="off">
            {phase >= 1 && (
              <div className="flex justify-end animate-rise">
                <span className="rounded-card rounded-tr-md bg-graphite-900 px-3 py-2 text-[13px] text-white">{t("mockIn")}</span>
              </div>
            )}
            {phase >= 2 && (
              <p className="flex items-center gap-1.5 text-[12px] text-success animate-rise"><Check size={14} aria-hidden />{t("mockOut1")}</p>
            )}
            {phase >= 3 && (
              <p className="flex items-center gap-1.5 text-[12px] text-success animate-rise"><Check size={14} aria-hidden />{t("mockOut2")}</p>
            )}
          </div>

          <div className="flex items-center gap-1.5 rounded-card border border-gray-200 bg-white p-1.5">
            <span className="min-h-8 flex-1 truncate px-2 py-1.5 text-[13px]">
              {typed ? <span>{typed}<span className="ml-px inline-block h-4 w-px animate-pulse bg-graphite-900 align-middle" /></span> : <span className="text-gray-500">{t("mockInput")}</span>}
            </span>
            <Camera size={16} className="text-gray-500" aria-hidden />
            <Mic size={16} className="text-gray-500" aria-hidden />
            <span className="grid size-8 place-items-center rounded-[9px] bg-brand-500 text-white"><ArrowUp size={15} aria-hidden /></span>
          </div>
        </div>
      </div>
    </div>
  );
}

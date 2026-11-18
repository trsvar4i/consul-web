"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AlertTriangle, BookOpen } from "lucide-react";
import { currency, formatNum } from "@/lib/format";
import { Logo } from "../brand/Logo";
import { cn } from "../ui/primitives";

const VALUES = [11_500_000, -3_000_000, -2_500_000, -600_000, -1_200_000];
const TOTAL = 4_200_000;

/**
 * «Тетрадь → Consul»: одни и те же записи — сначала как в тетради, потом как точный расчёт.
 * Переключается само каждые 4,5 с, пока человек не нажмёт сам.
 */
export function NotebookSwitch() {
  const t = useTranslations("notebook");
  const locale = useLocale();
  const [mode, setMode] = useState<"note" | "consul">("note");
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!auto || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setMode((m) => (m === "note" ? "consul" : "note")), 4500);
    return () => clearInterval(id);
  }, [auto]);

  const lines = t.raw("lines") as string[];
  const rows = t.raw("rows") as string[];
  const choose = (m: "note" | "consul") => { setMode(m); setAuto(false); };

  return (
    <div>
      <div role="tablist" aria-label={t("title")} className="inline-flex rounded-full border border-gray-200 bg-white p-1">
        {(["note", "consul"] as const).map((m) => (
          <button key={m} role="tab" aria-selected={mode === m} onClick={() => choose(m)}
            className={cn("relative inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-medium transition-colors duration-300",
              mode === m ? "bg-graphite-900 text-white" : "text-gray-700 hover:text-graphite-900")}>
            {m === "note" ? <BookOpen size={16} aria-hidden /> : <Logo size={18} markOnly />}
            {m === "note" ? t("tabNote") : t("tabConsul")}
            {mode === m && auto && <span key={mode} aria-hidden className="absolute inset-x-5 bottom-1 h-px origin-left bg-brand-400 [animation:nbgrow_4.5s_linear]" />}
          </button>
        ))}
      </div>

      <div className="relative mt-6 grid">
        {/* Тетрадь */}
        <div
          aria-hidden={mode !== "note"}
          className={cn("col-start-1 row-start-1 overflow-hidden rounded-block border border-[#E9E2D0] bg-[#FBF8F1] p-6 transition-all duration-700 ease-[cubic-bezier(.2,.7,.1,1)] sm:p-8",
            mode === "note" ? "opacity-100 blur-0 rotate-[-0.6deg]" : "pointer-events-none opacity-0 blur-[8px] rotate-[1.5deg] scale-[0.97]")}
          style={{ backgroundImage: "linear-gradient(transparent 39px, #DDE3EC 40px)", backgroundSize: "100% 40px", backgroundPosition: "0 22px" }}
        >
          <span aria-hidden className="absolute bottom-0 left-12 top-0 w-px bg-brand-200 sm:left-16" />
          <ul className="relative space-y-[16px] pl-10 sm:pl-14">
            {lines.map((l, i) => (
              <li key={i} className={cn("text-[17px] italic leading-6 text-[#2E3A59] sm:text-[19px]", i === 2 && "line-through decoration-brand-400/70", i === 4 && "text-[#2E3A59]/70")}
                style={{ transform: `rotate(${[-0.8, 0.6, -0.4, 0.9, -0.5, 0.3][i % 6]}deg) translateX(${[0, 6, 2, 10, 4, 0][i % 6]}px)` }}>
                {l}
              </li>
            ))}
          </ul>
          <div className="relative mt-6 pl-10 sm:pl-14">
            <p className="text-[19px] font-semibold italic text-[#2E3A59]">{t("q")}</p>
            <p className="mt-1 inline-block -rotate-2 text-[22px] italic text-brand-500 underline decoration-wavy decoration-brand-200 underline-offset-4">{t("qNote")}</p>
          </div>
        </div>

        {/* Consul */}
        <div
          aria-hidden={mode !== "consul"}
          className={cn("col-start-1 row-start-1 rounded-block border border-gray-200 bg-white p-6 shadow-soft transition-all duration-700 ease-[cubic-bezier(.2,.7,.1,1)] sm:p-8",
            mode === "consul" ? "opacity-100 blur-0" : "pointer-events-none opacity-0 blur-[8px] translate-y-3")}
        >
          <dl className="num">
            {rows.map((r, i) => (
              <div key={r} className="flex items-baseline justify-between gap-4 border-b border-gray-200 py-3 transition-all duration-500"
                style={{ transitionDelay: mode === "consul" ? `${150 + i * 90}ms` : "0ms", opacity: mode === "consul" ? 1 : 0, transform: mode === "consul" ? "none" : "translateY(8px)" }}>
                <dt className={cn("min-w-0 text-[14px] leading-snug sm:text-[15px]", i === 0 ? "font-medium text-graphite-900" : "text-gray-700")}>{r}</dt>
                <dd className={cn("shrink-0 whitespace-nowrap text-[16px] font-semibold sm:text-[17px]", i === 0 ? "text-graphite-900" : "text-graphite-900/80")}>{VALUES[i] < 0 ? "−" : ""}{formatNum(Math.abs(VALUES[i]))}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-3 transition-all duration-700"
            style={{ transitionDelay: mode === "consul" ? "650ms" : "0ms", opacity: mode === "consul" ? 1 : 0 }}>
            <p className="text-sm font-medium text-gray-700">{t("total")}</p>
            <p className="num text-[40px] font-bold leading-none tracking-tight text-brand-500 sm:text-[52px]">
              {formatNum(TOTAL)} <span className="text-lg font-semibold text-graphite-900">{currency(locale)}</span>
            </p>
          </div>
          <p className="mt-5 flex items-start gap-2 rounded-btn bg-warning-50 px-3 py-2.5 text-sm text-graphite-900 transition-opacity duration-700"
            style={{ transitionDelay: mode === "consul" ? "850ms" : "0ms", opacity: mode === "consul" ? 1 : 0 }}>
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-warning" aria-hidden /> {t("debt")}
          </p>
        </div>
      </div>
      <style>{`@keyframes nbgrow{from{transform:scaleX(0)}to{transform:scaleX(1)}}`}</style>
    </div>
  );
}

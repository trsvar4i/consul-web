"use client";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { currency } from "@/lib/format";

const VALUE = "4 200 000";

/** Один барабан одометра: столбик 0–9, прокручивается к нужной цифре. */
function Reel({ digit, on, delay }: { digit: number; on: boolean; delay: number }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.62em] overflow-hidden align-top">
      <span
        className="absolute left-0 top-0 flex flex-col transition-transform duration-[1800ms] ease-[cubic-bezier(.2,.75,.1,1)] motion-reduce:transition-none"
        style={{ transform: `translateY(-${(on ? digit + 20 : 0) * 1}em)`, transitionDelay: `${delay}ms` }}
      >
        {Array.from({ length: 30 }, (_, i) => (
          <span key={i} className="block h-[1em] leading-[1em]">{i % 10}</span>
        ))}
      </span>
    </span>
  );
}

/**
 * Финал подвала: главная цифра продукта прокручивается барабанами,
 * как табло, и встаёт на «можно безопасно потратить».
 */
export function FooterBand() {
  const t = useTranslations("footer");
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

  return (
    <div ref={ref} className="relative overflow-hidden border-t border-white/10">
      {/* линии «бухгалтерской книги» */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px)] [background-size:100%_44px]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[70%] -translate-x-1/2 rounded-full bg-brand-500/25 blur-[120px]" />
      <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-12 sm:px-6 lg:pb-20 lg:pt-16">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ondark">{t("finaleKicker")}</p>
        <p className="num mt-4 whitespace-nowrap text-[17vw] font-semibold leading-none tracking-[-0.05em] text-white sm:text-[14vw] lg:text-[184px]" aria-label={`${VALUE} ${currency(locale)}`}>
          <span aria-hidden>
            {VALUE.split("").map((ch, i) =>
              ch === " " ? <span key={i} className="inline-block w-[0.22em]" /> : <Reel key={i} digit={Number(ch)} on={on} delay={VALUE.slice(0, i).replace(/ /g, "").length * 110} />,
            )}
          </span>
          <span aria-hidden className="ml-[0.12em] text-[0.32em] font-semibold tracking-[-0.02em] text-brand-400">{currency(locale)}</span>
        </p>
        <div className="mt-6 flex flex-col gap-5 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-[15px] text-ondark">
            <span className="text-white">{t("finaleLabel")}.</span> {t("finaleNote")}
          </p>
          <Link href="/login" className="inline-flex h-12 shrink-0 items-center gap-2 self-start rounded-full bg-white px-6 font-medium text-graphite-900 transition-colors hover:bg-brand-50">
            {t("finaleCta")} <ArrowRight size={18} aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { BookOpenCheck, Check, GitCompareArrows, HandCoins, Landmark, Scale } from "lucide-react";
import { Logo } from "../brand/Logo";
import { GlowGrid } from "../fx/GlowGrid";
import { cn } from "../ui/primitives";

const ICONS = [BookOpenCheck, Scale, Landmark, HandCoins, GitCompareArrows];
const STEPS = 5;
const clamp = (v: number) => Math.max(0, Math.min(1, v));

/**
 * Закреплённая сцена: телефон стоит на месте, а при прокрутке в нём по шагам
 * проигрываются 5 сценариев «скажите — Consul посчитает». Слева — главы с прогрессом.
 */
export function PhoneStory() {
  const t = useTranslations("landing");
  const ref = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const total = r.height - window.innerHeight;
        setP(total > 0 ? clamp(-r.top / total) : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const pos = p * STEPS;
  const active = Math.min(STEPS - 1, Math.floor(pos));
  const local = clamp(pos - active);
  const typing = local < 0.28 && !(active === STEPS - 1 && p >= 0.999);

  const jump = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: el.offsetTop + total * ((i + 0.45) / STEPS), behavior: "smooth" });
  };

  return (
    <section ref={ref} className="relative bg-graphite-900 text-white" style={{ height: `${STEPS * 85 + 100}vh` }} aria-label={t("featTitle")}>
      <div className="sticky top-16 flex h-[calc(100dvh-4rem)] items-center overflow-hidden">
        <GlowGrid />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-6 px-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:gap-16">
          {/* Главы */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ondark"><span className="num text-brand-400">02</span>&nbsp;&nbsp;{t("featEyebrow")}</p>
            <h2 className="mt-3 max-w-xl text-[26px] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[34px] lg:text-[48px]">{t("featTitle")}</h2>
            <ol className="mt-6 hidden space-y-1 lg:block">
              {Array.from({ length: STEPS }, (_, i) => {
                const Icon = ICONS[i];
                const on = i === active;
                const fill = i < active ? 1 : on ? local : 0;
                return (
                  <li key={i}>
                    <button onClick={() => jump(i)} className={cn("group relative flex w-full items-center gap-4 overflow-hidden rounded-btn px-3 py-3 text-left transition-colors", on ? "bg-white/[0.06]" : "hover:bg-white/[0.04]")}>
                      <span className={cn("num text-sm", on ? "text-brand-400" : "text-white/35")}>0{i + 1}</span>
                      <Icon size={18} className={on ? "text-white" : "text-white/40"} aria-hidden />
                      <span className={cn("text-lg font-medium transition-colors", on ? "text-white" : "text-white/45")}>{t(`f${i + 1}`)}</span>
                      <span aria-hidden className="absolute bottom-0 left-0 h-px bg-brand-400 transition-[width] duration-150" style={{ width: `${fill * 100}%` }} />
                    </button>
                  </li>
                );
              })}
            </ol>
            {/* Подпись под телефоном на мобильном / под главами на десктопе */}
            <div className="relative mt-4 min-h-[56px] lg:mt-8">
              {Array.from({ length: STEPS }, (_, i) => (
                <p key={i} className={cn("absolute inset-0 text-[15px] text-ondark transition-all duration-500 lg:text-base", i === active ? "opacity-100 blur-0" : "pointer-events-none opacity-0 blur-[6px]")}>
                  <span className="text-white">{t(`f${i + 1}`)}.</span> {t(`f${i + 1}mLabel`)}: <span className="num font-semibold text-white">{t(`f${i + 1}mValue`)}</span>
                </p>
              ))}
            </div>
          </div>

          {/* Телефон */}
          <div className="mx-auto lg:mx-0">
            <div className="relative h-[min(62dvh,600px)] w-[min(31dvh,300px)] min-w-[240px] rounded-[44px] border border-white/15 bg-[#14171B] p-2.5 shadow-[0_40px_120px_-30px_rgba(224,86,109,0.35)]">
              <div className="absolute left-1/2 top-3.5 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-black" aria-hidden />
              <div className="flex h-full flex-col overflow-hidden rounded-[36px] bg-mist text-graphite-900">
                <div className="flex items-center gap-2 bg-white px-4 pb-2.5 pt-9">
                  <Logo size={20} markOnly />
                  <span className="text-[13px] font-semibold">{t("mockBiz").split(" · ")[0]}</span>
                </div>
                {/* метрика текущего шага */}
                <div className="px-3 pt-3">
                  <div className="rounded-[16px] bg-graphite-900 px-3.5 py-3 text-white">
                    <p key={`l${active}`} className="text-[11px] text-ondark animate-rise">{t(`f${active + 1}mLabel`)}</p>
                    <p key={`v${active}`} className="num mt-0.5 text-[26px] font-bold leading-tight tracking-tight animate-rise">{t(`f${active + 1}mValue`)}</p>
                  </div>
                </div>
                {/* чат: все шаги до текущего */}
                <div className="flex flex-1 flex-col justify-end gap-2 overflow-hidden px-3 pb-3 pt-2">
                  {Array.from({ length: active + 1 }, (_, i) => i).slice(-2).map((i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-end">
                        <span className="max-w-[85%] rounded-[14px] rounded-tr-md bg-graphite-900 px-3 py-2 text-[12.5px] leading-snug text-white">{t(`f${i + 1}in`)}</span>
                      </div>
                      {i === active && typing ? (
                        <div className="flex gap-1 rounded-[14px] rounded-tl-md bg-white px-3 py-2.5 w-fit" aria-hidden>
                          {[0, 1, 2].map((d) => <span key={d} className="size-1.5 rounded-full bg-gray-500 animate-blink" style={{ animationDelay: `${d * 0.18}s` }} />)}
                        </div>
                      ) : (
                        <div className="max-w-[92%] rounded-[14px] rounded-tl-md bg-white px-3 py-2 text-[12.5px] leading-snug animate-rise">
                          {t(`f${i + 1}out`)}
                          <span className="mt-1 flex items-center gap-1 text-[11px] text-success"><Check size={12} aria-hidden /> Consul</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* мобильные точки прогресса */}
            <div className="mt-4 flex justify-center gap-1.5 lg:hidden" aria-hidden>
              {Array.from({ length: STEPS }, (_, i) => <span key={i} className={cn("h-1.5 rounded-full transition-all", i === active ? "w-6 bg-brand-400" : "w-1.5 bg-white/25")} />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

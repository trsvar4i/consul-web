"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { BookOpenCheck, Check, GitCompareArrows, HandCoins, Landmark, Pause, Play, Scale } from "lucide-react";
import { Logo } from "../brand/Logo";
import { GlowGrid } from "../fx/GlowGrid";
import { cn } from "../ui/primitives";

const ICONS = [BookOpenCheck, Scale, Landmark, HandCoins, GitCompareArrows];
const STEPS = 5;
const STEP_MS = 4800;
const TYPING_MS = 1100;

/**
 * Сцена «Как это выглядит»: телефон сам проигрывает 5 сценариев по таймеру.
 * Пауза — при наведении, кнопкой и когда блок не на экране. Главы кликабельны.
 */
export function PhoneStory() {
  const t = useTranslations("landing");
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef(0);
  const chipsRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read media query once
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const running = visible && !paused && !hover && !reduced;
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      elapsedRef.current += now - last;
      last = now;
      if (elapsedRef.current >= STEP_MS) {
        elapsedRef.current = 0;
        setActive((a) => (a + 1) % STEPS);
      }
      setElapsed(elapsedRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  // телефон: докрутить ленту так, чтобы текущая глава была по центру
  useEffect(() => {
    const row = chipsRef.current;
    const chip = row?.children[active] as HTMLElement | undefined;
    if (!row || !chip) return;
    row.scrollTo({ left: chip.offsetLeft - (row.clientWidth - chip.clientWidth) / 2, behavior: "smooth" });
  }, [active]);

  const go = (i: number) => { elapsedRef.current = 0; setActive(i); setElapsed(0); };
  const typing = !reduced && elapsed < TYPING_MS;
  const local = elapsed / STEP_MS;

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-graphite-900 py-14 text-white sm:py-20 lg:py-28"
      aria-label={t("featTitle")}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHover(false)}
    >
      <GlowGrid />
      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:gap-16">
        {/* Главы */}
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ondark"><span className="num text-brand-400">02</span>&nbsp;&nbsp;{t("featEyebrow")}</p>
          <h2 className="mt-3 max-w-xl text-[28px] font-semibold leading-[1.06] tracking-[-0.025em] sm:text-[36px] lg:text-[52px]">{t("featTitle")}</h2>
          <p className="mt-4 max-w-lg text-lg text-ondark">{t("featSub")}</p>
          <ol className="mt-8 hidden space-y-1 lg:block">
            {Array.from({ length: STEPS }, (_, i) => {
              const Icon = ICONS[i];
              const on = i === active;
              return (
                <li key={i}>
                  <button onClick={() => go(i)} aria-current={on ? "step" : undefined}
                    className={cn("group relative flex w-full items-center gap-4 overflow-hidden rounded-btn px-3 py-3 text-left transition-colors", on ? "bg-white/[0.07]" : "hover:bg-white/[0.04]")}>
                    <span className={cn("num text-sm", on ? "text-brand-400" : "text-white/35")}>0{i + 1}</span>
                    <Icon size={18} className={on ? "text-white" : "text-white/40"} aria-hidden />
                    <span className={cn("text-lg font-medium transition-colors", on ? "text-white" : "text-white/50")}>{t(`f${i + 1}`)}</span>
                    {on && <span className="ml-auto hidden text-sm text-ondark sm:block">{t(`f${i + 1}mLabel`)}</span>}
                    <span aria-hidden className="absolute bottom-0 left-0 h-px bg-brand-400" style={{ width: `${(on ? (reduced ? 1 : local) : 0) * 100}%` }} />
                  </button>
                </li>
              );
            })}
          </ol>
          <button onClick={() => setPaused((p) => !p)} className="mt-4 hidden lg:inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm text-ondark hover:text-white" aria-pressed={paused}>
            {paused ? <Play size={15} aria-hidden /> : <Pause size={15} aria-hidden />} {paused ? t("play") : t("pause")}
          </button>
        </div>

        {/* Телефон */}
        <div className="mx-auto w-full min-w-0 lg:mx-0 lg:w-auto">
          {/* Телефон: главы лентой над экраном */}
          <div ref={chipsRef} className="-mx-4 mb-5 flex gap-2 overflow-x-auto scroll-smooth px-4 pb-1 [scrollbar-width:none] lg:hidden" role="tablist" aria-label={t("featEyebrow")}>
            {Array.from({ length: STEPS }, (_, i) => {
              const Icon = ICONS[i];
              const on = i === active;
              return (
                <button key={i} role="tab" aria-selected={on} onClick={() => go(i)}
                  className={cn("relative inline-flex min-h-11 shrink-0 items-center gap-2 overflow-hidden rounded-full border px-4 text-sm font-medium transition-colors",
                    on ? "border-white bg-white text-graphite-900" : "border-white/15 text-white/70")}>
                  <Icon size={16} aria-hidden /> {t(`f${i + 1}`)}
                  {on && <span aria-hidden className="absolute bottom-0 left-0 h-0.5 bg-brand-500" style={{ width: `${(reduced ? 1 : local) * 100}%` }} />}
                </button>
              );
            })}
            <button onClick={() => setPaused((p) => !p)} aria-label={paused ? t("play") : t("pause")} className="grid size-11 shrink-0 place-items-center rounded-full border border-white/15 text-white/70">
              {paused ? <Play size={15} aria-hidden /> : <Pause size={15} aria-hidden />}
            </button>
          </div>
          <div className="relative mx-auto h-[600px] w-[292px] rounded-[46px] border border-white/15 bg-[#14171B] p-2.5 shadow-[0_40px_120px_-30px_rgba(224,86,109,0.35)] max-sm:h-[540px] max-sm:w-[264px]">
            <div className="absolute left-1/2 top-3.5 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-black" aria-hidden />
            <div className="flex h-full flex-col overflow-hidden rounded-[38px] bg-mist text-graphite-900">
              <div className="flex items-center gap-2 bg-white px-4 pb-2.5 pt-9">
                <Logo size={20} markOnly />
                <span className="text-[13px] font-semibold">{t("mockBiz").split(" · ")[0]}</span>
              </div>
              <div className="px-3 pt-3">
                <div className="rounded-[16px] bg-graphite-900 px-3.5 py-3 text-white">
                  <p key={`l${active}`} className="text-[11px] text-ondark animate-rise">{t(`f${active + 1}mLabel`)}</p>
                  <p key={`v${active}-${typing}`} className={cn("num mt-0.5 text-[26px] font-bold leading-tight tracking-tight", !typing && "animate-rise")}>
                    {typing ? "···" : t(`f${active + 1}mValue`)}
                  </p>
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-end gap-2 overflow-hidden px-3 pb-3 pt-2" aria-live="polite">
                {[active - 1, active].filter((i) => i >= 0).map((i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-end animate-rise">
                      <span className="max-w-[85%] rounded-[14px] rounded-tr-md bg-graphite-900 px-3 py-2 text-[12.5px] leading-snug text-white">{t(`f${i + 1}in`)}</span>
                    </div>
                    {i === active && typing ? (
                      <div className="flex w-fit gap-1 rounded-[14px] rounded-tl-md bg-white px-3 py-2.5" aria-hidden>
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
        </div>
      </div>
    </section>
  );
}

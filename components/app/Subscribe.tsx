"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Check, Landmark, Loader2, MessageCircle, Wallet } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { choosePlan, getPlan, getSession, PLANS, type PlanId } from "@/lib/api";
import { Logo } from "../brand/Logo";
import { LanguageSwitcher } from "../layout/LanguageSwitcher";
import { GlowGrid } from "../fx/GlowGrid";
import { Reveal, Spotlight } from "../fx/fx";
import { cn } from "../ui/primitives";

const ICON: Record<PlanId, typeof Wallet> = { start: Wallet, business: MessageCircle, bank: Landmark };

/** Экран выбора подписки после входа: три карточки, средняя выделена бегущим лучом. */
export function Subscribe() {
  const t = useTranslations("plans");
  const router = useRouter();
  const [current, setCurrent] = useState<PlanId | null>(null);
  const rail = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(1);
  // телефон: сразу показать выделенную подписку «Бизнес»
  useEffect(() => {
    const r = rail.current;
    if (!r || window.innerWidth >= 1024) return;
    const mid = r.children[1] as HTMLElement | undefined;
    if (mid) r.scrollLeft = mid.offsetLeft - (r.clientWidth - mid.clientWidth) / 2;
  }, []);
  const [busy, setBusy] = useState<PlanId | null>(null);
  const [done, setDone] = useState<PlanId | null>(null);

  useEffect(() => {
    if (!getSession()) {
      router.replace("/login");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read saved plan
    setCurrent(getPlan());
  }, [router]);

  const pick = async (p: PlanId) => {
    setBusy(p);
    await choosePlan(p);
    setDone(p);
    setTimeout(() => router.push("/app"), 650);
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-graphite-900 text-white">
      <GlowGrid />
      <header className="relative flex items-center justify-between p-4 sm:p-6">
        <Logo size={32} tone="dark" />
        <LanguageSwitcher onDark />
      </header>
      <main id="main" className="relative mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <Reveal className="mx-auto max-w-2xl pt-6 text-center lg:pt-10">
          <h1 className="text-[34px] font-semibold leading-[1.05] tracking-[-0.03em] lg:text-[56px]">{t("h1")}</h1>
          <p className="mt-4 text-lg text-ondark">{t("sub")}</p>
        </Reveal>

        <div ref={rail} onScroll={(e) => { const r = e.currentTarget; const w = (r.children[0] as HTMLElement | undefined)?.clientWidth ?? 1; setSlide(Math.max(0, Math.min(2, Math.round(r.scrollLeft / (w + 16))))); }} className="-mx-4 mt-10 flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] lg:mx-0 lg:mt-12 lg:grid lg:snap-none lg:grid-cols-3 lg:gap-5 lg:overflow-visible lg:px-0">
          {PLANS.map((p, i) => {
            const Icon = ICON[p];
            const featured = p === "business";
            const features = t.raw(`${p}_f`) as string[];
            return (
              <Reveal key={p} delay={i * 140} className={cn("w-[86%] shrink-0 snap-center sm:w-[60%] lg:w-auto", featured && "lg:-translate-y-4")}>
                <div className={cn("h-full rounded-[28px]", featured && "beam [--beam-s:5s]")}>
                  <Spotlight
                    color={featured ? "rgba(224,86,109,0.25)" : "rgba(255,255,255,0.08)"}
                    className={cn(
                      "flex h-full flex-col rounded-[28px] border p-7 transition-transform duration-300 hover:-translate-y-1 lg:p-8",
                      featured ? "border-transparent bg-[#2A1F26]" : "border-white/10 bg-graphite-800",
                      done === p && "scale-[1.02]",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn("grid size-12 place-items-center rounded-[14px]", featured ? "bg-brand-500" : "bg-white/10")}><Icon size={22} aria-hidden /></span>
                      {featured && <span className="rounded-full bg-brand-400 px-3 py-1 text-xs font-semibold text-graphite-900">{t("popular")}</span>}
                      {!featured && current === p && <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium">{t("current")}</span>}
                    </div>
                    <p className="mt-8 text-sm font-semibold uppercase tracking-[0.16em] text-ondark">{t(`${p}_role`)}</p>
                    <h2 className="mt-1 text-3xl font-semibold tracking-tight">{t(`${p}_name`)}</h2>
                    <p className="mt-5 flex items-baseline gap-2">
                      <span className="num text-[44px] font-bold leading-none tracking-tight">{t(`${p}_price`)}</span>
                      <span className="text-sm text-ondark">{p === "start" ? t("forever") : t("perMonth")}</span>
                    </p>
                    <ul className="mt-7 flex-1 space-y-3 border-t border-white/10 pt-6">
                      {features.map((f) => (
                        <li key={f} className="flex gap-3 text-[15px]">
                          <Check size={18} className={cn("mt-0.5 shrink-0", featured ? "text-brand-400" : "text-[#9AD9B4]")} aria-hidden />
                          <span className="text-white/90">{f}</span>
                        </li>
                      ))}
                    </ul>
                      <button
                        onClick={() => void pick(p)}
                        disabled={!!busy}
                        className={cn(
                          "group mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-6 font-medium transition-colors disabled:opacity-60",
                          featured ? "bg-brand-500 text-white hover:bg-brand-600" : "bg-white text-graphite-900 hover:bg-brand-50",
                        )}
                      >
                        {done === p ? <Check size={18} aria-hidden /> : busy === p ? <Loader2 size={18} className="animate-spin" aria-hidden /> : null}
                        {busy === p && done !== p ? t("choosing") : t(`${p}_cta`)}
                        {!busy && <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden />}
                      </button>
                  </Spotlight>
                </div>
              </Reveal>
            );
          })}
        </div>
        <div className="mt-2 flex justify-center gap-2 lg:hidden" aria-hidden>
          {PLANS.map((p, i) => <span key={p} className={cn("h-1.5 rounded-full transition-all duration-300", i === slide ? "w-6 bg-brand-400" : "w-1.5 bg-white/25")} />)}
        </div>
        <p className="mt-8 text-center text-sm text-ondark lg:mt-10">{t("note")}</p>
      </main>
    </div>
  );
}

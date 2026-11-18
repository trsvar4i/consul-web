"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { generateGuide, listUserGuides, type UserGuide } from "@/lib/api";
import type { Locale } from "@/lib/types";
import { Spotlight } from "../fx/fx";
import { Sheet } from "../ui/sheet";
import { Button, cn } from "../ui/primitives";

/** Сетка точек, по которой бежит диагональная волна (по мотивам lattice loader). */
function Lattice() {
  return (
    <div className="grid w-fit grid-cols-6 gap-1.5" aria-hidden>
      {Array.from({ length: 36 }, (_, i) => {
        const x = i % 6, y = Math.floor(i / 6);
        return <span key={i} className="size-2.5 rounded-[3px] bg-brand-500 [animation:lat_1.4s_ease-in-out_infinite]" style={{ animationDelay: `${(x + y) * 0.09}s` }} />;
      })}
      <style>{`@keyframes lat{0%,100%{opacity:.12;transform:scale(.7)}45%{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}

const TOPIC_BG: Record<string, string> = { debt: "bg-warning-50", credit: "bg-mist", tax: "bg-brand-50", cash: "bg-graphite-900", price: "bg-success-50" };

/** Карточка-кнопка «Создать гайд с ассистентом» + гайды, созданные на этом устройстве. */
export function CreateGuide() {
  const t = useTranslations("myGuides");
  const tg = useTranslations("guides");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [mine, setMine] = useState<UserGuide[]>([]);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- guides live in localStorage
  useEffect(() => setMine(listUserGuides()), []);

  const steps = t.raw("steps") as string[];
  const examples = t.raw("examples") as string[];
  useEffect(() => {
    if (!busy) return;
    const id = setInterval(() => setStep((s) => Math.min(steps.length - 1, s + 1)), 650);
    return () => clearInterval(id);
  }, [busy, steps.length]);

  const submit = async () => {
    if (text.trim().split(/\s+/).length < 2) return setErr(t("short"));
    setErr(null);
    setStep(0);
    setBusy(true);
    try {
      const g = await generateGuide(text, locale);
      router.push(`/guides/my?id=${g.id}`);
    } catch {
      setErr(t("error"));
      setBusy(false);
    }
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="group block h-full w-full text-left">
        <span className="beam block h-full rounded-card [--beam-s:6s]">
          <Spotlight color="rgba(224,86,109,0.25)" className="flex h-full min-h-[340px] flex-col rounded-card bg-graphite-900 p-6 text-white">
            <span className="grid size-12 place-items-center rounded-[14px] bg-brand-500 transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110">
              <Sparkles size={22} aria-hidden />
            </span>
            <span className="mt-auto block pt-10 text-2xl font-semibold leading-tight tracking-tight">{t("createTitle")}</span>
            <span className="mt-2 block text-[15px] text-ondark">{t("createText")}</span>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-200">
              {t("createBtn")} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden />
            </span>
          </Spotlight>
        </span>
      </button>

      {mine.map((g) => (
        <Link key={g.id} href={`/guides/my?id=${g.id}`} className="group flex flex-col overflow-hidden rounded-card border border-gray-200 hover:border-graphite-900">
          <div className={cn("relative flex h-48 items-end p-5", TOPIC_BG[g.topic] ?? "bg-mist")}>
            <span className={cn("text-[64px] font-bold leading-none tracking-tighter", g.topic === "cash" ? "text-white/15" : "text-graphite-900/10")} aria-hidden>Ai</span>
          </div>
          <div className="flex flex-1 flex-col p-5">
            <h2 className="text-lg font-semibold leading-snug">{g.title}</h2>
            <p className="mt-2 flex-1 text-[15px] text-gray-700">{g.description}</p>
            <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-700"><span className="rounded-full bg-mist px-2.5 py-1 text-xs font-medium text-graphite-900">{g.tag}</span><span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-600"><Sparkles size={12} aria-hidden /> {t("mine")}</span>{tg("readMin", { n: g.readMinutes })}</p>
          </div>
        </Link>
      ))}

      <Sheet open={open} onClose={() => !busy && setOpen(false)} title={t("dialogTitle")}
        footer={!busy ? <Button size="lg" className="w-full" onClick={() => void submit()}><Sparkles size={18} aria-hidden /> {t("generate")}</Button> : undefined}>
        {busy ? (
          <div className="flex flex-col items-center py-10 text-center" role="status">
            <Lattice />
            <p className="mt-6 text-lg font-semibold">{steps[step]}…</p>
            <div className="mt-4 flex gap-1.5" aria-hidden>
              {steps.map((_, i) => <span key={i} className={cn("h-1.5 rounded-full transition-all duration-500", i <= step ? "w-6 bg-brand-500" : "w-1.5 bg-gray-200")} />)}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <label htmlFor="ug-text" className="block text-sm font-medium">{t("label")}</label>
            <textarea id="ug-text" rows={4} value={text} onChange={(e) => { setText(e.target.value); setErr(null); }} placeholder={t("placeholder")}
              className="w-full resize-none rounded-btn border border-gray-200 px-3 py-2.5 text-base focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
            {err && <p className="text-sm text-error" role="alert">{err}</p>}
            <div className="flex flex-wrap gap-2">
              {examples.map((e) => (
                <button key={e} type="button" onClick={() => setText(e)} className="min-h-10 rounded-full border border-gray-200 px-3.5 text-sm hover:border-graphite-900">{e}</button>
              ))}
            </div>
          </div>
        )}
      </Sheet>
    </>
  );
}

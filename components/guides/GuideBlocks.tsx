"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, Circle, HelpCircle, MessageCircle, SlidersHorizontal, XCircle } from "lucide-react";
import type { GuideBlock } from "@/lib/api";
import { useAssistant } from "@/lib/assistant-context";
import { MarkdownBody } from "@/lib/markdown";
import { currency, formatNum } from "@/lib/format";
import { CreditCalculator } from "../tools/CreditCalculator";
import { TaxRegimeCalculator } from "../tools/TaxRegimeCalculator";
import { MarkupCalculator } from "../tools/MarkupCalculator";
import { cn } from "../ui/primitives";

function Range({ label, value, min, max, step, onChange, suffix }: { label: string; value: number; min: number; max: number; step: number; onChange: (n: number) => void; suffix?: string }) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-gray-700">{label}</span>
        <span className="num font-semibold text-graphite-900">{formatNum(value)}{suffix}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 h-11 w-full" />
    </label>
  );
}

const L = {
  ru: { debt: "Долги покупателей", back: "Вернули, %", cash: "Деньги сейчас", obl: "Платежи за 30 дней", opex: "Расходы в месяц", cost: "Закупка за единицу", markup: "Наценка, %", rev: "Выручка в месяц", margin: "Маржа, %",
    rDebt: "Вернётся в кассу", rSafe: "Можно потратить станет", rCash: "Можно безопасно потратить", rPrice: "Цена продажи", rMargin: "маржа", rProfit: "Прибыль в месяц", neg: "Денег на платежи не хватает" },
  uz: { debt: "Xaridorlar qarzi", back: "Qaytarildi, %", cash: "Hozirgi pul", obl: "30 kunlik toʻlovlar", opex: "Oylik xarajatlar", cost: "Bir birlik xaridi", markup: "Ustama, %", rev: "Oylik tushum", margin: "Marja, %",
    rDebt: "Kassaga qaytadi", rSafe: "Sarflash mumkin boʻladi", rCash: "Xavfsiz sarflash mumkin", rPrice: "Sotuv narxi", rMargin: "marja", rProfit: "Oylik foyda", neg: "Toʻlovlarga pul yetmaydi" },
};

function WhatIf({ kind }: { kind: "debt" | "profit" | "cash" | "price" }) {
  const t = useTranslations("myGuides");
  const locale = useLocale();
  const l = L[locale === "uz" ? "uz" : "ru"];
  const cur = currency(locale);
  const [a, setA] = useState(kind === "debt" ? 4_000_000 : kind === "cash" ? 11_500_000 : kind === "price" ? 50_000 : 50_000_000);
  const [b, setB] = useState(kind === "debt" ? 50 : kind === "cash" ? 6_100_000 : kind === "price" ? 35 : 12);
  const [c, setC] = useState(12_000_000);

  let result: { label: string; value: number; sub?: string; bad?: boolean };
  if (kind === "debt") { const back = (a * b) / 100; result = { label: l.rDebt, value: back, sub: `${l.rSafe}: ${formatNum(4_200_000 + back)} ${cur}` }; }
  else if (kind === "cash") { const v = a - b - c * 0.1; result = { label: l.rCash, value: v, bad: v <= 0, sub: v <= 0 ? l.neg : undefined }; }
  else if (kind === "price") { const price = a * (1 + b / 100); result = { label: l.rPrice, value: price, sub: `${l.rMargin} ${(((price - a) / price) * 100).toFixed(1).replace(".", ",")}%` }; }
  else { result = { label: l.rProfit, value: (a * b) / 100 }; }

  return (
    <div className="not-prose my-8 overflow-hidden rounded-block border border-gray-200 bg-white">
      <div className="flex items-center gap-2 border-b border-gray-200 bg-mist px-5 py-3 text-sm font-semibold"><SlidersHorizontal size={16} aria-hidden /> {t("whatIf")}</div>
      <div className="grid gap-6 p-5 sm:grid-cols-[1.2fr_1fr] sm:p-6">
        <div className="space-y-2">
          {kind === "debt" && <><Range label={l.debt} value={a} min={0} max={10_000_000} step={100_000} onChange={setA} /><Range label={l.back} value={b} min={0} max={100} step={5} onChange={setB} suffix="%" /></>}
          {kind === "cash" && <><Range label={l.cash} value={a} min={0} max={30_000_000} step={100_000} onChange={setA} /><Range label={l.obl} value={b} min={0} max={20_000_000} step={100_000} onChange={setB} /><Range label={l.opex} value={c} min={0} max={30_000_000} step={500_000} onChange={setC} /></>}
          {kind === "price" && <><Range label={l.cost} value={a} min={1_000} max={300_000} step={1_000} onChange={setA} /><Range label={l.markup} value={b} min={0} max={150} step={1} onChange={setB} suffix="%" /></>}
          {kind === "profit" && <><Range label={l.rev} value={a} min={0} max={200_000_000} step={1_000_000} onChange={setA} /><Range label={l.margin} value={b} min={0} max={60} step={1} onChange={setB} suffix="%" /></>}
        </div>
        <div className={cn("flex flex-col justify-center rounded-card p-5", result.bad ? "bg-error-50" : "bg-graphite-900 text-white")} aria-live="polite">
          <p className={cn("text-sm", result.bad ? "text-error" : "text-ondark")}>{result.label}</p>
          <p className={cn("num mt-1 text-[34px] font-bold leading-none tracking-tight", result.bad ? "text-error" : "text-white")}>
            {result.value < 0 ? "−" : ""}{formatNum(Math.abs(result.value))} <span className={cn("text-base font-semibold", result.bad ? "text-error" : "text-brand-400")}>{cur}</span>
          </p>
          {result.sub && <p className={cn("mt-2 text-sm", result.bad ? "text-error" : "text-ondark")}>{result.sub}</p>}
        </div>
      </div>
    </div>
  );
}

function Checklist({ id, title, items }: { id: string; title: string; items: string[] }) {
  const t = useTranslations("myGuides");
  const key = `consul_ug_check_${id}`;
  const [done, setDone] = useState<boolean[]>(() => items.map(() => false));
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore saved progress
      if (raw) setDone(JSON.parse(raw));
    } catch {}
  }, [key]);
  const toggle = (i: number) => {
    const next = done.map((v, j) => (j === i ? !v : v));
    setDone(next);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
  };
  const n = done.filter(Boolean).length;
  return (
    <div className="not-prose my-8 rounded-block border border-gray-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">{t("checklist")}</p>
        <p className="text-sm text-gray-700">{t("done", { done: n, total: items.length })}</p>
      </div>
      <p className="mt-1 text-lg font-semibold">{title}</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-mist"><div className="h-full rounded-full bg-success transition-[width] duration-500" style={{ width: `${(n / items.length) * 100}%` }} /></div>
      <ul className="mt-4 space-y-1">
        {items.map((it, i) => (
          <li key={i}>
            <button onClick={() => toggle(i)} aria-pressed={done[i]} className="flex min-h-12 w-full items-center gap-3 rounded-btn px-2 text-left hover:bg-mist">
              {done[i] ? <CheckCircle2 className="shrink-0 text-success" aria-hidden /> : <Circle className="shrink-0 text-gray-500" aria-hidden />}
              <span className={cn("text-[15px] transition-colors", done[i] && "text-gray-700 line-through decoration-gray-500")}>{it}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Quiz({ question, options }: { question: string; options: { text: string; correct: boolean; explain: string }[] }) {
  const t = useTranslations("myGuides");
  const [pick, setPick] = useState<number | null>(null);
  return (
    <div className="not-prose my-8 rounded-block bg-graphite-900 p-5 text-white sm:p-7">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-200"><HelpCircle size={15} aria-hidden /> {t("quiz")}</p>
      <p className="mt-3 text-xl font-semibold leading-snug">{question}</p>
      <div className="mt-5 space-y-2">
        {options.map((o, i) => {
          const chosen = pick === i;
          const reveal = pick !== null && (chosen || o.correct);
          return (
            <button key={i} onClick={() => setPick(i)} disabled={pick !== null}
              className={cn("flex w-full items-start gap-3 rounded-card border px-4 py-3 text-left transition-colors",
                !reveal && "border-white/15 hover:bg-white/[0.06]",
                reveal && o.correct && "border-success bg-success/20",
                reveal && !o.correct && "border-error bg-error/20")}>
              {reveal ? (o.correct ? <CheckCircle2 className="mt-0.5 shrink-0 text-[#9AD9B4]" aria-hidden /> : <XCircle className="mt-0.5 shrink-0 text-[#FF9B85]" aria-hidden />) : <span className="num mt-0.5 w-5 shrink-0 text-sm text-white/50">{String.fromCharCode(65 + i)}</span>}
              <span>
                <span className="block text-[15px]">{o.text}</span>
                {reveal && <span className="mt-1 block text-sm text-ondark animate-rise">{o.correct ? `${t("correct")}. ` : chosen ? `${t("wrong")}. ` : ""}{o.explain}</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Ask({ question }: { question: string }) {
  const { open } = useAssistant();
  return (
    <button onClick={() => open({ question })} className="not-prose my-8 flex w-full items-center gap-4 rounded-block border border-brand-500/30 bg-brand-50 p-5 text-left transition-colors hover:bg-brand-50/60">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-500 text-white"><MessageCircle size={20} aria-hidden /></span>
      <span className="text-[15px] font-medium text-graphite-900">«{question}»</span>
    </button>
  );
}

/** Рендер блоков гайда, собранного ассистентом. */
export function GuideBlocks({ id, blocks }: { id: string; blocks: GuideBlock[] }) {
  const t = useTranslations("myGuides");
  return (
    <div className="prose-c text-[17px]">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "md": return <MarkdownBody key={i} md={b.md} />;
          case "whatif": return <WhatIf key={i} kind={b.kind} />;
          case "checklist": return <Checklist key={i} id={`${id}_${i}`} title={b.title} items={b.items} />;
          case "quiz": return <Quiz key={i} question={b.question} options={b.options} />;
          case "ask": return <Ask key={i} question={b.question} />;
          case "tool":
            return (
              <div key={i} className="not-prose my-8 rounded-block bg-mist p-4 sm:p-6">
                <p className="mb-4 text-lg font-semibold">{t("tool")}</p>
                {b.tool === "credit" && <CreditCalculator embedded />}
                {b.tool === "tax-regime" && <TaxRegimeCalculator />}
                {b.tool === "markup" && <MarkupCalculator />}
              </div>
            );
        }
      })}
    </div>
  );
}

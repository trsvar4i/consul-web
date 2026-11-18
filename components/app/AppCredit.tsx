"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Area, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Loader2, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { estimateGrowth, getDashboard, markStep, type GrowthEstimate } from "@/lib/api";
import { annuityPayment, loadLevel, loadPct, safeLoanAmount } from "@/lib/calc/credit";
import { RULES } from "@/lib/calc/rules";
import { usePageContext } from "@/lib/assistant-context";
import { useData } from "@/lib/use-data";
import type { Locale } from "@/lib/types";
import { formatDateFull, formatNum, formatShort, formatSom, monthName, monthNameIn } from "@/lib/format";
import { MoneyInput } from "../brand/MoneyInput";
import { Banner, ErrorState } from "../brand/blocks";
import { WhyButton } from "../assistant/WhyButton";
import { Segmented } from "../ui/segmented";
import { Badge, Button, Card, cn, Input, Label, Skeleton } from "../ui/primitives";
import { useApp } from "./AppShell";

type Scenario = "pess" | "base" | "opt";
const REV_FACTOR: Record<Scenario, number> = { pess: 0.8, base: 1, opt: 1.15 };
const OWNER_DRAW = 2_000_000; // личное изъятие в месяц (из операций)

export function AppCredit() {
  const t = useTranslations("appCredit");
  const tc = useTranslations("credit");
  const c = useTranslations("common");
  const pages = useTranslations("pages");
  const locale = useLocale() as Locale;
  const { version } = useApp();
  useEffect(() => markStep("credit"), []);

  const dash = useData(() => getDashboard(undefined, locale), [locale, version]);

  const [sum, setSum] = useState<number | undefined>(50_000_000);
  const [rate, setRate] = useState(24);
  const [months, setMonths] = useState(24);
  const [purpose, setPurpose] = useState<"expansion" | "equipment" | "stock">("stock");
  const [scenario, setScenario] = useState<Scenario>("base");
  const [growth, setGrowth] = useState<number | undefined>(undefined);
  const [manual, setManual] = useState(false);
  const [ai, setAi] = useState<{ loading: boolean; error: boolean; est: GrowthEstimate | null }>({ loading: false, error: false, est: null });

  // ИИ-оценка роста прибыли: пересчитываем (с задержкой) при смене суммы, цели, срока или сценария
  const profitIn = dash.data?.kpis.profitBeforeTax;
  const revenueIn = dash.data?.kpis.revenue;
  useEffect(() => {
    if (manual || profitIn === undefined || revenueIn === undefined) return;
    let alive = true;
    const tm = setTimeout(() => {
      setAi((a) => ({ ...a, loading: true, error: false }));
      estimateGrowth({ sum: sum ?? 0, purpose, months, rate, scenario, profit: profitIn, revenue: revenueIn }, locale)
        .then((est) => { if (alive) { setAi({ loading: false, error: false, est }); setGrowth(est.amount); } })
        .catch(() => alive && setAi({ loading: false, error: true, est: null }));
    }, 500);
    return () => { alive = false; clearTimeout(tm); };
  }, [manual, sum, purpose, months, rate, scenario, profitIn, revenueIn, locale]);

  const d = dash.data;
  const revenue = d?.kpis.revenue ?? 50_000_000;
  const expenses = d?.kpis.expenses ?? 44_000_000;
  const profit = d?.kpis.profitBeforeTax ?? 6_000_000;
  const cash = d?.safeToSpend.cashNow ?? 11_500_000;
  const purchaseShare = 0.64; // закупки растут вместе с выручкой, остальное — постоянные расходы
  const fixed = expenses - revenue * purchaseShare;

  const S = sum ?? 0;
  const payment = annuityPayment(S, rate, months);
  const pct = loadPct(payment, profit);
  const level = loadLevel(pct);
  const safe = Math.floor(safeLoanAmount(profit, rate, months) / 1_000_000) * 1_000_000;

  const { series, gapMonth } = (() => {
    const start = d?.today ? new Date(d.today + "T00:00:00Z") : new Date();
    const scenRevenue = revenue * REV_FACTOR[scenario];
    const scenProfit = scenRevenue * (1 - purchaseShare) - fixed;
    let a = cash; // without credit
    let b = cash; // with credit (loan spent on the purpose at once)
    const out: { m: string; without: number; with: number; neg: number }[] = [];
    let gap: string | null = null;
    for (let i = 1; i <= 12; i++) {
      const mi = (start.getUTCMonth() + i) % 12;
      const extra = i > 1 ? growth ?? 0 : 0;
      a += scenProfit - OWNER_DRAW;
      b += scenProfit - OWNER_DRAW + extra - (i <= months ? payment : 0);
      const label = monthName(mi, locale).slice(0, 3);
      if (b < 0 && !gap) gap = monthNameIn(mi, locale);
      out.push({ m: label, without: Math.round(a), with: Math.round(b), neg: Math.min(0, Math.round(b)) });
    }
    return { series: out, gapMonth: gap };
  })();

  usePageContext({
    page: "app_credit",
    title: pages("appCredit"),
    summary: t("context", { sum: formatSom(S, locale), months, scenario: t(`s_${scenario}`) }),
    data: { sum: S, rate, months, payment: Math.round(payment), profit, loadPct: Math.round(pct), safe, scenario, sumNeg: -S },
  });

  if (dash.error) return <Card><ErrorState onRetry={dash.retry} /></Card>;
  if (dash.loading && !d) return <div className="space-y-4"><Skeleton className="h-10 w-72" /><Skeleton className="h-64" /><Skeleton className="h-80" /></div>;

  const levelUi = {
    ok: { label: tc("loadOk"), cls: "text-success", bar: "bg-success" },
    hard: { label: tc("loadHard"), cls: "text-warning", bar: "bg-warning" },
    danger: { label: tc("loadDanger"), cls: "text-error", bar: "bg-error" },
  }[level];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight lg:text-[28px]">{t("h1")}</h1>
        <p className="mt-1 text-gray-700">{t("intro")}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        <Card className="space-y-5 p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-3 rounded-btn bg-mist p-3 text-sm">
            <div><p className="text-gray-700">{t("profitAuto")}</p><p className="num font-semibold">{formatNum(profit)}</p></div>
            <div><p className="text-gray-700">{t("cashAuto")}</p><p className="num font-semibold">{formatNum(cash)}</p></div>
          </div>
          <MoneyInput label={tc("sum")} value={sum} onChange={setSum} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ac-rate">{tc("rate")}</Label>
              <Input id="ac-rate" type="number" inputMode="decimal" className="num" value={rate} onChange={(e) => setRate(Number(e.target.value) || 0)} />
            </div>
            <div>
              <Label htmlFor="ac-term">{tc("term")}</Label>
              <Input id="ac-term" type="number" inputMode="numeric" min={3} max={60} className="num" value={months} onChange={(e) => setMonths(Math.min(60, Math.max(3, Number(e.target.value) || 3)))} />
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-sm font-medium">{t("purpose")}</p>
            <Segmented wrap label={t("purpose")} value={purpose} onChange={setPurpose}
              options={(["expansion", "equipment", "stock"] as const).map((p) => ({ value: p, label: t(`p_${p}`) }))} />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label htmlFor="ac-growth" className="text-sm font-medium">{t("growth")}</label>
              {manual ? (
                <button type="button" onClick={() => setManual(false)} className="inline-flex min-h-8 items-center gap-1 text-xs font-medium text-brand-500 hover:underline">
                  <RotateCcw size={13} aria-hidden /> {t("growthReset")}
                </button>
              ) : (
                <Badge tone="brand"><Sparkles size={12} aria-hidden /> {t("growthAi")}</Badge>
              )}
            </div>
            <MoneyInput id="ac-growth" value={growth} onChange={(n) => { setManual(true); setGrowth(n); }} />
            <div className="mt-1.5 text-sm" aria-live="polite">
              {!manual && ai.loading ? (
                <p className="flex items-center gap-1.5 text-gray-700"><Loader2 size={14} className="animate-spin" aria-hidden /> {t("growthLoading")}</p>
              ) : !manual && ai.error ? (
                <p className="text-error">{t("growthError")}</p>
              ) : !manual && ai.est ? (
                <p className="text-gray-700">{ai.est.rationale} <span className="whitespace-nowrap">· {t(`conf_${ai.est.confidence}`)}</span></p>
              ) : manual ? (
                <p className="text-gray-700">{t("growthManual")}</p>
              ) : null}
              {!manual && <p className="mt-1 text-xs text-gray-700">{t("growthHint")}</p>}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-sm font-medium">{t("scenario")}</p>
            <Segmented wrap label={t("scenario")} value={scenario} onChange={setScenario}
              options={(["pess", "base", "opt"] as Scenario[]).map((s) => ({ value: s, label: t(`s_${s}`) }))} />
            <p className="mt-1 text-xs text-gray-700">{t("scenarioHint")}</p>
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-700">{tc("payment")}</p>
                <p className="num mt-1 whitespace-nowrap text-[34px] font-bold leading-none tracking-tight text-brand-500 sm:text-[40px]">{formatNum(payment)}</p>
              </div>
              <WhyButton metric="credit_load" value={pct} question={tc("whyLoad")} />
            </div>
            <p className={cn("num mt-4 font-semibold", levelUi.cls)}>{tc("load")}: {Math.round(pct)}% · {levelUi.label}</p>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-mist" role="meter" aria-label={tc("load")} aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
              <div className={cn("h-full rounded-full", levelUi.bar)} style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
            <p className="mt-2 text-xs text-gray-700">{tc("loadNote")}</p>
          </Card>
          <Card className="flex gap-3 p-5 sm:p-6">
            <ShieldCheck className="mt-0.5 shrink-0 text-success" aria-hidden />
            <div>
              <p className="font-semibold">{t("safeTitle")}</p>
              <p className="mt-1 text-[15px]">{t("safeText", { sum: formatSom(safe, locale) })}</p>
              <p className="mt-1 text-sm text-gray-700">{t("safeNote", { payment: formatSom(profit * 0.3, locale) })}</p>
              <Button variant="secondary" size="sm" className="mt-3" onClick={() => setSum(safe)}>{formatSom(safe, locale)} →</Button>
            </div>
          </Card>
        </div>
      </div>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">{t("chartTitle")}</h2>
          <Badge tone={scenario === "pess" ? "warning" : "neutral"}>{t(`s_${scenario}`)}</Badge>
        </div>
        <div className="mt-3">
          {gapMonth ? <Banner level="error">{t("gapWarn", { month: gapMonth })}</Banner> : <Banner level="success">{t("noGap")}</Banner>}
        </div>
        <div className="mt-4 h-72 w-full" aria-hidden>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#D3D9E0" vertical={false} />
              <XAxis dataKey="m" tick={{ fill: "#7D8794", fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis width={58} tickFormatter={(v: number) => formatShort(v, locale)} tick={{ fill: "#7D8794", fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v, n) => [formatNum(Number(v)), n === "with" ? t("withCredit") : n === "without" ? t("withoutCredit") : ""]} contentStyle={{ borderRadius: 10, borderColor: "#D3D9E0", fontSize: 13 }} />
              <ReferenceLine y={0} stroke="#7D8794" />
              <Area dataKey="neg" type="monotone" stroke="none" fill="#C2410C" fillOpacity={0.18} isAnimationActive={false} tooltipType="none" />
              <Line dataKey="without" type="monotone" stroke="#7D8794" strokeWidth={2} strokeDasharray="6 5" dot={false} />
              <Line dataKey="with" type="monotone" stroke="#22262C" strokeWidth={2.5} dot={{ r: 2.5 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-5 text-xs text-gray-700">
          <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-5 bg-graphite-900" />{t("withCredit")}</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-5 border-t-2 border-dashed border-gray-500" />{t("withoutCredit")}</span>
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="secondary" disabled>{t("savePlan")} <Badge>{c("soon")}</Badge></Button>
      </div>
      <p className="text-sm text-gray-700">{c("disclaimer", { date: formatDateFull(RULES.effectiveFrom, locale) })}</p>
    </div>
  );
}

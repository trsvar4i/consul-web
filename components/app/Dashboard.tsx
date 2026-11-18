"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, CircleAlert, MessageCircle } from "lucide-react";
import { getDashboard, getSuggestions, listTransactions } from "@/lib/api";
import { usePageContext, useAssistant } from "@/lib/assistant-context";
import { useData } from "@/lib/use-data";
import type { Locale } from "@/lib/types";
import { formatDate, formatMonth, formatNum, formatSom, currency } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import { AlertItem, EmptyState, ErrorState, StatCard } from "../brand/blocks";
import { WhyButton } from "../assistant/WhyButton";
import { ForecastChart } from "../charts/ForecastChart";
import { Button, ButtonLink, Card, cn, Skeleton } from "../ui/primitives";
import { useApp } from "./AppShell";
import { TxRow } from "./TxRow";

const pctDelta = (a: number, b: number) => (b ? ((a - b) / Math.abs(b)) * 100 : 0);

export function Dashboard() {
  const t = useTranslations("dashboard");
  const pages = useTranslations("pages");
  const lv = useTranslations("levels");
  const c = useTranslations("common");
  const locale = useLocale() as Locale;
  const { business, version, openAdd } = useApp();
  const { open } = useAssistant();
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  const dash = useData(() => getDashboard(undefined, locale), [locale, version]);
  const recent = useData(() => listTransactions({}).then((l) => l.slice(0, 5)), [version]);
  const d = dash.data;

  usePageContext({
    page: "dashboard",
    title: pages("dashboard"),
    summary: d && !d.needsSetup ? `${t("equals")}: ${formatSom(d.safeToSpend.amount, locale)}` : undefined,
    data: d ? { safeToSpend: d.safeToSpend.amount, cashNow: d.safeToSpend.cashNow, reserve: d.safeToSpend.reserve, revenue: d.kpis.revenue, profit: d.kpis.profitBeforeTax } : undefined,
  });

  if (dash.error) return <Card><ErrorState onRetry={dash.retry} /></Card>;
  if (dash.loading && !d) return <DashboardSkeleton />;
  if (!d) return null;

  const s = d.safeToSpend;
  const obligSum = s.obligations.reduce((a, o) => a + o.amount, 0);
  const negative = s.amount <= 0;
  const firstGap = d.cashForecast.find((p) => p.isForecast && p.balance < 0);
  const minGap = d.cashForecast.filter((p) => p.isForecast).reduce((m, p) => Math.min(m, p.balance), 0);
  const alerts = showAllAlerts ? d.alerts : d.alerts.slice(0, 3);
  const level = d.score < 40 ? lv("novice") : d.score < 70 ? lv("order") : lv("bankReady");

  return (
    <div className="space-y-5">
      {business && <h1 className="text-[22px] font-semibold tracking-tight lg:text-[28px]">{t("hello", { name: business.ownerName })}</h1>}

      {/* 1. Можно безопасно потратить — главный элемент экрана */}
      {d.needsSetup ? (
        <Card className="p-6">
          <p className="text-lg font-semibold">{t("setupTitle")}</p>
          <p className="mt-1 text-gray-700">{t("setupText")}</p>
          <ButtonLink href="/app/settings" className="mt-4">{t("setupBtn")}</ButtonLink>
        </Card>
      ) : (
        <div className={cn("relative overflow-hidden rounded-card border p-5 sm:p-7", negative ? "border-error/40 bg-error-50" : "border-graphite-900 bg-graphite-900 text-white")}>
          {!negative && <Spark points={d.cashForecast.filter((p) => !p.isForecast).map((p) => p.balance)} />}
          <div className="relative flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className={cn("text-[15px] font-medium", negative ? "text-gray-700" : "text-ondark")}>{t("safeToSpend")}</p>
              <p className={cn("num mt-1 text-[40px] font-bold leading-none tracking-tight lg:text-[56px]", negative ? "text-error" : "text-white")}>
                {negative && <CircleAlert className="mr-2 inline size-8 align-[-2px]" aria-hidden />}
                {formatNum(s.amount)} <span className={cn("text-xl font-semibold lg:text-2xl", negative ? "text-graphite-900" : "text-brand-400")}>{currency(locale)}</span>
              </p>
              <p className={cn("mt-1.5 text-sm", negative ? "text-gray-700" : "text-ondark")}>{t("next30")}</p>
            </div>
            <WhyButton metric="safe_to_spend" value={s.amount} question={t("whyQ")} onDark={!negative} className="relative" />
          </div>
          {negative && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <p className="font-medium text-error">{t("notEnough", { sum: formatSom(-s.amount, locale) })}</p>
              <Button variant="secondary" size="sm" onClick={() => open({ question: t("whatToDoQ") })}>{t("whatToDo")}</Button>
            </div>
          )}
          <button onClick={() => setShowBreakdown((x) => !x)} aria-expanded={showBreakdown}
            className={cn("relative mt-4 inline-flex min-h-10 items-center gap-1 text-sm font-medium hover:underline", negative ? "text-graphite-900" : "text-white")}>
            {t("breakdown")} <ChevronDown size={16} className={cn("transition-transform", showBreakdown && "rotate-180")} aria-hidden />
          </button>
          {showBreakdown && (
            <dl className={cn("relative mt-2 max-w-md space-y-1.5 rounded-btn p-3 text-[15px] num animate-rise", !negative && "bg-white text-graphite-900")}>
              <Row label={t("cashNow")} value={formatNum(s.cashNow)} />
              <Row label={t("obligations")} value={"−" + formatNum(obligSum)} />
              <ul className="space-y-1 border-l-2 border-gray-200 pl-3 text-sm text-gray-700">
                {s.obligations.map((o, i) => (
                  <li key={i} className="flex justify-between gap-3"><span>{o.title} · {formatDate(o.date, locale)}</span><span>{formatNum(o.amount)}</span></li>
                ))}
              </ul>
              <Row label={t("reserve")} value={"−" + formatNum(s.reserve)} />
              <div className="flex justify-between gap-3 border-t border-gray-200 pt-2 font-semibold">
                <dt>= {t("equals")}</dt><dd>{formatNum(s.amount)}</dd>
              </div>
            </dl>
          )}
        </div>
      )}

      {/* 2. KPI за месяц */}
      <section aria-label={formatMonth(d.period, locale)}>
        <p className="mb-2 text-sm font-medium text-gray-700">{formatMonth(d.period, locale)}</p>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard title={t("revenue")} value={formatNum(d.kpis.revenue)} delta={pctDelta(d.kpis.revenue, d.kpis.prev.revenue)} deltaLabel={t("vsPrev")} />
          <StatCard title={t("expenses")} value={formatNum(d.kpis.expenses)} delta={pctDelta(d.kpis.expenses, d.kpis.prev.expenses)} deltaLabel={t("vsPrev")} invert />
          <StatCard title={t("profit")} value={formatNum(d.kpis.profitBeforeTax)} delta={pctDelta(d.kpis.profitBeforeTax, d.kpis.prev.profitBeforeTax)} deltaLabel={t("vsPrev")} />
          <StatCard title={t("margin")} value={`${String(d.kpis.marginPct).replace(".", ",")}%`} delta={pctDelta(d.kpis.marginPct, d.kpis.prev.marginPct)} deltaLabel={t("vsPrev")} />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* 3. Предупреждения */}
        <Card className="px-5 py-3">
          <div className="flex items-center justify-between pt-1">
            <h2 className="font-semibold">{t("alertsTitle")}</h2>
            {d.alerts.length > 3 && (
              <button className="min-h-10 text-sm font-medium text-graphite-900 hover:underline" onClick={() => setShowAllAlerts((x) => !x)}>
                {showAllAlerts ? c("hide") : c("showAll")}
              </button>
            )}
          </div>
          <div className="divide-y divide-gray-200">
            {alerts.map((a) => <AlertItem key={a.id} level={a.level} text={a.text} action={a.action} />)}
          </div>
        </Card>

        {/* 5–6. Быстрые вопросы + оценка */}
        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="flex items-center gap-2 font-semibold"><MessageCircle size={18} aria-hidden /> {t("quickTitle")}</h2>
            <div className="mt-3 flex flex-col items-start gap-2">
              {getSuggestions("dashboard", locale).map(({ text: q }) => (
                <button key={q} onClick={() => open({ question: q })}
                  className="min-h-10 rounded-full border border-gray-200 px-3.5 py-2 text-left text-sm hover:border-graphite-900">
                  {q}
                </button>
              ))}
            </div>
          </Card>
          <Link href="/app/passport" className="flex items-center gap-4 rounded-card border border-gray-200 bg-white p-5 hover:border-graphite-900">
            <ScoreRing value={d.score} />
            <div>
              <p className="text-sm text-gray-700">{t("scoreTitle")}</p>
              <p className="font-semibold">{level}</p>
              <p className="mt-0.5 text-sm text-graphite-900 underline-offset-2 hover:underline">{t("scoreOpen")} →</p>
            </div>
          </Link>
        </div>
      </div>

      {/* 4. График «Деньги на 3 месяца вперёд» */}
      <Card className="p-5 sm:p-6" id="forecast">
        <h2 className="font-semibold">{t("forecastTitle")}</h2>
        <p className={cn("mt-1 text-sm", firstGap ? "text-error" : "text-gray-700")}>
          {firstGap ? t("forecastGap", { date: formatDate(firstGap.date, locale), sum: formatSom(-minGap, locale) }) : t("forecastOk")}
        </p>
        <div className="mt-4"><ForecastChart points={d.cashForecast} /></div>
      </Card>

      {/* 7. Последние операции */}
      <Card className="p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{t("recentTitle")}</h2>
          <Link href="/app/operations" className="inline-flex min-h-11 items-center text-sm font-medium text-graphite-900 hover:underline">{t("allOps")} →</Link>
        </div>
        {recent.loading && !recent.data ? (
          <div className="mt-3 space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : recent.error ? (
          <ErrorState onRetry={recent.retry} />
        ) : recent.data && recent.data.length ? (
          <ul className="mt-2 divide-y divide-gray-200">
            {recent.data.map((tx) => <li key={tx.id}><TxRow tx={tx} onClick={() => openAdd(tx)} /></li>)}
          </ul>
        ) : (
          <EmptyState title={t("noOps")}><Button onClick={() => openAdd()}>{t("addFirst")}</Button></EmptyState>
        )}
      </Card>
    </div>
  );
}

function Spark({ points }: { points: number[] }) {
  if (points.length < 2) return null;
  const min = Math.min(...points), max = Math.max(...points);
  const path = points.map((v, i) => `${i ? "L" : "M"}${(i / (points.length - 1)) * 400},${56 - ((v - min) / (max - min || 1)) * 48}`).join(" ");
  return (
    <svg viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden className="pointer-events-none absolute bottom-0 right-0 hidden h-28 w-1/2 opacity-80 md:block">
      <path d={path} fill="none" stroke="#E0566D" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-3"><dt className="text-gray-700">{label}</dt><dd>{value}</dd></div>;
}

export function ScoreRing({ value, size = 64 }: { value: number; size?: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label={`${value}/100`} className="shrink-0">
      <circle cx="32" cy="32" r={r} fill="none" stroke="#F2F4F7" strokeWidth="7" />
      <circle cx="32" cy="32" r={r} fill="none" stroke="#22262C" strokeWidth="7" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} transform="rotate(-90 32 32)" />
      <text x="32" y="37" textAnchor="middle" fontSize="16" fontWeight="700" fill="#22262C">{value}</text>
    </svg>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-44" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
      <Skeleton className="h-56" />
      <Skeleton className="h-72" />
    </div>
  );
}

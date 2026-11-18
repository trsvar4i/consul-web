"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Check, Download, Flame } from "lucide-react";
import { getDashboard, getReconcile, stepDone } from "@/lib/api";
import { usePageContext } from "@/lib/assistant-context";
import { useData } from "@/lib/use-data";
import type { Locale } from "@/lib/types";
import { ErrorState } from "../brand/blocks";
import { WhyButton } from "../assistant/WhyButton";
import { Badge, Button, ButtonLink, Card, cn, Skeleton } from "../ui/primitives";
import { Link } from "@/i18n/navigation";
import { useApp } from "./AppShell";

type Step = { n: number; key: string; pts: number; href: string; done: boolean };

/** Паспорт бизнеса: степпер из 7 шагов + оценка, направления и задания. */
export function Passport() {
  const t = useTranslations("passport");
  const lv = useTranslations("levels");
  const c = useTranslations("common");
  const locale = useLocale() as Locale;
  const { business, version } = useApp();
  const q = useData(async () => ({ dash: await getDashboard(undefined, locale), rec: await getReconcile() }), [locale, version]);
  const [flags, setFlags] = useState({ tax: false, credit: false, plan: false });
  // eslint-disable-next-line react-hooks/set-state-in-effect -- flags live in localStorage
  useEffect(() => setFlags({ tax: stepDone("tax"), credit: stepDone("credit"), plan: stepDone("plan") }), [version]);
  usePageContext({ page: "other", title: t("h1") });

  if (q.error) return <Card><ErrorState onRetry={q.retry} /></Card>;
  if (!q.data) return <div className="space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-56" /><Skeleton className="h-64" /></div>;

  const matched = q.data.rec.filter((r) => r.status !== "unmatched").length;
  const steps: Step[] = [
    { n: 1, key: "1", pts: 5, href: "/app/operations", done: true },
    { n: 2, key: "2", pts: 5, href: "/app/settings", done: business?.cashNow !== undefined },
    { n: 3, key: "3", pts: 4, href: "/app/settings", done: (business?.recurringPayments.length ?? 0) > 0 },
    { n: 4, key: "4", pts: 3, href: "/tools/tax-regime", done: flags.tax },
    { n: 5, key: "5", pts: 6, href: "/app/reconcile", done: matched >= 3 },
    { n: 6, key: "6", pts: 6, href: "/app/credit", done: flags.credit },
    { n: 7, key: "7", pts: 10, href: "/app/plan", done: flags.plan },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const next = steps.find((s) => !s.done);
  const bonus = steps.slice(3).filter((s) => s.done).reduce((a, s) => a + s.pts, 0);
  const score = Math.min(100, q.data.dash.score + bonus);
  const level = score < 40 ? lv("novice") : score < 70 ? lv("order") : lv("bankReady");
  const levelIdx = score < 40 ? 0 : score < 70 ? 1 : 2;
  const dirs = [
    { k: "accounting", v: 72 },
    { k: "money", v: q.data.dash.cashForecast.some((p) => p.balance < 0) ? 45 : 80 },
    { k: "tax", v: flags.tax ? 85 : 60 },
    { k: "credit", v: Math.min(95, 50 + matched * 3 + (flags.credit ? 15 : 0)) },
  ];
  const r = 52;
  const circ = 2 * Math.PI * r;

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight lg:text-[36px]">{t("h1")}</h1>
          <p className="mt-1 text-gray-700">{t("subtitle")}</p>
        </div>
        <WhyButton metric="score" value={score} question={t("whyQ")} />
      </div>

      {/* Степпер: уровень, прогресс и 7 шагов */}
      <Card className="p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-700">{t("levelLabel")}</p>
            <p className="mt-1 text-2xl font-semibold">{level} · <span className="num">{score}/100</span></p>
            <p className="mt-1 text-sm text-gray-700">
              {[lv("novice"), lv("order"), lv("bankReady")].map((n, i) => (
                <span key={n}>
                  {i > 0 && " → "}
                  <span className={cn(i === levelIdx && "font-semibold text-graphite-900")}>{n}</span>
                </span>
              ))}
            </p>
          </div>
          <p className="text-sm text-gray-700">{t("passed", { done: doneCount, total: steps.length })}</p>
        </div>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-mist" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100} aria-label={t("score")}>
          <div className="h-full rounded-full bg-graphite-900 transition-[width] duration-700" style={{ width: `${score}%` }} />
        </div>

        <ol className="mt-7 grid grid-cols-4 gap-x-2 gap-y-5 sm:grid-cols-7">
          {steps.map((s) => {
            const isNext = next?.n === s.n;
            return (
              <li key={s.n}>
                <Link href={s.href} className="group flex flex-col items-center text-center">
                  <span
                    className={cn(
                      "grid size-12 place-items-center rounded-[14px] text-sm font-semibold transition-transform group-hover:-translate-y-0.5 sm:size-14",
                      s.done && "bg-graphite-900 text-white",
                      isNext && "border-2 border-brand-500 bg-white text-brand-500 shadow-[0_0_0_4px_#FBEAED]",
                      !s.done && !isNext && "border-2 border-dashed border-gray-200 bg-white text-gray-500",
                    )}
                  >
                    {s.done ? <Check size={22} aria-hidden /> : String(s.n).padStart(2, "0")}
                  </span>
                  <span className="mt-2 text-[13px] font-medium leading-tight text-graphite-900">{t(`s${s.key}`)}</span>
                  <span className={cn("mt-0.5 text-xs", s.done ? "text-success" : isNext ? "font-medium text-brand-500" : "text-gray-700")}>
                    {s.done ? t("stDone") : isNext ? t("stNext") : t("stTodo")}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>

        {next ? (
          <div className="mt-6 flex flex-col gap-3 rounded-card bg-brand-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-600">{t("nextTitle")} · {t("points", { n: next.pts })}</p>
              <p className="mt-1 font-semibold">{t(`s${next.key}`)}</p>
              <p className="text-sm text-gray-700">{t(`d${next.key}`)}</p>
            </div>
            <ButtonLink href={next.href} className="shrink-0">{t("go")} <ArrowRight size={16} aria-hidden /></ButtonLink>
          </div>
        ) : (
          <div className="mt-6 rounded-card bg-success-50 p-4">
            <p className="font-semibold text-success">{t("allDoneTitle")}</p>
            <p className="text-sm text-gray-700">{t("allDoneText")}</p>
          </div>
        )}
      </Card>

      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        {/* Кольцо оценки и серия */}
        <Card className="flex flex-col items-center p-6 text-center">
          <svg width="150" height="150" viewBox="0 0 120 120" role="img" aria-label={`${t("score")}: ${score}/100`}>
            <circle cx="60" cy="60" r={r} fill="none" stroke="#F2F4F7" strokeWidth="10" />
            <circle cx="60" cy="60" r={r} fill="none" stroke="#22262C" strokeWidth="10" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)} transform="rotate(-90 60 60)" style={{ transition: "stroke-dashoffset .8s" }} />
            <text x="60" y="64" textAnchor="middle" fontSize="28" fontWeight="700" fill="#22262C">{score}</text>
            <text x="60" y="80" textAnchor="middle" fontSize="10" fill="#4A535E">/ 100</text>
          </svg>
          <p className="mt-2 font-semibold">{level}</p>
          <div className="mt-4 flex w-full items-center gap-3 rounded-card bg-mist px-4 py-3 text-left">
            <Flame className="shrink-0 text-warning" aria-hidden />
            <div>
              <p className="text-xs text-gray-700">{t("streak")}</p>
              <p className="font-semibold">{t("streakText", { n: 12 })}</p>
            </div>
          </div>
          <Button variant="secondary" disabled className="mt-4 w-full"><Download size={16} aria-hidden /> PDF <Badge>{c("soon")}</Badge></Button>
        </Card>

        {/* Направления */}
        <div className="grid gap-3 sm:grid-cols-2">
          {dirs.map((d) => (
            <Card key={d.k} className="p-5">
              <div className="flex items-baseline justify-between">
                <p className="font-semibold">{t(`d_${d.k}`)}</p>
                <p className="num text-lg font-semibold">{d.v}%</p>
              </div>
              <p className="text-sm text-gray-700">{t(`d_${d.k}Text`)}</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-mist">
                <div className={cn("h-full rounded-full", d.v >= 70 ? "bg-success" : d.v >= 50 ? "bg-graphite-900" : "bg-warning")} style={{ width: `${d.v}%` }} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

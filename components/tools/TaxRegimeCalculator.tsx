"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { BadgeCheck } from "lucide-react";
import { compareRegimes, type RegimeKey } from "@/lib/calc/tax";
import { RULES } from "@/lib/calc/rules";
import type { Activity } from "@/lib/types";
import { formatDateFull, formatSom } from "@/lib/format";
import { useAssistant } from "@/lib/assistant-context";
import { markStep } from "@/lib/api";
import { MoneyInput } from "../brand/MoneyInput";
import { Banner } from "../brand/blocks";
import { WhyButton } from "../assistant/WhyButton";
import { Segmented } from "../ui/segmented";
import { StickyResult } from "./StickyResult";
import { Card, cn, Label, Select } from "../ui/primitives";

const ACTIVITIES: Activity[] = ["trade", "catering", "services", "production", "other"];

export function TaxRegimeCalculator() {
  const t = useTranslations("tax");
  const locale = useLocale();
  const { updatePageData } = useAssistant();
  const formRef = useRef<HTMLDivElement>(null);
  const resRef = useRef<HTMLDivElement>(null);
  const [legalForm, setLegalForm] = useState<"ip" | "legal">("ip");
  const [activity, setActivity] = useState<Activity>("trade");
  const [rate, setRate] = useState(0.04);
  const [revenue, setRevenue] = useState<number | undefined>(600_000_000);
  const [purchases, setPurchases] = useState<number | undefined>(384_000_000);
  const [other, setOther] = useState<number | undefined>(144_000_000);

  const r = useMemo(
    () => compareRegimes({ legalForm, activity, turnoverRate: rate, revenue: revenue ?? 0, purchases: purchases ?? 0, otherExpenses: other ?? 0 }),
    [legalForm, activity, rate, revenue, purchases, other],
  );

  const name = (k: RegimeKey) => t(`regime_${k}`);
  useEffect(() => markStep("tax"), []);
  useEffect(() => {
    const avail = r.results.filter((x) => x.available).sort((a, b) => a.taxYear - b.taxYear);
    updatePageData(
      { best: r.best ? name(r.best) : "—", bestTax: Math.round(avail[0]?.taxYear ?? 0), diff: Math.round((avail[1]?.taxYear ?? avail[0]?.taxYear ?? 0) - (avail[0]?.taxYear ?? 0)), revenue, activity },
      t("context", { revenue: formatSom(revenue ?? 0, locale), activity: t(activity) }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r, revenue, activity, locale]);

  return (
    <div className="space-y-6">
      <div ref={formRef}>
      <Card className="grid gap-5 p-5 sm:p-6 md:grid-cols-2">
        <div>
          <p className="mb-1.5 text-sm font-medium">{t("form")}</p>
          <Segmented label={t("form")} value={legalForm} onChange={setLegalForm} options={[{ value: "ip", label: t("ip") }, { value: "legal", label: t("legal") }]} />
        </div>
        <div>
          <Label htmlFor="tax-activity">{t("activity")}</Label>
          <Select id="tax-activity" value={activity} onChange={(e) => setActivity(e.target.value as Activity)}>
            {ACTIVITIES.map((a) => <option key={a} value={a}>{t(a)}</option>)}
          </Select>
        </div>
        <div className="md:col-span-2">
          {legalForm === "ip" ? (
            <>
              <p className="text-sm font-medium">{t("turnoverRate")}</p>
              <p className="mt-1 text-[15px] text-gray-700">{t("ipRate")}</p>
            </>
          ) : (
            <>
              <Label htmlFor="tax-rate">{t("turnoverRate")}</Label>
              <Select id="tax-rate" value={rate} onChange={(e) => setRate(Number(e.target.value))} aria-describedby="tax-rate-hint" className="md:max-w-xs">
                {RULES.turnoverRatesLegal.map((x) => <option key={x} value={x}>{x * 100}%</option>)}
              </Select>
              <p id="tax-rate-hint" className="mt-1 text-sm text-gray-700">{t("legalRateHint")}</p>
            </>
          )}
        </div>
        <MoneyInput label={t("revenue")} value={revenue} onChange={setRevenue} />
        <MoneyInput label={t("purchases")} value={purchases} onChange={setPurchases} />
        <MoneyInput label={t("other_expenses")} value={other} onChange={setOther} className="md:col-span-2 md:max-w-[calc(50%-10px)]" />
      </Card>
      </div>

      {r.overGeneralThreshold && <Banner level="warning">{t("thresholdWarn")}</Banner>}
      {r.ipOverLimit && <Banner level="warning">{t("ipLimit")}</Banner>}

      <div ref={resRef} className="grid scroll-mt-24 gap-4 md:grid-cols-3" aria-live="polite">
        {r.results.map((x) => {
          const best = r.best === x.key;
          return (
            <Card key={x.key} className={cn("flex flex-col p-5", best && "border-2 border-success", !x.available && "bg-mist")}>
              <div className="flex min-h-12 items-start justify-between gap-2">
                <h3 className={cn("font-semibold leading-snug", !x.available && "text-gray-700")}>{name(x.key)}</h3>
                {best && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-medium text-white">
                    <BadgeCheck size={14} aria-hidden /> {t("best")}
                  </span>
                )}
              </div>
              {x.available ? (
                <dl className="mt-4 flex-1 space-y-3">
                  <div>
                    <dt className="text-sm text-gray-700">{t("taxYear")}</dt>
                    <dd className="num text-2xl font-bold tracking-tight">{formatSom(x.taxYear, locale)}</dd>
                  </div>
                  <div className="flex justify-between gap-2 border-t border-gray-200 pt-3 text-sm">
                    <dt className="text-gray-700">{t("taxMonth")}</dt>
                    <dd className="num font-medium">{formatSom(x.taxMonth, locale)}</dd>
                  </div>
                  <div className="flex justify-between gap-2 text-sm">
                    <dt className="text-gray-700">{t("remains")}</dt>
                    <dd className={cn("num font-medium", x.remains < 0 && "text-error")}>{formatSom(x.remains, locale)}</dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-4 flex-1 text-sm text-gray-700">{x.reason === "activity" ? t("unavailableActivity") : t("ipLimit")}</p>
              )}
              {x.available && (
                <WhyButton className="mt-4 self-start" metric={`tax_${x.key}`} value={x.taxYear} question={t("whyQ")} />
              )}
            </Card>
          );
        })}
      </div>

      {r.best && (
        <StickyResult target={resRef} area={formRef} tone="success"
          label={`${t("best")}: ${name(r.best)}`}
          value={`${formatSom(r.results.find((x) => x.key === r.best)!.taxYear, locale)} · ${t("taxYear").toLowerCase()}`} />
      )}
      <p className="text-sm text-gray-700">{t("disclaimer", { date: formatDateFull(RULES.effectiveFrom, locale) })}</p>
    </div>
  );
}

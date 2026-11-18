"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { loadLevel, loadPct, overpayment, schedule, totalPaid, type PaymentType } from "@/lib/calc/credit";
import { formatNum, formatSom } from "@/lib/format";
import { getSession } from "@/lib/api";
import { useAssistant } from "@/lib/assistant-context";
import { MoneyInput } from "../brand/MoneyInput";
import { WhyButton } from "../assistant/WhyButton";
import { Segmented } from "../ui/segmented";
import { StickyResult } from "./StickyResult";
import { ButtonLink, Card, cn, Input, Label } from "../ui/primitives";

const schema = z.object({
  sum: z.number().min(0).max(100_000_000_000),
  rate: z.number().min(0).max(100),
  months: z.number().min(3).max(60),
  type: z.enum(["annuity", "differentiated"]),
  profit: z.number().min(0).optional(),
});
type Form = z.infer<typeof schema>;

export function CreditCalculator({ embedded = false }: { embedded?: boolean }) {
  const t = useTranslations("credit");
  const locale = useLocale();
  const { updatePageData } = useAssistant();
  const [showSchedule, setShowSchedule] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const resRef = useRef<HTMLDivElement>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- session lives in localStorage
  useEffect(() => setLoggedIn(!!getSession()), []);

  const { control, register } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { sum: 50_000_000, rate: 24, months: 24, type: "annuity", profit: undefined },
    mode: "onChange",
  });
  const v = useWatch({ control });
  const sum = v.sum ?? 0;
  const rate = Number.isFinite(v.rate) ? (v.rate as number) : 0;
  const months = v.months ?? 24;
  const type = (v.type ?? "annuity") as PaymentType;
  const profit = v.profit;

  const rows = useMemo(() => schedule(type, sum, rate, months), [type, sum, rate, months]);
  const first = rows[0]?.payment ?? 0;
  const last = rows[rows.length - 1]?.payment ?? 0;
  const over = overpayment(rows, sum);
  const total = totalPaid(rows);
  const pct = profit ? loadPct(first, profit) : undefined;
  const level = pct !== undefined ? loadLevel(pct) : undefined;

  // keep the assistant aware of the current numbers (no personal data)
  useEffect(() => {
    updatePageData(
      { sum, rate, months, type, payment: Math.round(first), profit: profit ?? 6_000_000, loadPct: pct !== undefined ? Math.round(pct) : Math.round(loadPct(first, 6_000_000)), overpay: Math.round(over), total: Math.round(total), sumNeg: -sum },
      t("context", { sum: formatSom(sum, locale), months, rate }),
    );
  }, [sum, rate, months, type, first, profit, pct, over, total, updatePageData, t, locale]);

  const levelUi = level && {
    ok: { label: t("loadOk"), cls: "text-success", bar: "bg-success" },
    hard: { label: t("loadHard"), cls: "text-warning", bar: "bg-warning" },
    danger: { label: t("loadDanger"), cls: "text-error", bar: "bg-error" },
  }[level];

  return (
    <div className={cn("grid gap-6", !embedded && "lg:grid-cols-[1fr_1.05fr] lg:gap-8")}>
      {/* Inputs */}
      <div ref={formRef}>
      <Card className="space-y-5 p-5 sm:p-6">
        <Controller control={control} name="sum" render={({ field }) => (
          <MoneyInput label={t("sum")} value={field.value} onChange={(n) => field.onChange(n ?? 0)} />
        )} />
        <div>
          <Label htmlFor="credit-rate">{t("rate")}</Label>
          <Input id="credit-rate" type="number" inputMode="decimal" step="0.5" min={0} max={100} className="num" {...register("rate", { valueAsNumber: true })} />
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <Label htmlFor="credit-term">{t("term")}</Label>
            <span className="num text-sm font-semibold">{t("termValue", { n: months })}</span>
          </div>
          <input id="credit-term" type="range" min={3} max={60} step={1} className="h-11 w-full" {...register("months", { valueAsNumber: true })} />
          <div className="flex justify-between text-xs text-gray-700 num"><span>3</span><span>60</span></div>
        </div>
        <div>
          <p className="mb-1.5 text-sm font-medium">{t("type")}</p>
          <Controller control={control} name="type" render={({ field }) => (
            <Segmented label={t("type")} value={field.value} onChange={field.onChange}
              options={[{ value: "annuity", label: t("annuityShort") }, { value: "differentiated", label: t("differentiatedShort") }]} />
          )} />
          <p className="mt-1.5 text-xs text-gray-700">{type === "annuity" ? t("annuity") : t("differentiated")}</p>
        </div>
        <Controller control={control} name="profit" render={({ field }) => (
          <MoneyInput label={t("profit")} hint={t("profitHint")} value={field.value} onChange={field.onChange} />
        )} />
      </Card>
      </div>

      {/* Results (live, no submit button) */}
      <div className="space-y-4" aria-live="polite">
        <div ref={resRef} className="scroll-mt-24">
        <Card className="p-5 sm:p-6">
          <p className="text-sm text-gray-700">{type === "annuity" ? t("payment") : t("paymentFirstLast")}</p>
          <p className="num mt-1 text-[40px] font-bold leading-none tracking-tight text-brand-500 lg:text-[48px]">
            {type === "annuity" ? formatNum(first) : `${formatNum(first)} → ${formatNum(last)}`}
          </p>
          <p className="mt-1 text-sm text-gray-700">{locale === "uz" ? "soʻm" : "сум"} · {t("termValue", { n: months })}</p>
          <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
            <div>
              <dt className="text-sm text-gray-700">{t("overpay")}</dt>
              <dd className="num mt-0.5 whitespace-nowrap text-base font-semibold sm:text-lg">{formatSom(over, locale)}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-700">{t("total")}</dt>
              <dd className="num mt-0.5 whitespace-nowrap text-base font-semibold sm:text-lg">{formatSom(total, locale)}</dd>
            </div>
          </dl>
        </Card>
        </div>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold">{t("load")}</p>
            <WhyButton metric="credit_load" value={pct} question={t("whyLoad")} />
          </div>
          {pct !== undefined && levelUi ? (
            <>
              <p className={cn("num mt-2 text-2xl font-bold", levelUi.cls)}>
                {Number.isFinite(pct) ? Math.round(pct) : "∞"}% · {levelUi.label}
              </p>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-mist" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, Math.round(pct))} aria-label={t("load")}>
                <div className={cn("h-full rounded-full transition-[width] duration-300", levelUi.bar)} style={{ width: `${Math.min(100, pct)}%` }} />
              </div>
              <div className="mt-1 flex justify-between text-xs text-gray-700 num"><span>0</span><span>30%</span><span>50%</span><span>100%</span></div>
            </>
          ) : (
            <p className="mt-2 text-sm text-gray-700">{t("loadEmpty")}</p>
          )}
          <p className="mt-3 text-xs text-gray-700">{t("loadNote")}</p>
        </Card>

        {!embedded && (
          <ButtonLink href={loggedIn ? "/app/credit" : "/login"} variant="secondary" className="w-full">
            {t("checkMine")} <ArrowRight size={16} aria-hidden />
          </ButtonLink>
        )}

        <div>
          <button type="button" onClick={() => setShowSchedule((s) => !s)} aria-expanded={showSchedule}
            className="min-h-11 text-sm font-medium text-brand-500 hover:underline">
            {showSchedule ? t("hideSchedule") : t("showSchedule")}
          </button>
          {showSchedule && (
            <div className="mt-2 max-h-96 overflow-auto rounded-card border border-gray-200">
              <table className="w-full text-sm num">
                <thead className="sticky top-0 bg-mist text-left text-gray-700">
                  <tr>
                    <th className="px-3 py-2 font-medium">{t("month")}</th>
                    <th className="px-3 py-2 text-right font-medium">{t("colPayment")}</th>
                    <th className="hidden px-3 py-2 text-right font-medium sm:table-cell">{t("colPrincipal")}</th>
                    <th className="hidden px-3 py-2 text-right font-medium sm:table-cell">{t("colInterest")}</th>
                    <th className="px-3 py-2 text-right font-medium">{t("colBalance")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.month} className="border-t border-gray-200">
                      <td className="px-3 py-1.5">{r.month}</td>
                      <td className="px-3 py-1.5 text-right">{formatNum(r.payment)}</td>
                      <td className="hidden px-3 py-1.5 text-right sm:table-cell">{formatNum(r.principal)}</td>
                      <td className="hidden px-3 py-1.5 text-right sm:table-cell">{formatNum(r.interest)}</td>
                      <td className="px-3 py-1.5 text-right">{formatNum(r.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {!embedded && (
        <StickyResult target={resRef} area={formRef}
          label={`${type === "annuity" ? t("payment") : t("paymentFirstLast")}${levelUi && pct !== undefined ? ` · ${Math.round(pct)}% ${levelUi.label.toLowerCase()}` : ""}`}
          value={`${type === "annuity" ? formatNum(first) : `${formatNum(first)} → ${formatNum(last)}`} ${locale === "uz" ? "soʻm" : "сум"}`}
          tone={level === "danger" ? "error" : level === "hard" ? "warning" : "brand"} />
      )}
    </div>
  );
}

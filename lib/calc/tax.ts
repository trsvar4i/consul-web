import { RULES } from "./rules";
import type { Activity, LegalForm } from "../types";

// ЧЕРНОВИК формул (раздел 8.3 ТЗ). Аналитик проверит.
export type TaxInput = {
  legalForm: Exclude<LegalForm, "unregistered">;
  activity: Activity;
  turnoverRate: number; // 0.01..0.04 для юрлица
  revenue: number;
  purchases: number;
  otherExpenses: number;
};

export type RegimeKey = "turnover" | "vat6" | "vat12";
export type RegimeResult = {
  key: RegimeKey;
  available: boolean;
  reason?: "activity" | "ip_limit";
  taxYear: number;
  taxMonth: number;
  remains: number;
};

export function compareRegimes(input: TaxInput) {
  const { revenue, purchases, otherExpenses } = input;
  const base = revenue - purchases - otherExpenses;

  // 1. Налог с оборота
  const ipOverLimit = input.legalForm === "ip" && revenue > RULES.turnoverRateIPLimitSom;
  const rate = input.legalForm === "ip" ? RULES.turnoverRateIP : input.turnoverRate;
  const t1 = revenue * rate;

  // 2. Упрощённый НДС 6% (цены с НДС), налог на прибыль 0
  const vat6Allowed = (RULES.simplifiedVatActivities as readonly string[]).includes(input.activity);
  const t2 = (revenue * 6) / 106;

  // 3. НДС 12% + налог на прибыль 15%
  const vat12 = Math.max(0, ((revenue - purchases) * 12) / 112);
  const profit = revenue - purchases - otherExpenses - vat12;
  const t3 = vat12 + Math.max(0, profit) * RULES.profitTax;

  const mk = (key: RegimeKey, tax: number, available: boolean, reason?: RegimeResult["reason"]): RegimeResult => ({
    key, available, reason, taxYear: tax, taxMonth: tax / 12, remains: base - tax,
  });

  const results: RegimeResult[] = [
    mk("turnover", t1, !ipOverLimit, ipOverLimit ? "ip_limit" : undefined),
    mk("vat6", t2, vat6Allowed, vat6Allowed ? undefined : "activity"),
    mk("vat12", t3, true),
  ];

  const available = results.filter((r) => r.available);
  const best = available.length ? available.reduce((a, b) => (b.taxYear < a.taxYear ? b : a)).key : null;

  return {
    results,
    best,
    overGeneralThreshold: revenue > RULES.generalRegimeThresholdSom,
    ipOverLimit,
  };
}

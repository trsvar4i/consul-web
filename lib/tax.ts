/** Uzbekistan small-business tax rules, 2026. Verify yearly: soliq.uz, lex.uz. */
export const BHM = 412_000; // base calculation value, soʻm
export const TURNOVER_1PCT_LIMIT = 1_000_000_000; // YaTT / self-employed 1% up to 1 bln a year
export const GENERAL_REGIME_LIMIT = 12_000 * BHM; // from 1 June 2026: ~4.944 bln
export const SELF_EMPLOYED_FREE = 100_000_000; // self-employed income exempt up to 100 mln a year
export const VAT = 12;
export const VAT_SIMPLIFIED = 6; // trade, catering, services, optional until 2030
export const PROFIT_TAX = 15;
export const TURNOVER_BASE = 4;

export type Status = "yatt" | "oob" | "mchj";
export type Regime = "ayl" | "q6" | "q12";

export interface TurnoverResult {
  rate: number;
  tone: "ok" | "w" | "e" | "";
  title: string;
  text: string;
  nextLimit: string | null;
}

/** Statutory turnover-tax rate for a status and the year's turnover including this month. */
export function turnoverRate(status: Status, yearTurnover: number): TurnoverResult {
  if (status === "oob" && yearTurnover <= SELF_EMPLOYED_FREE)
    return { rate: 0, tone: "ok", title: "Soliq yoʻq", text: "Oʻzini oʻzi band: yiliga 100 mln gacha ozod.", nextLimit: "100 mln" };
  if (status === "oob" && yearTurnover > TURNOVER_1PCT_LIMIT)
    return { rate: 1, tone: "w", title: "Chegaradan oshdi", text: "1 mlrd dan keyin YaTT yoki MChJ ochish kerak boʻlishi mumkin.", nextLimit: null };
  if (status !== "mchj" && yearTurnover <= TURNOVER_1PCT_LIMIT)
    return { rate: 1, tone: "ok", title: "Aylanmadan 1%", text: "Yiliga 1 mlrd gacha.", nextLimit: "1 mlrd" };
  if (yearTurnover <= GENERAL_REGIME_LIMIT)
    return status === "mchj"
      ? { rate: TURNOVER_BASE, tone: "", title: "Aylanmadan 4%", text: "Bazaviy stavka, faoliyatga qarab farq qilishi mumkin.", nextLimit: "~4,9 mlrd" }
      : { rate: TURNOVER_BASE, tone: "w", title: "1 mlrd dan oshdi — 4%", text: "1% faqat yiliga 1 mlrd gacha.", nextLimit: "~4,9 mlrd" };
  return { rate: TURNOVER_BASE, tone: "e", title: "~4,9 mlrd dan oshdi", text: "Umumiy rejimga oʻtasiz — «QQS 12%» yorligʻida hisoblang.", nextLimit: null };
}

/** Standard VAT + profit tax for a month. Amounts include VAT. */
export function vatAndProfit(sales: number, purchases: number, other: number, vat = VAT, profitTax = PROFIT_TAX) {
  const vatOut = (sales * vat) / (100 + vat);
  const vatIn = (purchases * vat) / (100 + vat);
  const vatDue = Math.max(0, vatOut - vatIn);
  const profit = sales - vatOut - (purchases - vatIn) - other;
  const profitDue = (Math.max(0, profit) * profitTax) / 100;
  return { vatDue, profit, profitDue, total: vatDue + profitDue };
}

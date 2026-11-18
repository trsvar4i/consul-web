/** Credit and pricing math. Pure functions, no UI. */
export type PayType = "annuity" | "diff";

export interface ScheduleRow { month: number; pay: number; interest: number; balance: number }
export interface CreditResult { rows: ScheduleRow[]; first: number; last: number; max: number; total: number; interest: number; fee: number }

/** Annuity payment for principal at monthly rate r over n months. */
export const annuity = (principal: number, n: number, r: number): number =>
  r > 0 ? (principal * r) / (1 - Math.pow(1 + r, -n)) : principal / n;

/** Full schedule with optional interest-only grace months and one-time fee (% of principal). */
export function credit(principal: number, annualRate: number, months: number, type: PayType, graceMonths = 0, feePct = 0): CreditResult {
  const n = Math.min(360, Math.max(1, Math.round(months)));
  const g = Math.max(0, Math.min(Math.round(graceMonths), n - 1));
  const r = annualRate / 1200, m = n - g;
  const ann = annuity(principal, m, r);
  let bal = principal, total = 0, interest = 0, max = 0;
  const rows: ScheduleRow[] = [];
  for (let i = 1; i <= n; i++) {
    const it = bal * r;
    let pay: number, princ: number;
    if (i <= g) { princ = 0; pay = it; }
    else if (type === "annuity") { pay = ann; princ = pay - it; }
    else { princ = principal / m; pay = princ + it; }
    bal = Math.max(0, bal - princ);
    total += pay; interest += it; max = Math.max(max, pay);
    rows.push({ month: i, pay, interest: it, balance: bal });
  }
  const fee = (principal * feePct) / 100;
  return { rows, first: rows[g].pay, last: rows[n - 1].pay, max, total: total + fee, interest, fee };
}

export type Risk = "ok" | "w" | "e";
/** Rule of thumb: the largest payment should stay under 30% of monthly profit. */
export const creditRisk = (maxPayment: number, profit: number): { share: number; risk: Risk } => {
  const share = profit > 0 ? maxPayment / profit : Infinity;
  return { share, risk: share <= 0.3 ? "ok" : share <= 0.45 ? "w" : "e" };
};

/** Largest principal whose annuity payment stays within 30% of profit (24 months, 24% by default). */
export const safeLoan = (profit: number, months = 24, annualRate = 24): number =>
  Math.floor((profit * 0.3) / annuity(1, months, annualRate / 1200) / 1e6) * 1e6;

export interface BreakEven { units: number; turnover: number; margin: number; unitsForGoal: number }
export function breakEven(fixed: number, price: number, cost: number, goal = 0): BreakEven | null {
  const margin = price - cost;
  if (margin <= 0) return null;
  const units = Math.ceil(fixed / margin);
  return { units, turnover: units * price, margin, unitsForGoal: Math.ceil((fixed + goal) / margin) };
}

export type PriceMode = "markup" | "price" | "margin";
/** Returns the selling price from cost and a markup %, a price, or a target margin %. */
export function priceFrom(mode: PriceMode, cost: number, x: number): number | null {
  if (mode === "markup") return cost * (1 + x / 100);
  if (mode === "price") return x;
  return x < 100 ? cost / (1 - x / 100) : null;
}
export const markupOf = (cost: number, price: number) => (cost ? ((price - cost) / cost) * 100 : 0);
export const marginOf = (cost: number, price: number) => (price ? ((price - cost) / price) * 100 : 0);

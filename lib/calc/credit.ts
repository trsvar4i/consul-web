import { LOAD } from "./rules";

export type PaymentType = "annuity" | "differentiated";
export type ScheduleRow = { month: number; payment: number; principal: number; interest: number; balance: number };

const monthlyRate = (ratePct: number) => ratePct / 12 / 100;

/** P = S * i / (1 - (1 + i)^(-n)); r = 0 → S / n */
export function annuityPayment(sum: number, ratePct: number, months: number): number {
  if (sum <= 0 || months <= 0) return 0;
  const i = monthlyRate(ratePct);
  if (i === 0) return sum / months;
  return (sum * i) / (1 - Math.pow(1 + i, -months));
}

export function annuitySchedule(sum: number, ratePct: number, months: number): ScheduleRow[] {
  const i = monthlyRate(ratePct);
  const p = annuityPayment(sum, ratePct, months);
  let balance = sum;
  const rows: ScheduleRow[] = [];
  for (let k = 1; k <= months; k++) {
    const interest = balance * i;
    const principal = p - interest;
    balance = Math.max(0, balance - principal);
    rows.push({ month: k, payment: p, principal, interest, balance });
  }
  return rows;
}

/** Платёж k = S/n + (S - (k-1)*S/n) * i */
export function differentiatedSchedule(sum: number, ratePct: number, months: number): ScheduleRow[] {
  if (sum <= 0 || months <= 0) return [];
  const i = monthlyRate(ratePct);
  const principal = sum / months;
  const rows: ScheduleRow[] = [];
  for (let k = 1; k <= months; k++) {
    const rest = sum - (k - 1) * principal;
    const interest = rest * i;
    rows.push({ month: k, payment: principal + interest, principal, interest, balance: Math.max(0, rest - principal) });
  }
  return rows;
}

export function schedule(type: PaymentType, sum: number, ratePct: number, months: number) {
  return type === "annuity" ? annuitySchedule(sum, ratePct, months) : differentiatedSchedule(sum, ratePct, months);
}

export function totalPaid(rows: ScheduleRow[]) {
  return rows.reduce((s, r) => s + r.payment, 0);
}

export function overpayment(rows: ScheduleRow[], sum: number) {
  return totalPaid(rows) - sum;
}

export type LoadLevel = "ok" | "hard" | "danger";
export function loadPct(payment: number, monthlyProfit: number) {
  if (monthlyProfit <= 0) return Infinity;
  return (payment / monthlyProfit) * 100;
}
export function loadLevel(pct: number): LoadLevel {
  if (pct < LOAD.comfortable) return "ok";
  if (pct <= LOAD.hard) return "hard";
  return "danger";
}

/** Максимальная сумма, при которой аннуитетный платёж ≤ доля прибыли (по умолчанию 30%). */
export function safeLoanAmount(monthlyProfit: number, ratePct: number, months: number, share = LOAD.comfortable / 100) {
  const maxPayment = monthlyProfit * share;
  const i = monthlyRate(ratePct);
  if (i === 0) return maxPayment * months;
  return (maxPayment * (1 - Math.pow(1 + i, -months))) / i;
}

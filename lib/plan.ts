/** Business plan math: extra monthly profit and payback from capital, sales and new costs. */
export interface Plan { goal: string; title: string; capital: number; sales: number; cogs: number; rent: number; helper: number; estimated: boolean }
export const GOALS: Record<string, Omit<Plan, "cogs" | "estimated" | "title"> & { title: string }> = {
  rasta: { goal: "rasta", title: "Ikkinchi rasta", capital: 30e6, sales: 25e6, rent: 2.7e6, helper: 2e6 },
  muz: { goal: "muz", title: "Muzlatgich va javon", capital: 12e6, sales: 6e6, rent: 0, helper: 0 },
  yangi: { goal: "yangi", title: "Yangi mahsulot", capital: 15e6, sales: 10e6, rent: 0, helper: 0 },
  yetk: { goal: "yetk", title: "Yetkazib berish", capital: 8e6, sales: 8e6, rent: 0, helper: 1.5e6 },
};
export const COGS = 0.64; // cost share of price, from the trader's history (45 000 / 70 200)
export const DEFAULT_PLAN: Plan = { ...GOALS.rasta, title: "Ikkinchi rasta · Chorsu", cogs: COGS, estimated: true };
export const planProfit = (p: Plan, k = 1) => p.sales * k * (1 - p.cogs) - p.rent - p.helper;
export const payback = (p: Plan, k = 1): number | null => { const x = planProfit(p, k); return x > 0 ? Math.ceil(p.capital / x) : null; };

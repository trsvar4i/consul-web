/** One money state for the demo cabinet. All numbers on screens derive from here. */
import { latin } from "./parse";

export interface Money {
  naqd: number; karta: number;        // cash on hand, card balance
  rent: number; supplier: number;     // 30-day obligations except tax
  income: number; buy: number; other: number; // current month
  taxRate: number;                    // turnover tax, fraction
  ytd: number;                        // turnover since 1 January (before this month)
  reserve: number;                    // user-chosen safety reserve
}
export interface Debtor { name: string; amount: number; days: number }
export interface Op { id: string; day: string; title: string; sub: string; amount: number; kind?: OpKind; note?: string }
export interface Ledger { money: Money; debtors: Debtor[]; ops: Op[]; memory: [string, string][]; checks?: Record<string, boolean> }

export interface View {
  cash: number; tax: number; obligations: number; reserve: number; free: number;
  expenses: number; profit: number; margin: number; owedToMe: number; debtorCount: number;
}

/** Average monthly profit for the last 3 months: credit and plan decisions use it, not the running month. */
export const PROFIT_3M = 6_000_000;

export function view(l: Ledger): View {
  const m = l.money;
  const cash = m.naqd + m.karta;
  const tax = Math.round(m.income * m.taxRate);
  const obligations = m.rent + m.supplier + tax;
  const expenses = m.buy + m.other;
  const profit = m.income - expenses;
  return {
    cash, tax, obligations, reserve: m.reserve, free: cash - obligations - m.reserve,
    expenses, profit, margin: m.income ? Math.round((profit / m.income) * 100) : 0,
    owedToMe: l.debtors.reduce((s, d) => s + d.amount, 0), debtorCount: l.debtors.length,
  };
}

export type Method = "naqd" | "karta";
export type OpKind = "sale" | "buy" | "exp" | "sup" | "nas" | "repaid";

let seq = 0;
const id = () => `op${Date.now()}${seq++}`;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const same = (name: string, who: string) => name.toLowerCase().startsWith(latin(who.toLowerCase()));

export interface Applied { ledger: Ledger; title: string; value: string; before: number; after: number }

/** Applies one operation immutably. `label` is an expense or product word, `who` a person. */
export function apply(l: Ledger, kind: OpKind, amount: number, method: Method, label?: string, who?: string): Applied {
  const before = view(l).free;
  const m = { ...l.money };
  let debtors = l.debtors.map(d => ({ ...d }));
  let title = "", sign = -1, sub = `hozir · ${method}`;
  switch (kind) {
    case "sale": m[method] += amount; m.income += amount; title = "Sotuv"; sign = 1; sub += " · 1% soliqqa ajratildi"; break;
    case "buy": m[method] -= amount; m.buy += amount; title = label ? `Xarid · ${label}` : "Xarid"; break;
    case "exp": m[method] -= amount; m.other += amount; title = cap(label || "xarajat"); if (label === "ijara") m.rent = Math.max(0, m.rent - amount); break;
    case "sup": m[method] -= amount; m.supplier = Math.max(0, m.supplier - amount); title = "Taʼminotchiga toʻlov"; break;
    case "nas": {
      const nm = cap(who || "mijoz");
      const i = debtors.findIndex(d => same(d.name, nm));
      if (i >= 0) debtors[i].amount += amount; else debtors.push({ name: nm, amount, days: 0 });
      m.income += amount; title = `Nasiya · ${i >= 0 ? debtors[i].name : nm}`; sign = 0; sub = "hozir · pul keyin keladi"; break;
    }
    case "repaid": {
      const i = debtors.findIndex(d => !!who && same(d.name, who));
      if (i < 0) throw new Error("debtor not found");
      const got = amount && amount < debtors[i].amount ? amount : debtors[i].amount;
      debtors[i].amount -= got; title = `Nasiya qaytdi · ${debtors[i].name}`;
      if (debtors[i].amount <= 0) debtors = debtors.filter((_, k) => k !== i);
      m.naqd += got; amount = got; sign = 1; sub = "hozir · naqd"; break;
    }
  }
  const value = (sign > 0 ? "+" : sign < 0 ? "−" : "") + Math.round(amount).toLocaleString("ru-RU").replace(/[   ,]/g, " ");
  const next: Ledger = { ...l, money: m, debtors, ops: [{ id: id(), day: "Bugun", title, sub, amount: sign * amount, kind }, ...l.ops] };
  return { ledger: next, title, value, before, after: view(next).free };
}

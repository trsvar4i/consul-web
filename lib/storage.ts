import type { Ledger } from "./ledger";

export const LEDGER_STORAGE_KEY = "consul:preview-ledger:v1";

/** A stale or malformed local snapshot must never break the cabinet. */
export function parseLedger(raw: string | null): Ledger | null {
  if (!raw) return null;
  try {
    const l = JSON.parse(raw);
    const moneyKeys = ["naqd", "karta", "rent", "supplier", "income", "buy", "other", "taxRate", "ytd", "reserve"];
    if (!l || !l.money || !moneyKeys.every(k => typeof l.money[k] === "number" && Number.isFinite(l.money[k]))) return null;
    if (!Array.isArray(l.ops) || !l.ops.every((o: Ledger["ops"][number]) => o && [o.id, o.day, o.title, o.sub].every(x => typeof x === "string") && Number.isFinite(o.amount) && (o.note === undefined || typeof o.note === "string"))) return null;
    if (!Array.isArray(l.debtors) || !l.debtors.every((d: Ledger["debtors"][number]) => d && typeof d.name === "string" && Number.isFinite(d.amount) && Number.isFinite(d.days))) return null;
    if (!Array.isArray(l.memory) || !l.memory.every((m: string[]) => Array.isArray(m) && m.length === 2 && m.every(x => typeof x === "string"))) return null;
    if (l.checks !== undefined && (!l.checks || typeof l.checks !== "object" || Array.isArray(l.checks) || !Object.values(l.checks).every(x => typeof x === "boolean"))) return null;
    return l;
  } catch { return null; }
}

export function readLedger(): Ledger | null {
  try { return parseLedger(localStorage.getItem(LEDGER_STORAGE_KEY)); } catch { return null; }
}

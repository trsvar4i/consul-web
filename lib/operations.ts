import { apply, type Ledger, type Method, type OpKind } from "./ledger";

export interface OperationInput {
  kind: Exclude<OpKind, "repaid">;
  amount: number;
  method: Method;
  category?: "ijara" | "svet" | "ish haqi" | "xarajat";
  who?: string;
  note?: string;
}

/** Manual entry uses the same accounting rules as the assistant. */
export function recordOperation(ledger: Ledger, input: OperationInput) {
  if (!["sale", "buy", "exp", "sup", "nas"].includes(input.kind)) throw new Error("kind");
  if (!Number.isSafeInteger(input.amount) || input.amount <= 0 || input.amount > 999_999_999_999) throw new Error("amount");
  if (input.method !== "naqd" && input.method !== "karta") throw new Error("method");
  const who = input.who?.trim();
  if (input.kind === "nas" && !who) throw new Error("who");
  const result = apply(ledger, input.kind, input.amount, input.method, input.kind === "exp" ? input.category : undefined, who);
  result.ledger.ops[0] = { ...result.ledger.ops[0], kind: input.kind, note: input.note?.trim().slice(0, 160) || undefined };
  return result;
}

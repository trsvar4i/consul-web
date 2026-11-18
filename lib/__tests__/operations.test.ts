import { describe, expect, it } from "vitest";
import { DEMO } from "../demo";
import { view } from "../ledger";
import { recordOperation } from "../operations";
import { parseLedger } from "../storage";

describe("manual operation accounting", () => {
  it("records a card sale, reserves tax, keeps the original snapshot for undo", () => {
    const before = JSON.stringify(DEMO);
    const r = recordOperation(DEMO, { kind: "sale", amount: 250_000, method: "karta", note: "  Тестовая продажа  " });
    expect(r.ledger.money.karta).toBe(DEMO.money.karta + 250_000);
    expect(r.ledger.money.naqd).toBe(DEMO.money.naqd);
    expect(r.ledger.money.income).toBe(DEMO.money.income + 250_000);
    expect(r.after - r.before).toBe(247_500);
    expect(r.ledger.ops[0]).toMatchObject({ amount: 250_000, kind: "sale", note: "Тестовая продажа" });
    expect(JSON.stringify(DEMO)).toBe(before);
  });
  it("reduces remaining rent without counting the obligation twice", () => {
    const r = recordOperation(DEMO, { kind: "exp", amount: 300_000, method: "naqd", category: "ijara" });
    expect(r.ledger.money.rent).toBe(DEMO.money.rent - 300_000);
    expect(r.ledger.money.other).toBe(DEMO.money.other + 300_000);
    expect(r.after).toBe(r.before);
  });
  it("settles a supplier obligation without charging purchases again", () => {
    const r = recordOperation(DEMO, { kind: "sup", amount: 400_000, method: "karta" });
    expect(r.ledger.money.supplier).toBe(DEMO.money.supplier - 400_000);
    expect(r.ledger.money.buy).toBe(DEMO.money.buy);
    expect(r.after).toBe(r.before);
  });
  it("adds a credit sale to receivables without adding cash", () => {
    const r = recordOperation(DEMO, { kind: "nas", amount: 120_000, method: "naqd", who: "Тестовый клиент" });
    expect(view(r.ledger).cash).toBe(view(DEMO).cash);
    expect(view(r.ledger).owedToMe).toBe(view(DEMO).owedToMe + 120_000);
    expect(r.ledger.ops[0]).toMatchObject({ amount: 0, kind: "nas" });
  });
  it.each([0, -1, 1.5, NaN, Infinity, 1_000_000_000_000])("rejects invalid amount %s before changing the ledger", amount => {
    expect(() => recordOperation(DEMO, { kind: "sale", amount, method: "naqd" })).toThrow("amount");
  });
  it("requires a customer for a credit sale", () => {
    expect(() => recordOperation(DEMO, { kind: "nas", amount: 100, method: "naqd", who: "  " })).toThrow("who");
  });
});

describe("local ledger snapshots", () => {
  it("restores operations, comments and diagnostic checks without changing amounts", () => {
    const l = recordOperation(DEMO, { kind: "buy", amount: 123_456, method: "naqd", note: "Покупка товара" }).ledger;
    l.checks = { balance: true, tax: false };
    const restored = parseLedger(JSON.stringify(l));
    expect(restored).toEqual(l);
    expect(view(restored!)).toEqual(view(l));
  });
  it.each([null, "", "{", "null", "{}", JSON.stringify({ ...DEMO, money: { ...DEMO.money, naqd: "123" } }), JSON.stringify({ ...DEMO, ops: [null] }), JSON.stringify({ ...DEMO, checks: { balance: "yes" } })])("ignores invalid snapshots", raw => {
    expect(parseLedger(raw)).toBeNull();
  });
});

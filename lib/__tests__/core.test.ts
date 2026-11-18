import { describe, expect, it } from "vitest";
import { DEMO } from "../demo";
import { apply, view } from "../ledger";
import { amount, intent } from "../parse";
import { credit, safeLoan, breakEven, priceFrom, marginOf } from "../finance";
import { turnoverRate, vatAndProfit } from "../tax";
import { answer } from "../answer";
import { DEFAULT_PLAN, payback, planProfit } from "../plan";

describe("demo numbers are consistent", () => {
  it("free money = cash − obligations − reserve", () => {
    const v = view(DEMO);
    expect(v.cash).toBe(12_000_000);
    expect(v.tax).toBe(500_000);
    expect(v.obligations).toBe(6_600_000);
    expect(v.free).toBe(4_200_000);
    expect(v.profit).toBe(6_000_000);
    expect(v.margin).toBe(12);
    expect(v.owedToMe).toBe(1_700_000);
  });
});

describe("amount parsing", () => {
  it.each([
    ["1,2 mln sotdim", 1_200_000], ["1.5 mln", 1_500_000], ["1 500 000 sotdim", 1_500_000],
    ["2млн продал", 2_000_000], ["svet 420 ming", 420_000], ["200 kg qoqi 9 mln xarid", 9_000_000],
    ["ijara 3 mln, 5-sanada", 3_000_000], ["sotdim", 0], ["0 sotdim", 0],
  ])("%s -> %d", (t, n) => expect(amount(t.toLowerCase())).toBe(n));
});

describe("intents", () => {
  const d = DEMO.debtors;
  it("sale with card", () => expect(intent("kartaga 2 mln sotdim", d)).toMatchObject({ type: "op", kind: "sale", amount: 2e6, method: "karta" }));
  it("expense label", () => expect(intent("svet 420 ming", d)).toMatchObject({ type: "op", kind: "exp", label: "svet" }));
  it("nasiya person", () => expect(intent("Karimga 500 ming nasiya", d)).toMatchObject({ type: "op", kind: "nas", who: "karim" }));
  it("repaid", () => expect(intent("Bekzod toʻladi", d)).toMatchObject({ type: "op", kind: "repaid", who: "Bekzod" }));
  it("cash fix", () => expect(intent("naqd 4,3 mln", d)).toEqual({ type: "fix", field: "naqd", amount: 4_300_000 }));
  it("rent reminder", () => expect(intent("ijara 3 mln, 5-sanada", d)).toEqual({ type: "rent", amount: 3e6, day: "5" }));
  it("question", () => expect(intent("kredit olsam boʻladimi?", d)).toEqual({ type: "question" }));
  it("amount only", () => expect(intent("500 000", d)).toEqual({ type: "need-kind", amount: 500_000 }));
  it("gibberish", () => expect(intent("asdf qwerty", d)).toEqual({ type: "unknown" }));
});

describe("ledger operations", () => {
  it("sale raises free money minus 1% tax", () => {
    const r = apply(DEMO, "sale", 1_200_000, "naqd");
    expect(r.after - r.before).toBe(1_188_000);
  });
  it("supplier payment keeps free money", () => {
    const r = apply(DEMO, "sup", 1_000_000, "naqd");
    expect(r.after).toBe(r.before);
  });
  it("repaid removes debtor and adds cash", () => {
    const r = apply(DEMO, "repaid", 0, "naqd", undefined, "Bekzod");
    expect(r.ledger.debtors.find(x => x.name === "Bekzod")).toBeUndefined();
    expect(r.after - r.before).toBe(500_000);
  });
  it("is immutable", () => { apply(DEMO, "sale", 1e6, "naqd"); expect(view(DEMO).free).toBe(4_200_000); });
});

describe("finance", () => {
  it("34 mln, 24%, 24 months annuity ≈ 1 797 617", () => expect(Math.round(credit(34e6, 24, 24, "annuity").first)).toBe(1_797_617));
  it("differentiated first payment", () => expect(Math.round(credit(34e6, 24, 24, "diff").first)).toBe(2_096_667));
  it("grace >= term is clamped", () => expect(credit(10e6, 24, 6, "annuity", 10).rows).toHaveLength(6));
  it("zero rate", () => expect(credit(12e6, 0, 12, "annuity").first).toBe(1e6));
  it("safe loan for 6 mln profit", () => expect(safeLoan(6e6)).toBe(34e6));
  it("break-even 480 kg", () => expect(breakEven(12e6, 70_000, 45_000)?.units).toBe(480));
  it("no break-even at loss", () => expect(breakEven(12e6, 40_000, 45_000)).toBeNull());
  it("markup 56% -> margin 35.9%", () => { const p = priceFrom("markup", 45_000, 56)!; expect(p).toBe(70_200); expect(marginOf(45_000, p)).toBeCloseTo(35.9, 1); });
  it("margin >= 100 is impossible", () => expect(priceFrom("margin", 45_000, 100)).toBeNull());
});

describe("tax rules 2026", () => {
  it("YaTT under 1 bln pays 1%", () => expect(turnoverRate("yatt", 590e6).rate).toBe(1));
  it("YaTT over 1 bln pays 4%", () => expect(turnoverRate("yatt", 1.2e9).rate).toBe(4));
  it("self-employed under 100 mln pays 0", () => expect(turnoverRate("oob", 60e6).rate).toBe(0));
  it("over 4.944 bln flags general regime", () => expect(turnoverRate("yatt", 5e9).tone).toBe("e"));
  it("VAT 12% with input credit", () => expect(Math.round(vatAndProfit(50e6, 32e6, 12e6).vatDue)).toBe(1_928_571));
});

describe("answers use live numbers", () => {
  const ctx = { ledger: DEMO, view: view(DEMO), route: "consul", last: null };
  it("loan 20 mln is 18% of average profit", () => expect(answer("20 mln kredit olsam?", ctx).reply.text).toContain("18%"));
  it("tax answer", () => expect(answer("soliq qachon?", ctx).reply.text).toContain("500 000"));
  it("plan follow-up rent", () => expect(answer("2,5 mln", { ...ctx, last: "plan" }).reply.text).toContain("4 500 000"));
  it("unknown is honest", () => expect(answer("futbol natijasi", ctx).reply.fallback).toBe(true));
});

describe("plan", () => {
  it("default plan pays back in 7 months", () => { expect(Math.round(planProfit(DEFAULT_PLAN))).toBe(4_300_000); expect(payback(DEFAULT_PLAN)).toBe(7); });
  it("20% less sales -> 12 months", () => expect(payback(DEFAULT_PLAN, 0.8)).toBe(12));
});

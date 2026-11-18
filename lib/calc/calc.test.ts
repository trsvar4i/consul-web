import { describe, expect, it } from "vitest";
import { annuityPayment, differentiatedSchedule, loadLevel, safeLoanAmount } from "./credit";
import { compareRegimes } from "./tax";
import { marginPct, priceFromMarkup } from "./markup";

describe("credit", () => {
  it("annuity 50M / 24% / 24m ≈ 2 643 555", () => {
    expect(Math.abs(annuityPayment(50_000_000, 24, 24) - 2_643_555)).toBeLessThan(1);
  });
  it("zero rate", () => expect(annuityPayment(1200, 0, 12)).toBe(100));
  it("differentiated first and last", () => {
    const rows = differentiatedSchedule(24_000_000, 24, 24);
    expect(rows[0].payment).toBeCloseTo(1_000_000 + 480_000);
    expect(rows[23].payment).toBeCloseTo(1_000_000 + 20_000);
  });
  it("load thresholds", () => {
    expect(loadLevel(29)).toBe("ok");
    expect(loadLevel(44)).toBe("hard");
    expect(loadLevel(51)).toBe("danger");
  });
  it("safe amount for 6M profit ≈ 34M", () => {
    expect(safeLoanAmount(6_000_000, 24, 24) / 1e6).toBeCloseTo(34.04, 1);
  });
});

describe("tax", () => {
  it("vat6 unavailable for production", () => {
    const r = compareRegimes({ legalForm: "ip", activity: "production", turnoverRate: 0.01, revenue: 600e6, purchases: 384e6, otherExpenses: 144e6 });
    expect(r.results.find((x) => x.key === "vat6")!.available).toBe(false);
    expect(r.best).toBe("turnover");
  });
  it("IP over 1bn disables turnover", () => {
    const r = compareRegimes({ legalForm: "ip", activity: "trade", turnoverRate: 0.01, revenue: 1.2e9, purchases: 0, otherExpenses: 0 });
    expect(r.ipOverLimit).toBe(true);
    expect(r.results[0].available).toBe(false);
  });
});

describe("markup", () => {
  it("price and margin", () => {
    expect(priceFromMarkup(100, 25)).toBe(125);
    expect(marginPct(100, 125)).toBe(20);
  });
});

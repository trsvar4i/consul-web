import type { Ledger } from "./ledger";

/** Demo persona: Dilnoza, dried fruits, Chorsu bazaar, YaTT. Sample data, not real people. */
export const DEMO: Ledger = {
  money: { naqd: 4_800_000, karta: 7_200_000, rent: 3_000_000, supplier: 3_100_000, income: 50_000_000, buy: 32_000_000, other: 12_000_000, taxRate: 0.01, ytd: 540_000_000, reserve: 1_200_000 },
  debtors: [{ name: "Bekzod", amount: 500_000, days: 21 }, { name: "Karim", amount: 500_000, days: 14 }, { name: "Shoira opa", amount: 700_000, days: 3 }],
  ops: [
    { id: "d1", day: "Bugun", title: "Sotuv", sub: "14:20", amount: 1_200_000 },
    { id: "d2", day: "Bugun", title: "Sotuv", sub: "10:40", amount: 950_000 },
    { id: "d3", day: "Kecha", title: "Xarid · oʻrik qoqi", sub: "200 kg · Chorsu · 50 400/kg", amount: -10_080_000 },
    { id: "d4", day: "Kecha", title: "Sotuv", sub: "", amount: 2_600_000 },
    { id: "d5", day: "15-noyabr", title: "Nasiya · Shoira opa", sub: "mayiz · 18 kg", amount: 0 },
    { id: "d6", day: "1-noyabr", title: "Svet", sub: "", amount: -420_000 },
  ],
  memory: [["Ijara", "3 000 000 · har oy 5-sanada"], ["Taʼminotchi", "Akmal aka · oʻrik qoqi, mayiz"], ["Yordamchi", "yoʻq"], ["Rasta", "Chorsu, 2-qator"], ["Maqsad", "ikkinchi rasta ochish"], ["Kredit", "34 mln haqida soʻragan · olmagan"], ["Til", "oʻzbekcha, ovoz bilan"]],
};

export const USER = { name: "Dilnoza", full: "Dilnoza Karimova", trade: "Quruq mevalar", place: "Chorsu", status: "YaTT" };

/** Market medians per kg (sample; production source: narx.stat.uz + user purchases). */
export const PRICES = [
  { name: "Oʻrik qoqi", mine: 50_400, chorsu: 45_000, oloy: 43_500 },
  { name: "Mayiz", mine: 37_000, chorsu: 38_000, oloy: 39_000 },
  { name: "Yongʻoq", mine: 70_000, chorsu: 70_000, oloy: 68_000 },
  { name: "Bodom", mine: 126_000, chorsu: 120_000, oloy: 116_000 },
];

/** Months for the bank report. November is as of the 18th. */
export const HISTORY = [
  { month: "Sentyabr", income: 46_000_000, expenses: 40_500_000 },
  { month: "Oktyabr", income: 48_100_000, expenses: 41_500_000 },
];

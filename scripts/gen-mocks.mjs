// Генератор моков. Запуск: node scripts/gen-mocks.mjs
// Демо-персонаж: Dilnoza, сухофрукты, рынок Chorsu, ИП, налог с оборота 1%.
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = (name, data) => {
  mkdirSync(join(root, "mocks"), { recursive: true });
  writeFileSync(join(root, "mocks", name), JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("mocks/" + name);
};

// deterministic random
let seed = 42;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const round = (n, step = 1000) => Math.round(n / step) * step;
const iso = (d) => d.toISOString().slice(0, 10);
const day = (s) => new Date(s + "T00:00:00Z");
const addDays = (d, n) => new Date(d.getTime() + n * 86400000);

export const TODAY = "2026-11-30";

/* ---------------- business ---------------- */
out("business.json", {
  id: "biz_dilnoza",
  ownerName: "Dilnoza",
  name: "Quruq mevalar",
  activity: "trade",
  legalForm: "ip",
  market: "chorsu",
  taxRegime: "turnover",
  cashNow: 11_500_000,
  revenueRange: "10to50",
  inputMethod: "demo",
  recurringPayments: [
    { id: "rp1", title: "Ijara / Аренда", amount: 3_000_000, dayOfMonth: 5, kind: "rent" },
    { id: "rp2", title: "Yordamchi / Помощник", amount: 2_500_000, dayOfMonth: 10, kind: "salary" },
    { id: "rp3", title: "Soliq / Налог", amount: 500_000, dayOfMonth: 15, kind: "tax" },
    { id: "rp4", title: "Aloqa / Связь", amount: 100_000, dayOfMonth: 20, kind: "other" },
  ],
});

/* ---------------- transactions (Sep–Nov 2026) ---------------- */
const products = [
  { id: "mayiz", uz: "mayiz", ru: "изюм", price: 56_000 },
  { id: "orik", uz: "oʻrik qoqi", ru: "курага", price: 62_000 },
  { id: "yongoq", uz: "yongʻoq", ru: "грецкий орех", price: 78_000 },
  { id: "bodom", uz: "bodom", ru: "миндаль", price: 120_000 },
];
const tx = [];
let id = 1;
const push = (t) => tx.push({ id: "t" + id++, ...t });
const monthTargets = { "2026-09": 43_000_000, "2026-10": 46_500_000, "2026-11": 50_000_000 };
const purchaseTargets = { "2026-09": 26_000_000, "2026-10": 29_000_000, "2026-11": 32_000_000 };

for (const [ym, revenue] of Object.entries(monthTargets)) {
  const [y, m] = ym.split("-").map(Number);
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  // sales: ~every 2 days aggregated, mixed methods
  const saleDays = [];
  for (let d = 1; d <= days; d += 1) if (d % 7 !== 0) saleDays.push(d);
  const weights = saleDays.map(() => 0.7 + rnd() * 0.6);
  const wsum = weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  saleDays.forEach((d, i) => {
    let amt = i === saleDays.length - 1 ? revenue - acc : round((revenue * weights[i]) / wsum, 10_000);
    acc += amt;
    const method = rnd() < 0.55 ? "cash" : rnd() < 0.6 ? "card" : "transfer";
    push({
      date: `${ym}-${String(d).padStart(2, "0")}`,
      amount: amt,
      type: "income",
      category: "sale",
      method,
      description: method === "cash" ? "Kunlik savdo / Продажи за день" : "Karta orqali savdo / Продажи по карте",
      matched: true,
    });
  });
  // purchases: 4 per month
  const pt = purchaseTargets[ym];
  const pdays = [3, 11, 18, 25];
  let pacc = 0;
  pdays.forEach((d, i) => {
    const p = products[i % products.length];
    const amt = i === 3 ? pt - pacc : round(pt / 4 + (rnd() - 0.5) * 2_000_000, 100_000);
    pacc += amt;
    const qty = Math.round(amt / p.price);
    push({
      date: `${ym}-${String(d).padStart(2, "0")}`,
      amount: -amt,
      type: "expense",
      category: "purchase",
      method: "transfer",
      description: `Xarid: ${p.uz} / Закупка: ${p.ru}`,
      item: { product: p.id, qty, unit: "kg" },
    });
  });
  push({ date: `${ym}-05`, amount: -3_000_000, type: "expense", category: "rent", method: "cash", description: "Ijara / Аренда места" });
  push({ date: `${ym}-10`, amount: -2_500_000, type: "expense", category: "salary", method: "cash", description: "Yordamchi maoshi / Зарплата помощника" });
  push({ date: `${ym}-15`, amount: -round(revenue * 0.01, 1000) + 0, type: "expense", category: "tax", method: "transfer", description: "Aylanma soligʻi / Налог с оборота" });
  push({ date: `${ym}-20`, amount: -100_000, type: "expense", category: "other", method: "card", description: "Aloqa / Связь" });
  push({ date: `${ym}-22`, amount: -({ "2026-09": 5_400_000, "2026-10": 4_735_000, "2026-11": 5_900_000 }[ym]), type: "expense", category: "other", method: "cash", description: "Transport, qadoq / Транспорт, упаковка" });
  push({ date: `${ym}-28`, amount: -2_000_000, type: "expense", category: "owner_draw", method: "cash", description: "Shaxsiy olish / Личное изъятие" });
  // receivables grow
  push({ date: `${ym}-12`, amount: { "2026-09": 1_500_000, "2026-10": 2_200_000, "2026-11": 2_600_000 }[ym], type: "receivable", category: "sale", method: "cash", description: "Doʻkon «Baraka» qarzga oldi / Магазин «Барака» взял в долг" });
}
tx.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
out("transactions.json", tx);

/* ---------------- dashboard ---------------- */
const start = addDays(day(TODAY), -29);
const forecast = [];
let bal = 9_800_000;
for (let k = 0; k < 120; k++) {
  const d = addDays(start, k);
  const dom = d.getUTCDate();
  const isForecast = k >= 30;
  bal += 1_550_000 + (rnd() - 0.5) * 300_000; // daily sales
  bal -= 1_090_000 + (rnd() - 0.5) * 200_000; // purchases spread over the month
  if (dom === 5) bal -= 3_000_000;
  if (dom === 10) bal -= 2_500_000;
  if (dom === 15) bal -= 500_000;
  if (dom === 22) bal -= 3_400_000;
  if (dom === 28) bal -= 2_000_000;
  if (isForecast) bal -= 95_000 + (k > 70 ? 120_000 : 0); // growing debts of buyers, seasonal dip
  if (k === 29) bal = 11_500_000;
  forecast.push({ date: iso(d), balance: bal, isForecast });
}
// Подгоняем прогноз: небольшой кассовый разрыв (~ -1,2 млн) в конце февраля
{
  const apply = (s) => forecast.map((p, k) => (k < 30 ? p.balance : p.balance + s * (k - 29)));
  let lo = -1e6, hi = 1e6;
  for (let it = 0; it < 80; it++) {
    const mid = (lo + hi) / 2;
    const mn = Math.min(...apply(mid));
    if (mn < -1_200_000) lo = mid; else hi = mid;
  }
  const adj = apply((lo + hi) / 2);
  forecast.forEach((p, k) => (p.balance = round(adj[k], 10_000)));
}
out("dashboard.json", {
  period: "2026-11",
  today: TODAY,
  safeToSpend: {
    amount: 4_200_000,
    cashNow: 11_500_000,
    obligations: [
      { title: { uz: "Ijara", ru: "Аренда" }, amount: 3_000_000, date: "2026-12-05" },
      { title: { uz: "Yordamchi maoshi", ru: "Помощник" }, amount: 2_500_000, date: "2026-12-10" },
      { title: { uz: "Aylanma soligʻi", ru: "Налог с оборота" }, amount: 500_000, date: "2026-12-15" },
      { title: { uz: "Aloqa va boshqalar", ru: "Связь и прочее" }, amount: 100_000, date: "2026-12-20" },
    ],
    reserve: 1_200_000,
  },
  kpis: {
    revenue: 50_000_000,
    expenses: 44_000_000,
    profitBeforeTax: 6_000_000,
    marginPct: 12,
    prev: { revenue: 46_500_000, expenses: 39_800_000, profitBeforeTax: 6_700_000, marginPct: 14.4 },
  },
  alerts: [
    { id: "a1", level: "warning", text: { uz: "5 kundan keyin ijara: 3 000 000 soʻm", ru: "Через 5 дней аренда: 3 000 000 сум" }, action: { label: { uz: "Toʻlovlar", ru: "Платежи" }, href: "/app/settings" } },
    { id: "a2", level: "warning", text: { uz: "Xaridorlar qarzi 4 mln soʻmgacha oshdi", ru: "Долги покупателей выросли до 4 млн сум" }, action: { label: { uz: "Qarzlarni koʻrish", ru: "Смотреть долги" }, href: "/app/operations?tab=debts" } },
    { id: "a3", level: "info", text: { uz: "8 ta tushum savdo bilan solishtirilmagan", ru: "8 поступлений не сопоставлены с продажами" }, action: { label: { uz: "Solishtirish", ru: "К сверке" }, href: "/app/reconcile" } },
    { id: "a5", level: "error", text: { uz: "Fevral oxirida pul yetmasligi mumkin", ru: "В конце февраля денег может не хватить" }, action: { label: { uz: "Prognoz", ru: "Прогноз" }, href: "/app#forecast" } },
  ],
  cashForecast: forecast,
  score: 58,
});

/* ---------------- reconcile ---------------- */
const recAmounts = [1_500_000, 1_200_000, 900_000, 1_100_000, 800_000, 700_000, 1_000_000, 800_000];
const names = ["Aziz K.", "Malika R.", "Bekzod T.", "OOO «Nur»", "Shahnoza A.", "Jasur M.", "Dilshod O.", "Kamola S."];
out(
  "reconcile.json",
  recAmounts.map((a, i) => ({
    id: "r" + (i + 1),
    date: iso(addDays(day("2026-11-02"), i * 3 + (i % 2))),
    amount: a,
    counterpartyMasked: `${names[i]} ••• ${String(1000 + Math.floor(rnd() * 9000))}`,
    status: "unmatched",
  })),
);

/* ---------------- prices ---------------- */
const P = [
  { product: "mayiz", uz: "Mayiz", ru: "Изюм", base: 50_000 },
  { product: "orik", uz: "Oʻrik qoqi", ru: "Курага", base: 58_000 },
  { product: "yongoq", uz: "Yongʻoq", ru: "Грецкий орех", base: 72_000 },
  { product: "bodom", uz: "Bodom", ru: "Миндаль", base: 115_000 },
  { product: "pista", uz: "Pista", ru: "Фисташки", base: 165_000 },
  { product: "xurmo", uz: "Xurmo", ru: "Финики", base: 45_000 },
];
const M = { chorsu: 1.0, oloy: 1.07, parkent: 0.96 };
const prices = [];
for (const p of P) {
  for (const [market, k] of Object.entries(M)) {
    const median = round(p.base * k, 500);
    const history = [];
    let v = median * (0.94 + rnd() * 0.03);
    for (let i = 29; i >= 0; i--) {
      v += (median - v) * 0.12 + (rnd() - 0.5) * median * 0.015;
      history.push({ date: iso(addDays(day(TODAY), -i)), median: round(i === 0 ? median : v, 500) });
    }
    prices.push({
      product: p.product,
      productName: { uz: p.uz, ru: p.ru },
      market,
      unit: "kg",
      min: round(median * 0.86, 500),
      median,
      max: round(median * 1.16, 500),
      updatedAt: TODAY,
      history,
    });
  }
}
out("prices.json", prices);
console.log("done");

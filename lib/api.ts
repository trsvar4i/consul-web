// ВСЕ запросы к данным идут через этот файл. Страницы никогда не импортируют моки напрямую.
// Когда бэкенд (Go) будет готов — меняем только этот файл.
import type {
  Business, ChatBlock, ChatMessage, Dashboard, Guide, Locale, PageContext, PageKind,
  PricePoint, ReconcileItem, ReconcileStatus, Transaction, L10n, Alert, Kpis,
} from "./types";
import businessMock from "@/mocks/business.json";
import dashboardMock from "@/mocks/dashboard.json";
import transactionsMock from "@/mocks/transactions.json";
import reconcileMock from "@/mocks/reconcile.json";
import pricesMock from "@/mocks/prices.json";
import guidesMock from "@/mocks/guides.json";
import assistantMock from "@/mocks/assistant.json";
import { formatNum, pickLang } from "./format";

export const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const isBrowser = () => typeof window !== "undefined";

/** Для проверки состояний экранов: добавьте ?mock=error или ?mock=empty к адресу */
function mockFlag(): "error" | "empty" | null {
  if (!isBrowser()) return null;
  const v = new URLSearchParams(window.location.search).get("mock");
  return v === "error" || v === "empty" ? v : null;
}
async function mockDelay(ms = 300) {
  await sleep(ms);
  if (mockFlag() === "error") throw new Error("network");
}

/* ---------------- local "backend" storage (only in mock mode) ---------------- */
const KEYS = {
  session: "consul_session",
  business: "consul_business",
  tx: "consul_tx",
  reconcile: "consul_reconcile",
} as const;

function read<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function write(key: string, value: unknown) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full / blocked */
  }
}
function remove(key: string) {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {}
}

async function http<T>(path: string, init?: RequestInit, locale?: Locale): Promise<T> {
  const res = await fetch(API_URL + path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(locale ? { "Accept-Language": locale } : {}), ...init?.headers },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

/* ---------------- session (demo stub) ---------------- */
export type Session = { demo: boolean; isNew: boolean; phone?: string; createdAt: string };

export function getSession(): Session | null {
  return read<Session>(KEYS.session);
}
export function startDemoSession() {
  // Сброс к чистым демо-данным Дильнозы
  remove(KEYS.business);
  remove(KEYS.tx);
  remove(KEYS.reconcile);
  write(KEYS.session, { demo: true, isNew: false, createdAt: new Date().toISOString() } satisfies Session);
}
export function startPhoneSession(phone: string) {
  remove(KEYS.business);
  write(KEYS.tx, []);
  remove(KEYS.reconcile);
  write(KEYS.session, { demo: false, isNew: true, phone: phone.slice(0, 4) + "•••", createdAt: new Date().toISOString() } satisfies Session);
}
export function finishOnboarding() {
  const s = getSession();
  if (s) write(KEYS.session, { ...s, isNew: false });
}
export function logout() {
  Object.values(KEYS).forEach(remove);
}
export function resetAllData() {
  remove(KEYS.business);
  write(KEYS.tx, []);
  remove(KEYS.reconcile);
}

/* ---------------- business ---------------- */
const DEMO_ID = businessMock.id;
const isDemoBusiness = (b: Business) => b.id === DEMO_ID;
const DEMO_NAMES = { ownerName: { uz: "Dilnoza", ru: "Дильноза" }, name: { uz: "Quruq mevalar", ru: "Сухофрукты" } };

/** Имя демо-бизнеса и названия платежей — на языке интерфейса. */
export function localizeBusiness(b: Business, locale: Locale): Business {
  const recurringPayments = b.recurringPayments.map((p) => ({ ...p, title: pickLang(p.title, locale) }));
  if (!isDemoBusiness(b)) return { ...b, recurringPayments };
  return { ...b, ownerName: DEMO_NAMES.ownerName[locale], name: DEMO_NAMES.name[locale], recurringPayments };
}

function currentBusiness(): Business {
  return read<Business>(KEYS.business) ?? (businessMock as Business);
}

export async function getBusiness(): Promise<Business> {
  if (!USE_MOCKS) return http<Business>("/api/business");
  await mockDelay();
  return currentBusiness();
}

export async function saveBusiness(b: Business): Promise<Business> {
  if (!USE_MOCKS) return http<Business>("/api/business", { method: "PUT", body: JSON.stringify(b) });
  await mockDelay(200);
  if (b.inputMethod === "demo") {
    // «Попробую на примере»: подставляем демо-остаток и платежи, если пользователь их не ввёл
    b = {
      ...b,
      cashNow: b.cashNow ?? businessMock.cashNow,
      recurringPayments: b.recurringPayments.length ? b.recurringPayments : (businessMock.recurringPayments as Business["recurringPayments"]),
    };
  }
  write(KEYS.business, b);
  if (b.inputMethod === "demo" && !isDemoBusiness(b)) {
    // «Попробую на примере»: подгружаем демо-операции, но имя/профиль пользователя оставляем
    remove(KEYS.tx);
  }
  return b;
}

export function hasDemoData(b: Business) {
  return isDemoBusiness(b) || b.inputMethod === "demo";
}

/* ---------------- transactions ---------------- */
function allTx(): Transaction[] {
  const stored = read<Transaction[]>(KEYS.tx);
  if (stored) return stored;
  return hasDemoData(currentBusiness()) ? (transactionsMock as Transaction[]) : [];
}
function saveTx(list: Transaction[]) {
  write(KEYS.tx, list);
}
const sortTx = (l: Transaction[]) => [...l].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id.localeCompare(a.id)));

export type TxFilter = { type?: "income" | "expense" | "debts" | "all"; month?: string };

export async function listTransactions(filter: TxFilter = {}): Promise<Transaction[]> {
  if (!USE_MOCKS) {
    const q = new URLSearchParams({ type: filter.type ?? "", month: filter.month ?? "" });
    return http<Transaction[]>(`/api/transactions?${q}`);
  }
  await mockDelay();
  if (mockFlag() === "empty") return [];
  let list = allTx();
  if (filter.month) list = list.filter((t) => t.date.startsWith(filter.month!));
  if (filter.type === "income") list = list.filter((t) => t.type === "income");
  if (filter.type === "expense") list = list.filter((t) => t.type === "expense");
  if (filter.type === "debts") list = list.filter((t) => t.type === "receivable" || t.type === "payable");
  return sortTx(list);
}

const newId = (p: string) => p + Math.random().toString(36).slice(2, 9);

export async function addTransaction(t: Omit<Transaction, "id">): Promise<Transaction> {
  if (!USE_MOCKS) return http<Transaction>("/api/transactions", { method: "POST", body: JSON.stringify(t) });
  await mockDelay(250);
  const tx: Transaction = { ...t, id: newId("u") };
  saveTx([tx, ...allTx()]);
  return tx;
}

export async function updateTransaction(t: Transaction): Promise<Transaction> {
  if (!USE_MOCKS) return http<Transaction>(`/api/transactions/${t.id}`, { method: "PUT", body: JSON.stringify(t) });
  await mockDelay(250);
  saveTx(allTx().map((x) => (x.id === t.id ? t : x)));
  return t;
}

export async function deleteTransaction(id: string): Promise<{ ok: true }> {
  if (!USE_MOCKS) return http<{ ok: true }>(`/api/transactions/${id}`, { method: "DELETE" });
  await mockDelay(250);
  saveTx(allTx().filter((x) => x.id !== id));
  return { ok: true };
}

/** Файлы, которые разбираем прямо в браузере. Всё остальное (PDF, Word, Excel, фото) — через API распознавания. */
export const LOCAL_PARSE = /\.(csv|txt)$/i;
export const MAX_UPLOAD_MB = 20;

/**
 * Распознать операции в документе (PDF, DOC/DOCX, XLS/XLSX, JPG/PNG/HEIC/WEBP…).
 * Бэкенд: POST /api/transactions/extract (multipart, поле "file") →
 * строки { date, amount, type, category, description, method }.
 */
export async function extractTransactions(file: File): Promise<Record<string, string>[]> {
  if (!USE_MOCKS) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(API_URL + "/api/transactions/extract", { method: "POST", body: fd });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as Record<string, string>[];
  }
  // Мок: «распознаём» документ и возвращаем строки из файла-примера
  await sleep(1400);
  if (mockFlag() === "error") throw new Error("extract");
  const text = await (await fetch("/sample-operations.csv")).text();
  const [head, ...lines] = text.trim().split(/\r?\n/);
  const cols = head.split(",");
  return lines.map((l) => Object.fromEntries(l.split(",").map((v, i) => [cols[i], v])));
}

export type ImportResult = { imported: number; skipped: { row: number; reason: string }[] };

export async function importTransactions(rows: Omit<Transaction, "id">[]): Promise<ImportResult> {
  if (!USE_MOCKS) return http<ImportResult>("/api/transactions/import", { method: "POST", body: JSON.stringify(rows) });
  await mockDelay(600);
  const ok: Transaction[] = [];
  const skipped: ImportResult["skipped"] = [];
  rows.forEach((r, i) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date)) skipped.push({ row: i + 2, reason: "date" });
    else if (!Number.isFinite(r.amount) || r.amount === 0) skipped.push({ row: i + 2, reason: "amount" });
    else ok.push({ ...r, id: newId("i") });
  });
  saveTx([...ok, ...allTx()]);
  return { imported: ok.length, skipped };
}

/* ---------------- dashboard ---------------- */
type L = L10n;
const pickL = (v: L | string, locale: Locale) => (typeof v === "string" ? v : v[locale]);

export type DashboardResult = Dashboard & { needsSetup: boolean; today: string };

function kpisFor(list: Transaction[], ym: string): Kpis {
  const inMonth = list.filter((t) => t.date.startsWith(ym));
  const revenue = inMonth.filter((t) => t.type === "income" && t.category === "sale").reduce((s, t) => s + t.amount, 0);
  const expenses = -inMonth.filter((t) => t.type === "expense" && t.category !== "owner_draw").reduce((s, t) => s + t.amount, 0);
  const profit = revenue - expenses;
  return { revenue, expenses, profitBeforeTax: profit, marginPct: revenue ? Math.round((profit / revenue) * 1000) / 10 : 0 };
}
const cashDelta = (list: Transaction[]) =>
  list.filter((t) => t.type === "income" || t.type === "expense").reduce((s, t) => s + t.amount, 0);

const prevMonth = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
};
const todayIso = () => new Date().toISOString().slice(0, 10);
const addDaysIso = (iso: string, n: number) => new Date(new Date(iso + "T00:00:00Z").getTime() + n * 86400000).toISOString().slice(0, 10);

export async function getDashboard(period: string | undefined, locale: Locale): Promise<DashboardResult> {
  if (!USE_MOCKS) return http<DashboardResult>(`/api/dashboard?period=${period ?? ""}`, undefined, locale);
  await mockDelay();
  const b = currentBusiness();
  const tx = allTx();

  if (hasDemoData(b)) {
    const base = dashboardMock;
    const ym = period ?? base.period;
    // Разница между текущими операциями и исходным моком → сдвигаем цифры панели
    const baseTx = transactionsMock as Transaction[];
    const delta = cashDelta(tx) - cashDelta(baseTx);
    const k0 = kpisFor(baseTx, ym);
    const k1 = kpisFor(tx, ym);
    const revenue = base.kpis.revenue + (k1.revenue - k0.revenue);
    const expenses = base.kpis.expenses + (k1.expenses - k0.expenses);
    const profit = revenue - expenses;
    const cashNow = (b.cashNow ?? base.safeToSpend.cashNow) + delta;
    const obligations = isDemoBusiness(b)
      ? base.safeToSpend.obligations.map((o) => ({ ...o, title: pickL(o.title, locale) }))
      : obligationsFrom(b, base.today, locale);
    const obligSum = obligations.reduce((s, o) => s + o.amount, 0);
    const unmatched = (await getReconcileRaw()).filter((r) => r.status === "unmatched").length;
    const alerts: Alert[] = base.alerts
      .map((a) => ({
        id: a.id,
        level: a.level as Alert["level"],
        text: pickL(a.text, locale),
        action: a.action ? { label: pickL(a.action.label, locale), href: a.action.href } : undefined,
      }))
      .map((a) => (a.id === "a3" ? { ...a, text: locale === "uz" ? `${unmatched} ta tushum savdo bilan solishtirilmagan` : `${unmatched} поступлений не сопоставлены с продажами` } : a))
      .filter((a) => a.id !== "a3" || unmatched > 0);
    return {
      period: ym,
      today: base.today,
      needsSetup: false,
      safeToSpend: { amount: cashNow - obligSum - base.safeToSpend.reserve, cashNow, obligations, reserve: base.safeToSpend.reserve },
      kpis: { revenue, expenses, profitBeforeTax: profit, marginPct: revenue ? Math.round((profit / revenue) * 1000) / 10 : 0, prev: base.kpis.prev },
      alerts,
      cashForecast: base.cashForecast.map((p) => (p.isForecast || p.date === base.today ? { ...p, balance: p.balance + delta } : p)),
      score: base.score,
    };
  }

  // Новый пользователь: считаем из его профиля и операций
  const today = todayIso();
  const ym = period ?? today.slice(0, 7);
  const kp = kpisFor(tx, ym);
  const prev = kpisFor(tx, prevMonth(ym));
  const needsSetup = b.cashNow === undefined;
  const cashNow = (b.cashNow ?? 0) + cashDelta(tx);
  const obligations = obligationsFrom(b, today, locale);
  const opex = tx.filter((t) => t.type === "expense" && !["purchase", "owner_draw"].includes(t.category)).reduce((s, t) => s - t.amount, 0);
  const recurringSum = b.recurringPayments.reduce((s, r) => s + r.amount, 0);
  const reserve = Math.round(Math.max(opex / 3, recurringSum) * 0.1);
  const amount = cashNow - obligations.reduce((s, o) => s + o.amount, 0) - reserve;
  const alerts: Alert[] = obligations
    .filter((o) => o.date <= addDaysIso(today, 7))
    .map((o, i) => ({ id: "n" + i, level: "warning" as const, text: `${o.title}: ${formatNum(o.amount)} — ${o.date}` }));
  const forecast: Dashboard["cashForecast"] = [];
  let bal = cashNow;
  for (let i = 0; i <= 90; i++) {
    const d = addDaysIso(today, i);
    const dom = Number(d.slice(8));
    b.recurringPayments.forEach((r) => {
      if (r.dayOfMonth === dom && i > 0) bal -= r.amount;
    });
    forecast.push({ date: d, balance: bal, isForecast: i > 0 });
  }
  const score = Math.min(100, 15 + (b.cashNow !== undefined ? 10 : 0) + (b.recurringPayments.length ? 10 : 0) + Math.min(20, tx.length));
  return {
    period: ym, today, needsSetup,
    safeToSpend: { amount, cashNow, obligations, reserve },
    kpis: { ...kp, prev },
    alerts, cashForecast: forecast, score,
  };
}

function obligationsFrom(b: Business, today: string, locale: Locale) {
  const out: { title: string; amount: number; date: string }[] = [];
  for (let i = 1; i <= 30; i++) {
    const d = addDaysIso(today, i);
    const dom = Number(d.slice(8));
    b.recurringPayments.forEach((r) => {
      if (r.dayOfMonth === dom) out.push({ title: pickLang(r.title, locale), amount: r.amount, date: d });
    });
  }
  return out;
}

/* ---------------- reconcile ---------------- */
async function getReconcileRaw(): Promise<ReconcileItem[]> {
  const b = currentBusiness();
  if (!hasDemoData(b)) return [];
  const statuses = read<Record<string, ReconcileStatus>>(KEYS.reconcile) ?? {};
  return (reconcileMock as ReconcileItem[]).map((r) => ({ ...r, status: statuses[r.id] ?? r.status }));
}

export async function getReconcile(): Promise<ReconcileItem[]> {
  if (!USE_MOCKS) return http<ReconcileItem[]>("/api/reconcile");
  await mockDelay();
  if (mockFlag() === "empty") return [];
  return getReconcileRaw();
}

export async function setReconcileStatus(id: string, status: ReconcileStatus): Promise<ReconcileItem> {
  if (!USE_MOCKS) return http<ReconcileItem>(`/api/reconcile/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
  await mockDelay(150);
  const statuses = read<Record<string, ReconcileStatus>>(KEYS.reconcile) ?? {};
  statuses[id] = status;
  write(KEYS.reconcile, statuses);
  const item = (await getReconcileRaw()).find((r) => r.id === id)!;
  return item;
}

/** Сводка безналичных денег за месяц для сверки (выписка vs учёт) */
export const RECONCILE_SUMMARY = { statement: 35_000_000, booked: 27_000_000 };

/* ---------------- AI: ожидаемый рост прибыли от кредита ---------------- */
export type GrowthInput = {
  sum: number;
  purpose: "expansion" | "equipment" | "stock";
  months: number;
  rate: number;
  scenario: "pess" | "base" | "opt";
  profit: number;
  revenue: number;
};
export type GrowthEstimate = { amount: number; rationale: string; confidence: "low" | "medium" | "high" };

/**
 * ИИ оценивает, на сколько вырастет прибыль в месяц от вложения кредита.
 * Бэкенд: POST /api/assistant/estimate-growth → GrowthEstimate (rationale — на языке Accept-Language).
 * Это допущение для прогноза, а не расчёт: деньги по-прежнему считает код.
 */
export async function estimateGrowth(input: GrowthInput, locale: Locale): Promise<GrowthEstimate> {
  if (!USE_MOCKS) return http<GrowthEstimate>("/api/assistant/estimate-growth", { method: "POST", body: JSON.stringify(input) }, locale);
  await sleep(900 + Math.random() * 500);
  if (mockFlag() === "error") throw new Error("estimate");
  // Мок: месячная отдача от вложенной суммы по назначению и сценарию
  const yieldByPurpose = { stock: 0.05, expansion: 0.04, equipment: 0.03 }[input.purpose];
  const scen = { pess: 0.5, base: 1, opt: 1.3 }[input.scenario];
  const amount = Math.round((input.sum * yieldByPurpose * scen) / 10_000) * 10_000;
  const pct = Math.round(yieldByPurpose * scen * 1000) / 10;
  const R = {
    ru: {
      stock: `Закупка товара оборачивается примерно за месяц. При вашей наценке около ${pct}% от суммы кредита возвращается прибылью каждый месяц.`,
      expansion: `Новая точка или ассортимент выходят на окупаемость за 2–3 месяца. Ожидаем около ${pct}% от суммы в месяц после запуска.`,
      equipment: `Оборудование экономит время и снижает потери, но отдача медленнее — около ${pct}% от суммы в месяц.`,
    },
    uz: {
      stock: `Tovar xaridi taxminan bir oyda aylanadi. Ustamangizda kredit summasining ${pct}% ga yaqini har oy foyda boʻlib qaytadi.`,
      expansion: `Yangi nuqta yoki assortiment 2–3 oyda oʻzini oqlaydi. Ishga tushgach, oyiga summaning ${pct}% atrofida kutamiz.`,
      equipment: `Uskuna vaqtni tejaydi va yoʻqotishni kamaytiradi, lekin samarasi sekinroq — oyiga summaning ${pct}% atrofida.`,
    },
  };
  return { amount, rationale: R[locale][input.purpose], confidence: input.scenario === "base" ? "medium" : "low" };
}

/* ---------------- passport steps (client flags) ---------------- */
export type StepFlag = "tax" | "credit" | "plan";
export function markStep(f: StepFlag) {
  write("consul_step_" + f, 1);
}
export function stepDone(f: StepFlag) {
  return read<number>("consul_step_" + f) === 1;
}

/* ---------------- prices (server-safe, used for SEO pages) ---------------- */
const PRICES = pricesMock as PricePoint[];
export const MARKETS = ["chorsu", "oloy", "parkent"] as const;

export async function searchPrices(q = "", market?: string): Promise<PricePoint[]> {
  if (!USE_MOCKS) return http<PricePoint[]>(`/api/prices?q=${encodeURIComponent(q)}&market=${market ?? ""}`);
  if (isBrowser()) await mockDelay(150);
  const n = q.toLowerCase().replace(/['‘’`ʼ]/g, "ʻ").trim();
  return PRICES.filter(
    (p) =>
      (!market || p.market === market) &&
      (!n || p.product.includes(n) || p.productName.uz.toLowerCase().includes(n) || p.productName.ru.toLowerCase().includes(n)),
  );
}

export async function getPrice(market: string, product: string): Promise<PricePoint | null> {
  if (!USE_MOCKS) return http<PricePoint>(`/api/prices/${market}/${product}`);
  return PRICES.find((p) => p.market === market && p.product === product) ?? null;
}

export function listPricePairs() {
  return PRICES.map((p) => ({ market: p.market, product: p.product }));
}

/* ---------------- guides ---------------- */
export async function listGuides(): Promise<Guide[]> {
  if (!USE_MOCKS) return http<Guide[]>("/api/guides");
  return guidesMock as Guide[];
}
export async function getGuide(slug: string): Promise<Guide | null> {
  if (!USE_MOCKS) return http<Guide>(`/api/guides/${slug}`);
  return (guidesMock as Guide[]).find((g) => g.slug === slug) ?? null;
}

/* ---------------- assistant ---------------- */
type AnswerBlocks = { uz: unknown[]; ru: unknown[] };
type Answer = {
  id: string;
  q: L10n;
  alt?: { uz: string[]; ru: string[] };
  keywords: string[];
  defaults?: Record<string, number | string>;
  blocks: AnswerBlocks;
};
const ASSISTANT = assistantMock as unknown as {
  suggestions: Record<string, string[]>;
  fallback: { uz: ChatBlock[]; ru: ChatBlock[] };
  answers: Answer[];
};

export function getSuggestions(page: PageKind, locale: Locale): { id: string; text: string }[] {
  const ids = ASSISTANT.suggestions[page] ?? ASSISTANT.suggestions.other;
  return ids
    .map((id) => ASSISTANT.answers.find((a) => a.id === id))
    .filter((a): a is Answer => !!a)
    .map((a) => ({ id: a.id, text: a.q[locale] }));
}

const norm = (s: string) => s.toLowerCase().replace(/['‘’`ʼ]/g, "ʻ").replace(/[?!.,«»"]/g, "").replace(/\s+/g, " ").trim();

function findAnswer(text: string, locale: Locale): Answer | null {
  const n = norm(text);
  const exact = ASSISTANT.answers.find(
    (a) => norm(a.q.uz) === n || norm(a.q.ru) === n || [...(a.alt?.uz ?? []), ...(a.alt?.ru ?? [])].some((x) => norm(x) === n),
  );
  if (exact) return exact;
  void locale;
  return ASSISTANT.answers.find((a) => a.keywords.some((k) => n.includes(norm(k)))) ?? null;
}

function fillBlocks(blocks: unknown[], data: Record<string, unknown>, defaults: Record<string, number | string> = {}): ChatBlock[] {
  const val = (k: string) => (typeof data[k] === "number" || typeof data[k] === "string" ? data[k] : defaults[k]) as number | string | undefined;
  const fmt = (v: number | string | undefined) => (typeof v === "number" ? formatNum(v) : v ?? "—");
  return (blocks as Record<string, unknown>[]).map((b) => {
    if (b.type === "text") return { type: "text", markdown: String(b.markdown).replace(/\{\{(\w+)\}\}/g, (_, k) => String(fmt(val(k)))) };
    if (b.type === "numbers") {
      type Row = { label: string; value: number; key?: string };
      const fix = (r: Row) => {
        const v = r.key ? val(r.key) : undefined;
        return { label: r.label, value: typeof v === "number" ? v : r.value };
      };
      return { type: "numbers", rows: (b.rows as Row[]).map(fix), total: b.total ? fix(b.total as Row) : undefined };
    }
    return b as ChatBlock;
  });
}

export async function sendAssistantMessage(
  threadId: string,
  text: string,
  context: PageContext,
  locale: Locale,
): Promise<ChatMessage> {
  if (!USE_MOCKS) {
    return http<ChatMessage>("/api/assistant/message", { method: "POST", body: JSON.stringify({ threadId, text, context }) }, locale);
  }
  await sleep(600 + Math.random() * 600);
  if (mockFlag() === "error") throw new Error("network");
  const a = findAnswer(text, locale);
  const blocks: ChatBlock[] = a
    ? fillBlocks(a.blocks[locale], context.data ?? {}, a.defaults)
    : [
        ...ASSISTANT.fallback[locale],
        { type: "actions", items: getSuggestions(context.page, locale).map((s) => ({ label: s.text, action: undefined, href: undefined })) },
      ];
  return { id: newId("m"), role: "assistant", createdAt: new Date().toISOString(), blocks };
}

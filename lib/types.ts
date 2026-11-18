export type Locale = "uz" | "ru";
export type Activity = "trade" | "catering" | "services" | "production" | "other";
export type LegalForm = "ip" | "legal" | "unregistered";
export type L10n = { uz: string; ru: string };

export type Business = {
  id: string;
  ownerName: string;
  name: string;
  activity: Activity;
  legalForm: LegalForm;
  market?: string;
  taxRegime: "turnover" | "vat6" | "vat12" | "unknown";
  recurringPayments: RecurringPayment[];
  /** Остаток денег (наличные + карта). Нужен для «можно потратить». Не задан — просим указать. */
  cashNow?: number;
  revenueRange?: "lt10" | "10to50" | "50to200" | "gt200";
  inputMethod?: "import" | "manual" | "photo" | "demo";
};

export type RecurringPayment = {
  id: string;
  title: string;
  amount: number;
  dayOfMonth: number;
  kind: "rent" | "salary" | "tax" | "loan" | "other";
};

export type TxType = "income" | "expense" | "receivable" | "payable";
export type TxCategory = "sale" | "purchase" | "rent" | "salary" | "tax" | "loan" | "owner_draw" | "other";
export type TxMethod = "cash" | "card" | "transfer";

export type Transaction = {
  id: string;
  date: string;
  amount: number; // >0 income, <0 expense
  type: TxType;
  category: TxCategory;
  method: TxMethod;
  description?: string;
  matched?: boolean;
  item?: { product: string; qty: number; unit: "kg" | "dona" | "litr" };
};

export type Kpis = { revenue: number; expenses: number; profitBeforeTax: number; marginPct: number };

export type Dashboard = {
  period: string;
  safeToSpend: {
    amount: number;
    cashNow: number;
    obligations: { title: string; amount: number; date: string }[];
    reserve: number;
  };
  kpis: Kpis & { prev: Kpis };
  alerts: Alert[];
  cashForecast: { date: string; balance: number; isForecast: boolean }[];
  score: number;
};

export type Alert = {
  id: string;
  level: "info" | "warning" | "error";
  text: string;
  action?: { label: string; href: string };
};

export type ReconcileStatus = "unmatched" | "sale" | "loan" | "debt_return" | "own_transfer" | "other";
export type ReconcileItem = {
  id: string;
  date: string;
  amount: number;
  counterpartyMasked: string;
  status: ReconcileStatus;
};

export type PricePoint = {
  product: string;
  productName: L10n;
  market: string;
  unit: "kg" | "dona" | "litr";
  min: number;
  median: number;
  max: number;
  updatedAt: string;
  history: { date: string; median: number }[];
};

export type Guide = {
  slug: string;
  title: L10n;
  description: L10n;
  body: L10n;
  readMinutes: number;
  tool?: "credit" | "tax-regime" | "markup";
  updatedAt: string;
  tag: L10n;
  /** Своя обложка: путь в /public, например "/guides/tax.jpg". Нет — рисуем фирменную иллюстрацию. */
  cover?: string;
};

export type ChatBlock =
  | { type: "text"; markdown: string }
  | { type: "numbers"; rows: { label: string; value: number }[]; total?: { label: string; value: number } }
  | { type: "source"; label: string }
  | { type: "actions"; items: { label: string; href?: string; action?: "open_add_operation" }[] }
  | { type: "warning"; level: "warning" | "error"; text: string }
  | { type: "login" };

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  createdAt: string;
  blocks: ChatBlock[];
  feedback?: "up" | "down";
};

export type ChatThread = { id: string; title: string; updatedAt: string; messages: ChatMessage[] };

export type PageKind =
  | "home" | "tool_credit" | "tool_tax" | "tool_markup" | "guide" | "prices"
  | "dashboard" | "app_credit" | "reconcile" | "operations" | "other";

export type PageContext = {
  page: PageKind;
  title: string;
  summary?: string; // short line for the context strip
  data?: Record<string, unknown>;
};

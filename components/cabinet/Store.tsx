"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { DEMO } from "@/lib/demo";
import { apply, view, type Ledger, type View } from "@/lib/ledger";
import { intent, norm } from "@/lib/parse";
import { answer, type Reply, type Topic } from "@/lib/answer";
import { DEFAULT_PLAN, type Plan } from "@/lib/plan";
import { fmt } from "@/lib/format";
import { useT, useTP } from "@/components/I18n";
import { recordOperation, type OperationInput } from "@/lib/operations";
import { readLedger, LEDGER_STORAGE_KEY } from "@/lib/storage";

export interface Toast { id: number; main: string; sub?: string; warn?: boolean; undo?: () => void }
export interface Msg { id: number; role: "user" | "bot"; text?: string; reply?: Reply; thinking?: boolean; voice?: boolean }
export interface ChatItem { id: string; title: string; date: string; group: string; topic: string }

interface Store {
  ledger: Ledger; view: View; route: string; setRoute: (r: string) => void;
  toast: Toast | null; showToast: (t: Omit<Toast, "id">) => void; hideToast: () => void;
  sheet: ReactNode | null; openSheet: (n: ReactNode) => void; closeSheet: () => void;
  handle: (text: string, opts?: { voice?: boolean }) => void;
  applyFixed: (kind: Parameters<typeof apply>[1], text: string, amount: number) => void;
  addOperation: (input: OperationInput) => void;
  setCheck: (id: string, checked: boolean) => void;
  repaid: (name: string) => void;
  forceAct: (text: string) => void;
  setReserve: (v: number) => void;
  setMemory: (m: [string, string][]) => void;
  chatId: string; chatTitle: string; loadChat: (h: ChatItem, q: string, r: Reply, t: Topic) => void;
  msgs: Msg[]; chat: (text: string, opts?: { voice?: boolean }) => void; newChat: () => void;
  history: ChatItem[]; setTopic: (t: Topic) => void;
  plan: Plan; setPlan: (p: Plan) => void;
  calcTab: string; setCalcTab: (t: string) => void;
  bigText: boolean; setBigText: (b: boolean) => void;
  stats: boolean; setStats: (b: boolean) => void;
  ui: UiHooks; setUi: (u: UiHooks) => void;
}
/** Sheets that live in components and are registered by the shell (avoids import cycles). */
export interface UiHooks { answerSheet?: (q: string, r: Reply) => ReactNode; chooseKind?: (t: string, a: number) => ReactNode; bigConfirm?: (t: string, a: number) => ReactNode; bankReport?: () => ReactNode }

const Ctx = createContext<Store | null>(null);
export const useStore = () => { const s = useContext(Ctx); if (!s) throw new Error("useStore outside provider"); return s; };

const HISTORY: ChatItem[] = [
  { id: "c1", title: "Kredit 34 mln", date: "kecha", group: "Shu hafta", topic: "loan" },
  { id: "c2", title: "Soliq rejimi", date: "12-noyabr", group: "Oldinroq", topic: "tax" },
  { id: "c3", title: "Qoqi narxi", date: "9-noyabr", group: "Oldinroq", topic: "price" },
];

export function StoreProvider({ children }: { children: ReactNode }) {
  const t = useT(), tp = useTP();
  const [ledger, setLedgerState] = useState<Ledger>(DEMO);
  const [storageReady, setStorageReady] = useState(false);
  const [route, setRoute] = useState("bugun");
  const [toast, setToast] = useState<Toast | null>(null);
  const [sheet, setSheet] = useState<ReactNode | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [history, setHistory] = useState<ChatItem[]>(HISTORY);
  const [chatId, setChatId] = useState("");
  const [chatTitle, setChatTitle] = useState("");
  const [plan, setPlan] = useState<Plan>(DEFAULT_PLAN);
  const [calcTab, setCalcTab] = useState("kredit");
  const [bigText, setBigText] = useState(false);
  const [stats, setStats] = useState(true);
  const [ui, setUi] = useState<UiHooks>({});
  const topic = useRef<Topic>(null);
  const ledgerRef = useRef(ledger);
  const setLedger = useCallback((next: Ledger | ((current: Ledger) => Ledger)) => {
    const value = typeof next === "function" ? next(ledgerRef.current) : next;
    ledgerRef.current = value;
    setLedgerState(value);
  }, []);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const v = useMemo(() => view(ledger), [ledger]);

  const showToast = useCallback((t: Omit<Toast, "id">) => {
    setToast({ ...t, id: Date.now() });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 7000);
  }, []);
  const hideToast = useCallback(() => setToast(null), []);
  const openSheet = useCallback((n: ReactNode) => setSheet(n), []);
  const closeSheet = useCallback(() => setSheet(null), []);

  useEffect(() => {
    // Restore after hydration so server and first client render use identical demo data.
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      const saved = readLedger();
      if (saved) setLedger(saved);
      setStorageReady(true);
    });
    return () => { active = false; };
  }, [setLedger]);
  const storageFailed = useRef(false);
  useEffect(() => {
    if (!storageReady) return;
    try { localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(ledger)); }
    catch {
      if (!storageFailed.current) showToast({ main: t("Brauzerda saqlab boʻlmadi"), sub: t("Yozuvlar faqat joriy seansda qoladi."), warn: true });
      storageFailed.current = true;
    }
  }, [ledger, storageReady, showToast, t]);

  const addOperation = useCallback((input: OperationInput) => {
    const before = ledgerRef.current, result = recordOperation(before, input);
    setLedger(result.ledger);
    showToast({ main: t("Operatsiya saqlandi"), sub: `${tp(result.title)} ${result.value}`, undo: () => setLedger(before) });
  }, [setLedger, showToast, t, tp]);

  /** Applies an operation, shows the change in free money, keeps an undo snapshot. Returns a chat-friendly line. */
  const act = useCallback((text: string, quiet = false, force = false): string | null => {
    const l = ledgerRef.current, nt = norm(text), it = intent(text, l.debtors);
    const undo = () => setLedger(l);
    if (it.type === "fix") {
      const was = l.money[it.field];
      const next = { ...l, money: { ...l.money, [it.field]: it.amount } };
      setLedger(next);
      const msg = t(it.field === "naqd" ? "Naqd tuzatildi: {a} → {b}" : "Karta tuzatildi: {a} → {b}", { a: fmt(was), b: fmt(it.amount) });
      if (!quiet) showToast({ main: msg, sub: t("Sarflash mumkin: {x}", { x: fmt(view(next).free) }), undo });
      return msg + ".";
    }
    if (it.type === "rent") {
      const val = t("{a} · har oy {d}-sanada", { a: fmt(it.amount || l.money.rent), d: it.day });
      const mem = l.memory.some(x => x[0] === "Ijara") ? l.memory.map(x => (x[0] === "Ijara" ? ["Ijara", val] as [string, string] : x)) : [...l.memory, ["Ijara", val] as [string, string]];
      setLedger({ ...l, memory: mem, money: it.amount ? { ...l.money, rent: it.amount } : l.money });
      if (!quiet) showToast({ main: t("Eslab qoldim: ijara {v}", { v: val }), sub: t("Consul xotirasida koʻrinadi") });
      return t("Eslab qoldim: ijara {v}", { v: val }) + ".";
    }
    if (it.type !== "op") return null;
    if (it.amount >= 1e9 && !force) {
      if (quiet) return t("{a} soʻm — juda katta summa. Toʻgʻri boʻlsa, pastdagi qatorda qayta yozing.", { a: fmt(it.amount) });
      if (ui.bigConfirm) setSheet(ui.bigConfirm(text, it.amount));
      return null;
    }
    const r = apply(l, it.kind, it.amount, it.method, it.label, it.who);
    setLedger(r.ledger);
    if (!quiet) showToast({ main: `${tp(r.title)} ${r.value}`, sub: t("Sarflash mumkin: {a} → {b}", { a: fmt(r.before), b: fmt(r.after) }) + (r.after < 0 ? " · " + t("erkin pul yetmayapti") : ""), undo, warn: r.after < 0 });
    void nt;
    return t("Yozdim: {op}. Sarflash mumkin: {a} → {b}.", { op: `${tp(r.title)} ${r.value}`, a: fmt(r.before), b: fmt(r.after) });
  }, [setLedger, showToast, ui, t, tp]);

  const ask = useCallback((text: string) => {
    const l = ledgerRef.current;
    const res = answer(text, { ledger: l, view: view(l), route, last: topic.current, t });
    topic.current = res.topic;
    return res.reply;
  }, [route, t]);

  const chat = useCallback((text: string, opts?: { voice?: boolean }) => {
    const idU = Date.now(), idB = idU + 1;
    setMsgs(m => [...m, { id: idU, role: "user", text }, { id: idB, role: "bot", thinking: true }]);
    setHistory(h => (h.some(x => x.id === "live") ? h : [{ id: "live", title: text.slice(0, 26), date: "hozir", group: "Bugun", topic: "" }, ...h]));
    setChatId(c => c || "live");
    setTimeout(() => {
      const l = ledgerRef.current, it = intent(text, l.debtors);
      let reply: Reply;
      if (it.type === "op" || it.type === "fix" || it.type === "rent") reply = { text: act(text, true) || t("Yozib qoʻydim.") };
      else reply = ask(text);
      setMsgs(m => m.map(x => (x.id === idB ? { ...x, thinking: false, reply, voice: opts?.voice } : x)));
    }, 700);
  }, [act, ask, t]);

  const handle = useCallback((text: string, opts?: { voice?: boolean }) => {
    const q = text.trim(); if (!q) return;
    if (typeof document !== "undefined") (document.activeElement as HTMLElement | null)?.blur?.();
    if (route === "consul") return chat(q, opts);
    const l = ledgerRef.current, it = intent(q, l.debtors);
    if (it.type === "report") { if (ui.bankReport) setSheet(ui.bankReport()); return; }
    if (it.type === "question") { if (ui.answerSheet) setSheet(ui.answerSheet(q, ask(q))); return; }
    if (it.type === "op" || it.type === "fix" || it.type === "rent") { act(q); return; }
    if (it.type === "need-kind") { if (ui.chooseKind) setSheet(ui.chooseKind(q, it.amount)); return; }
    if (it.type === "need-amount") return showToast({ main: t("Summani ham ayting"), sub: t("Masalan: «1,2 mln sotdim», «svet 420 ming»"), warn: true });
    const r = ask(q);
    if (!r.fallback && ui.answerSheet) return setSheet(ui.answerSheet(q, r));
    showToast({ main: t("Tushunmadim"), sub: t("Masalan: «1,2 mln sotdim», «Karimga 500 ming nasiya», «kredit olsam boʻladimi?»"), warn: true });
  }, [route, chat, act, ask, showToast, ui, t]);

  const applyFixed = useCallback((kind: Parameters<typeof apply>[1], text: string, amount: number) => {
    const l = ledgerRef.current, r = apply(l, kind, amount, /karta/.test(norm(text)) ? "karta" : "naqd", kind === "buy" ? "qoqi, mayiz" : undefined);
    setLedger(r.ledger);
    showToast({ main: `${tp(r.title)} ${r.value}`, sub: t("Sarflash mumkin: {a} → {b}", { a: fmt(r.before), b: fmt(r.after) }), undo: () => setLedger(l), warn: r.after < 0 });
  }, [setLedger, showToast, t, tp]);

  const repaid = useCallback((name: string) => {
    const l = ledgerRef.current, r = apply(l, "repaid", 0, "naqd", undefined, name);
    setLedger(r.ledger);
    showToast({ main: t("{n} toʻladi {v}", { n: name, v: r.value }), sub: t("Sarflash mumkin: {x}", { x: fmt(r.after) }), undo: () => setLedger(l) });
  }, [setLedger, showToast, t]);

  const value: Store = {
    ledger, view: v, route, setRoute, toast, showToast, hideToast, sheet, openSheet, closeSheet, handle, applyFixed, addOperation, repaid, forceAct: (t) => { act(t, false, true); },
    setCheck: (id, checked) => setLedger(l => ({ ...l, checks: { ...l.checks, [id]: checked } })),
    setReserve: (r) => setLedger(l => ({ ...l, money: { ...l.money, reserve: Math.max(0, r) } })),
    setMemory: (m) => setLedger(l => ({ ...l, memory: m })),
    chatId, chatTitle, loadChat: (h, q, r, t) => { setChatId(h.id); setChatTitle(`${h.title} · ${h.date}`); setMsgs([{ id: 1, role: "user", text: q }, { id: 2, role: "bot", reply: r }]); topic.current = t; },
    msgs, chat, newChat: () => { setMsgs([]); setChatId(""); setChatTitle(""); topic.current = null; }, history, setTopic: (t) => { topic.current = t; },
    plan, setPlan, calcTab, setCalcTab, bigText, setBigText, stats, setStats, ui, setUi,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

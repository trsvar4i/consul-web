"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import type { ChatMessage, ChatThread, Locale, PageContext } from "./types";
import { getSession, sendAssistantMessage } from "./api";

const THREADS_KEY = "consul_threads";
const ANON_KEY = "consul_anon_questions";
export const ANON_LIMIT = 5;

type OpenOpts = { question?: string; context?: Partial<PageContext> };

type AssistantState = {
  isOpen: boolean;
  threadId: string | null;
  threads: ChatThread[];
  messages: ChatMessage[];
  pageContext: PageContext;
  pending: boolean; // waiting for reply (typing dots)
  streaming: { id: string; words: number } | null;
  unread: boolean;
  open: (opts?: OpenOpts) => void;
  close: () => void;
  send: (text: string) => Promise<void>;
  stop: () => void;
  newThread: () => void;
  selectThread: (id: string) => void;
  deleteThread: (id: string) => void;
  setFeedback: (msgId: string, f: "up" | "down") => void;
  setPageContext: (ctx: PageContext) => void;
  updatePageData: (data: Record<string, unknown>, summary?: string) => void;
  /** Ask to open the "add operation" sheet (handled by app pages) */
  requestAddOperation: () => void;
  addOperationRequested: number;
};

const Ctx = createContext<AssistantState | null>(null);

const nowIso = () => new Date().toISOString();
const rid = (p: string) => p + Math.random().toString(36).slice(2, 10);

function loadThreads(): ChatThread[] {
  try {
    const raw = localStorage.getItem(THREADS_KEY);
    return raw ? (JSON.parse(raw) as ChatThread[]) : [];
  } catch {
    return [];
  }
}

export function AssistantProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale() as Locale;
  const [isOpen, setIsOpen] = useState(false);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [pageContext, setPageContextState] = useState<PageContext>({ page: "other", title: "" });
  const [pending, setPending] = useState(false);
  const [streaming, setStreaming] = useState<{ id: string; words: number } | null>(null);
  const [unread, setUnread] = useState(false);
  const [addOperationRequested, setAddOp] = useState(0);
  const loaded = useRef(false);
  const cancelRef = useRef<{ cancelled: boolean } | null>(null);
  const isOpenRef = useRef(false);
  const ctxRef = useRef(pageContext);
  useEffect(() => {
    isOpenRef.current = isOpen;
    ctxRef.current = pageContext;
  }, [isOpen, pageContext]);

  // load history once
  useEffect(() => {
    const t = loadThreads();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage after mount
    setThreads(t);
    if (t.length) setThreadId(t[0].id);
    loaded.current = true;
  }, []);

  // persist history (shared between popup and /chat)
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(THREADS_KEY, JSON.stringify(threads.slice(0, 30)));
    } catch {}
  }, [threads]);

  const thread = threads.find((t) => t.id === threadId) ?? null;
  const messages = useMemo(() => thread?.messages ?? [], [thread]);

  const patchThread = useCallback((id: string, fn: (t: ChatThread) => ChatThread) => {
    setThreads((all) => all.map((t) => (t.id === id ? fn(t) : t)));
  }, []);

  // word-by-word streaming of the latest assistant answer
  useEffect(() => {
    if (!streaming || !threadId) return;
    const msg = threads.find((t) => t.id === threadId)?.messages.find((m) => m.id === streaming.id);
    const total = msg ? countWords(msg) : 0;
    if (streaming.words >= total) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- finish streaming
      setStreaming(null);
      return;
    }
    const tm = setTimeout(() => setStreaming((s) => (s ? { ...s, words: s.words + 2 } : s)), 35);
    return () => clearTimeout(tm);
  }, [streaming, threadId, threads]);

  const send = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean) return;
      let id = threadId;
      const userMsg: ChatMessage = { id: rid("m"), role: "user", createdAt: nowIso(), blocks: [{ type: "text", markdown: clean }] };
      if (!id || !threads.some((t) => t.id === id)) {
        id = rid("th");
        const t: ChatThread = { id, title: clean.slice(0, 60), updatedAt: nowIso(), messages: [userMsg] };
        setThreads((all) => [t, ...all]);
        setThreadId(id);
      } else {
        patchThread(id, (t) => ({ ...t, updatedAt: nowIso(), messages: [...t.messages, userMsg] }));
      }

      // anonymous users: limited questions, then ask to log in
      const session = getSession();
      if (!session) {
        let n = 0;
        try {
          n = Number(localStorage.getItem(ANON_KEY) ?? 0) + 1;
          localStorage.setItem(ANON_KEY, String(n));
        } catch {}
        if (n > ANON_LIMIT) {
          const loginMsg: ChatMessage = { id: rid("m"), role: "assistant", createdAt: nowIso(), blocks: [{ type: "login" }] };
          const tid = id;
          patchThread(tid, (t) => ({ ...t, messages: [...t.messages, loginMsg] }));
          return;
        }
      }

      const token = { cancelled: false };
      cancelRef.current = token;
      setPending(true);
      try {
        const reply = await sendAssistantMessage(id, clean, ctxRef.current, locale);
        if (token.cancelled) return;
        const tid = id;
        patchThread(tid, (t) => ({ ...t, updatedAt: nowIso(), messages: [...t.messages, reply] }));
        setStreaming({ id: reply.id, words: 0 });
        if (!isOpenRef.current) setUnread(true);
      } catch {
        if (token.cancelled) return;
        const errMsg: ChatMessage = {
          id: rid("m"), role: "assistant", createdAt: nowIso(),
          blocks: [{ type: "warning", level: "error", text: locale === "uz" ? "Javob olib boʻlmadi. Internetni tekshirib, qayta urinib koʻring." : "Не удалось получить ответ. Проверьте интернет и попробуйте ещё раз." }],
        };
        const tid = id;
        patchThread(tid, (t) => ({ ...t, messages: [...t.messages, errMsg] }));
      } finally {
        if (!token.cancelled) setPending(false);
      }
    },
    [threadId, threads, patchThread, locale],
  );

  const stop = useCallback(() => {
    if (pending && cancelRef.current) {
      cancelRef.current.cancelled = true;
      setPending(false);
      return;
    }
    if (streaming && threadId) {
      const cut = streaming.words;
      patchThread(threadId, (t) => ({
        ...t,
        messages: t.messages.map((m) => (m.id === streaming.id ? truncateMessage(m, cut) : m)),
      }));
      setStreaming(null);
    }
  }, [pending, streaming, threadId, patchThread]);

  const open = useCallback(
    (opts?: OpenOpts) => {
      setIsOpen(true);
      setUnread(false);
      if (opts?.context) setPageContextState((c) => ({ ...c, ...opts.context, data: { ...c.data, ...opts.context?.data } }));
      if (opts?.question) {
        // new short thread for a "Why?" question keeps answers focused
        setTimeout(() => void send(opts.question!), 0);
      }
    },
    [send],
  );

  const value: AssistantState = {
    isOpen,
    threadId,
    threads,
    messages,
    pageContext,
    pending,
    streaming,
    unread,
    open,
    close: () => setIsOpen(false),
    send,
    stop,
    newThread: () => {
      setThreadId(null);
      setStreaming(null);
    },
    selectThread: (id) => {
      setThreadId(id);
      setStreaming(null);
    },
    deleteThread: (id) => {
      setThreads((all) => all.filter((t) => t.id !== id));
      if (threadId === id) setThreadId(null);
    },
    setFeedback: (msgId, f) => {
      if (!threadId) return;
      patchThread(threadId, (t) => ({ ...t, messages: t.messages.map((m) => (m.id === msgId ? { ...m, feedback: f } : m)) }));
    },
    setPageContext: useCallback((ctx: PageContext) => setPageContextState(ctx), []),
    updatePageData: useCallback(
      (data: Record<string, unknown>, summary?: string) =>
        setPageContextState((c) => ({ ...c, data: { ...c.data, ...data }, summary: summary ?? c.summary })),
      [],
    ),
    requestAddOperation: () => {
      setAddOp((n) => n + 1);
      setIsOpen(false);
    },
    addOperationRequested,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAssistant() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAssistant must be used inside AssistantProvider");
  return v;
}

/** Each page calls this once to tell the assistant where the user is. */
export function usePageContext(ctx: PageContext) {
  const { setPageContext } = useAssistant();
  const key = JSON.stringify(ctx);
  useEffect(() => {
    setPageContext(JSON.parse(key) as PageContext);
  }, [key, setPageContext]);
}

/* ---- helpers for streaming ---- */
export function countWords(m: ChatMessage) {
  return m.blocks.reduce((s, b) => s + (b.type === "text" ? b.markdown.split(/\s+/).length : 0), 0);
}
function truncateMessage(m: ChatMessage, words: number): ChatMessage {
  let left = words;
  const blocks: ChatMessage["blocks"] = [];
  for (const b of m.blocks) {
    if (b.type !== "text") continue;
    const parts = b.markdown.split(/(\s+)/);
    let out = "";
    let count = 0;
    for (const p of parts) {
      if (/\S/.test(p)) {
        if (count >= left) break;
        count++;
      }
      out += p;
    }
    left -= count;
    if (out.trim()) blocks.push({ type: "text", markdown: out.trimEnd() + " …" });
    if (left <= 0) break;
  }
  return { ...m, blocks };
}

"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, Menu, SquarePen, Trash2, X } from "lucide-react";
import { useAssistant } from "@/lib/assistant-context";
import { getSession } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { Link, useRouter } from "@/i18n/navigation";
import { Logo } from "../brand/Logo";
import { LanguageSwitcher } from "../layout/LanguageSwitcher";
import { ChatThread } from "./ChatThread";
import { Composer, Suggestions } from "./Composer";
import { cn } from "../ui/primitives";

/** Полный чат /chat: список разговоров слева, тот же поток справа. История общая с панелью. */
export function ChatPage() {
  const t = useTranslations("assistant");
  const tApp = useTranslations("app");
  const locale = useLocale();
  const a = useAssistant();
  const sp = useSearchParams();
  const router = useRouter();
  const [drawer, setDrawer] = useState(false);
  const [back, setBack] = useState("/");
  const scroller = useRef<HTMLDivElement>(null);
  const composer = useRef<{ focus: () => void }>(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- session lives in localStorage
  useEffect(() => setBack(getSession() ? "/app" : "/"), []);

  const requested = sp.get("thread");
  useEffect(() => {
    if (requested && a.threads.some((x) => x.id === requested) && a.threadId !== requested) a.selectThread(requested);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requested, a.threads.length]);

  useEffect(() => {
    if (a.isOpen) a.close();
    composer.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [a.messages, a.pending, a.streaming]);

  const list = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 p-3">
        <p className="px-2 text-sm font-semibold text-gray-700">{t("threads")}</p>
        <button onClick={() => { a.newThread(); setDrawer(false); router.replace("/chat"); composer.current?.focus(); }}
          className="inline-flex h-10 items-center gap-1.5 rounded-btn bg-graphite-900 px-3 text-sm font-medium text-white hover:bg-graphite-800">
          <SquarePen size={16} aria-hidden /> {t("newChat")}
        </button>
      </div>
      <ul className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-4">
        {a.threads.length === 0 && <li className="px-3 py-2 text-sm text-gray-700">{t("noThreads")}</li>}
        {a.threads.map((th) => (
          <li key={th.id} className="group flex items-center">
            <button
              onClick={() => { a.selectThread(th.id); setDrawer(false); router.replace(`/chat?thread=${th.id}`); }}
              aria-current={th.id === a.threadId ? "true" : undefined}
              className={cn("min-h-12 flex-1 truncate rounded-btn px-3 py-2 text-left text-sm", th.id === a.threadId ? "bg-white font-medium shadow-soft" : "hover:bg-white/70")}
            >
              <span className="block truncate">{th.title}</span>
              <span className="block text-xs font-normal text-gray-700">{formatDate(th.updatedAt, locale)}</span>
            </button>
            <button aria-label={t("deleteThread")} onClick={() => a.deleteThread(th.id)}
              className="ml-1 grid size-9 shrink-0 place-items-center rounded-btn text-gray-500 opacity-0 hover:bg-white hover:text-error focus:opacity-100 group-hover:opacity-100">
              <Trash2 size={15} aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="flex h-dvh flex-col bg-white">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-gray-200 px-3 sm:px-4">
        <button className="grid size-10 place-items-center rounded-btn hover:bg-mist lg:hidden" aria-label={t("threads")} onClick={() => setDrawer(true)}>
          <Menu size={20} aria-hidden />
        </button>
        <Link href={back} className="hidden items-center gap-1 rounded-btn px-2 py-2 text-sm text-gray-700 hover:bg-mist lg:inline-flex">
          <ArrowLeft size={16} aria-hidden /> {back === "/app" ? tApp("dashboard") : "Consul"}
        </Link>
        <Logo size={28} markOnly className="lg:hidden" />
        <h1 className="flex-1 truncate text-[15px] font-semibold">{t("chatH1")}</h1>
        <LanguageSwitcher />
      </header>
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-72 shrink-0 border-r border-gray-200 bg-mist lg:block">{list}</aside>
        {drawer && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-graphite-900/40" onClick={() => setDrawer(false)} aria-hidden />
            <div className="absolute inset-y-0 left-0 w-[85%] max-w-xs bg-mist shadow-soft animate-rise">
              <button className="absolute right-2 top-2 grid size-10 place-items-center" aria-label={t("close")} onClick={() => setDrawer(false)}><X size={20} aria-hidden /></button>
              <div className="pt-12 h-full">{list}</div>
            </div>
          </div>
        )}
        <main className="flex min-w-0 flex-1 flex-col bg-mist/40">
          {a.pageContext.title && (
            <p className="truncate border-b border-gray-200 bg-white px-4 py-1.5 text-center text-xs text-gray-700">
              {t("contextPrefix")} {[a.pageContext.title, a.pageContext.summary].filter(Boolean).join(" · ")}
            </p>
          )}
          <div ref={scroller} className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-3xl px-4 py-6">
              {a.messages.length === 0 && !a.pending ? (
                <div className="py-10 text-center">
                  <Logo size={48} markOnly className="justify-center" />
                  <p className="mt-4 text-xl font-semibold">{t("hello")}</p>
                  <p className="mx-auto mt-2 max-w-md text-gray-700">{t("helloText")}</p>
                  <Suggestions className="mt-6 items-center" />
                </div>
              ) : (
                <ChatThread wide />
              )}
            </div>
          </div>
          <div className="mx-auto w-full max-w-3xl px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
            <Composer ref={composer} />
          </div>
        </main>
      </div>
    </div>
  );
}

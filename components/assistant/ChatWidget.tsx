"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { MessageCircle, Maximize2, SquarePen, X } from "lucide-react";
import { useAssistant } from "@/lib/assistant-context";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Logo } from "../brand/Logo";
import { ChatThread } from "./ChatThread";
import { Composer, Suggestions } from "./Composer";
import { cn } from "../ui/primitives";

/** Плавающая кнопка + всплывающая панель. На /chat не показывается. */
export function ChatWidget() {
  const pathname = usePathname();
  if (pathname === "/chat") return null;
  return <Widget inApp={pathname.startsWith("/app") || pathname === "/onboarding"} isTool={pathname.startsWith("/tools/")} />;
}

function Widget({ inApp, isTool }: { inApp: boolean; isTool: boolean }) {
  const t = useTranslations("assistant");
  const a = useAssistant();
  const router = useRouter();
  const fabRef = useRef<HTMLButtonElement>(null);
  const composer = useRef<{ focus: () => void }>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [hint, setHint] = useState(false);

  // one-time hint bubble on calculator pages after 20 s
  useEffect(() => {
    if (!isTool || a.isOpen) return;
    let shown = false;
    try { shown = sessionStorage.getItem("consul_hint") === "1"; } catch {}
    if (shown) return;
    const tm = setTimeout(() => {
      setHint(true);
      try { sessionStorage.setItem("consul_hint", "1"); } catch {}
    }, 20000);
    return () => clearTimeout(tm);
  }, [isTool, a.isOpen]);

  // focus input on open; return focus to FAB on close
  const wasOpen = useRef(false);
  useEffect(() => {
    if (a.isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hide hint when panel opens
      setHint(false);
      setTimeout(() => composer.current?.focus(), 50);
    } else if (wasOpen.current) {
      fabRef.current?.focus();
    }
    wasOpen.current = a.isOpen;
  }, [a.isOpen]);

  // Esc closes
  useEffect(() => {
    if (!a.isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && a.close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [a.isOpen, a]);

  // autoscroll
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [a.messages, a.pending, a.streaming]);

  const ctxLine = [a.pageContext.title, a.pageContext.summary].filter(Boolean).join(" · ");

  return (
    <>
      {!a.isOpen && (
        <div className={cn("fixed right-5 z-50", inApp ? "bottom-[88px] lg:bottom-5" : "bottom-5")}>
          {hint && (
            <div className="absolute bottom-[68px] right-0 flex w-56 items-start gap-2 rounded-card border border-gray-200 bg-white p-3 text-sm text-graphite-900 shadow-soft animate-rise">
              <button className="flex-1 text-left" onClick={() => a.open()}>{t("hint")}</button>
              <button aria-label={t("hintClose")} onClick={() => setHint(false)} className="-m-1 grid size-7 place-items-center rounded-[8px] text-gray-700 hover:bg-mist">
                <X size={15} aria-hidden />
              </button>
            </div>
          )}
          <button
            ref={fabRef}
            onClick={() => a.open()}
            aria-label={t("fab")}
            className="relative grid size-14 place-items-center rounded-full bg-graphite-900 text-white shadow-soft transition-transform hover:scale-105"
          >
            <MessageCircle size={24} aria-hidden />
            {a.unread && <span className="absolute right-3 top-3 size-2.5 rounded-full bg-brand-400 ring-2 ring-graphite-900" aria-hidden />}
          </button>
        </div>
      )}

      {a.isOpen && (
        <>
          <div className="fixed inset-0 z-[60] bg-graphite-900/30 sm:hidden" onClick={a.close} aria-hidden />
          <section
            role="dialog"
            aria-label={t("title")}
            className={cn(
              "fixed z-[61] flex flex-col bg-mist shadow-soft animate-rise",
              "inset-x-0 bottom-0 top-[6dvh] rounded-t-block",
              "sm:inset-auto sm:bottom-5 sm:right-5 sm:h-[560px] sm:max-h-[calc(100dvh-40px)] sm:w-[380px] sm:rounded-card sm:border sm:border-gray-200",
            )}
          >
            <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-gray-200 sm:hidden" aria-hidden />
            <header className="flex items-center gap-2 rounded-t-card bg-white px-3 py-2.5 border-b border-gray-200">
              <Logo size={24} markOnly />
              <h2 className="flex-1 text-[15px] font-semibold text-graphite-900">{t("title")}</h2>
              <HeaderBtn label={t("expand")} onClick={() => { a.close(); router.push(a.threadId ? `/chat?thread=${a.threadId}` : "/chat"); }}>
                <Maximize2 size={17} />
              </HeaderBtn>
              <HeaderBtn label={t("newChat")} onClick={a.newThread}><SquarePen size={17} /></HeaderBtn>
              <HeaderBtn label={t("close")} onClick={a.close}><X size={19} /></HeaderBtn>
            </header>
            {ctxLine && (
              <p className="truncate border-b border-gray-200 bg-white px-4 py-1.5 text-xs text-gray-700">
                {t("contextPrefix")} {ctxLine}
              </p>
            )}
            <div ref={scroller} className="flex-1 overflow-y-auto px-3 py-4">
              {a.messages.length === 0 && !a.pending ? (
                <div>
                  <div className="flex gap-2.5">
                    <span className="mt-0.5 shrink-0"><Logo size={26} markOnly /></span>
                    <div className="rounded-card rounded-tl-md border border-gray-200 bg-white px-3.5 py-3">
                      <p className="font-semibold text-graphite-900">{t("hello")}</p>
                      <p className="mt-1 text-sm text-gray-700">{t("helloText")}</p>
                    </div>
                  </div>
                  <Suggestions className="mt-4 pl-9" />
                </div>
              ) : (
                <ChatThread />
              )}
            </div>
            <Composer ref={composer} className="bg-mist px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1" />
          </section>
        </>
      )}
    </>
  );
}

function HeaderBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick}
      className="grid size-10 place-items-center rounded-btn text-gray-700 hover:bg-mist hover:text-graphite-900">
      {children}
    </button>
  );
}

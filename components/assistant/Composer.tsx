"use client";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUp, Square } from "lucide-react";
import { useAssistant } from "@/lib/assistant-context";
import { getSuggestions } from "@/lib/api";
import type { Locale } from "@/lib/types";
import { cn } from "../ui/primitives";

/** Поле ввода: растёт до 4 строк, Enter — отправить, Shift+Enter — новая строка. */
export const Composer = forwardRef<{ focus: () => void }, { className?: string }>(function Composer({ className }, ref) {
  const t = useTranslations("assistant");
  const { send, pending, streaming, stop } = useAssistant();
  const [text, setText] = useState("");
  const ta = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => ({ focus: () => ta.current?.focus() }));
  const busy = pending || !!streaming;

  useEffect(() => {
    const el = ta.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 4 * 24 + 18) + "px";
  }, [text]);

  const submit = () => {
    if (busy || !text.trim()) return;
    void send(text);
    setText("");
  };

  return (
    <div className={className}>
      <form
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        className="flex items-end gap-2 rounded-card border border-gray-200 bg-white p-1.5 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/15"
      >
        <textarea
          ref={ta}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={t("placeholder")}
          aria-label={t("placeholder")}
          className="max-h-[114px] min-h-10 flex-1 resize-none bg-transparent px-2.5 py-2 text-base leading-6 text-graphite-900 placeholder:text-gray-500 focus:outline-none"
        />
        {busy ? (
          <button type="button" onClick={stop} aria-label={t("stop")} title={t("stop")}
            className="grid size-10 shrink-0 place-items-center rounded-btn bg-graphite-900 text-white">
            <Square size={14} fill="currentColor" aria-hidden />
          </button>
        ) : (
          <button type="submit" aria-label={t("send")} disabled={!text.trim()}
            className="grid size-10 shrink-0 place-items-center rounded-btn bg-brand-500 text-white hover:bg-brand-600 disabled:bg-gray-200 disabled:text-gray-500">
            <ArrowUp size={18} aria-hidden />
          </button>
        )}
      </form>
      <p className="mt-1.5 px-1 text-xs text-gray-700">{t("disclaimer")}</p>
    </div>
  );
});

export function Suggestions({ className, onPick }: { className?: string; onPick?: () => void }) {
  const locale = useLocale() as Locale;
  const { pageContext, send } = useAssistant();
  const items = getSuggestions(pageContext.page, locale);
  return (
    <div className={cn("flex flex-col items-start gap-2", className)}>
      {items.map((s) => (
        <button key={s.id} type="button" onClick={() => { void send(s.text); onPick?.(); }}
          className="min-h-10 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-left text-sm text-graphite-900 hover:border-brand-500 hover:text-brand-600">
          {s.text}
        </button>
      ))}
    </div>
  );
}

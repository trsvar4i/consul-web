"use client";
import { Fragment, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AlertTriangle, Check, CircleAlert, Copy, FileText, ThumbsDown, ThumbsUp } from "lucide-react";
import type { ChatBlock, ChatMessage, Locale } from "@/lib/types";
import { useAssistant } from "@/lib/assistant-context";
import { formatNum } from "@/lib/format";
import { Link, useRouter } from "@/i18n/navigation";
import { Logo } from "../brand/Logo";
import { ButtonLink, cn } from "../ui/primitives";

/* ---- tiny safe markdown: paragraphs, **bold**, lists ---- */
function inline(s: string) {
  const parts = s.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => (p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : <Fragment key={i}>{p}</Fragment>));
}
export function Markdown({ text, className }: { text: string; className?: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <div className={className}>
      {blocks.map((b, i) => {
        const lines = b.split("\n");
        if (lines.every((l) => /^\s*[-•]\s+/.test(l)))
          return <ul key={i}>{lines.map((l, j) => <li key={j}>{inline(l.replace(/^\s*[-•]\s+/, ""))}</li>)}</ul>;
        if (lines.every((l) => /^\s*\d+\.\s+/.test(l)))
          return <ol key={i}>{lines.map((l, j) => <li key={j}>{inline(l.replace(/^\s*\d+\.\s+/, ""))}</li>)}</ol>;
        return <p key={i}>{lines.map((l, j) => <Fragment key={j}>{j > 0 && <br />}{inline(l)}</Fragment>)}</p>;
      })}
    </div>
  );
}

function sliceText(text: string, words: number) {
  const parts = text.split(/(\s+)/);
  let out = "";
  let c = 0;
  for (const p of parts) {
    if (/\S/.test(p)) {
      if (c >= words) break;
      c++;
    }
    out += p;
  }
  return { out, used: c };
}

function Block({ b, wide }: { b: ChatBlock; wide?: boolean }) {
  const t = useTranslations("assistant");
  const { send, requestAddOperation, close } = useAssistant();
  const router = useRouter();
  switch (b.type) {
    case "text":
      return <Markdown text={b.markdown} className="chat-md text-[15px] text-graphite-900" />;
    case "numbers":
      return (
        <table className="w-full text-sm num">
          <tbody>
            {b.rows.map((r, i) => (
              <tr key={i} className="border-b border-gray-200/70">
                <td className="py-1.5 pr-3 text-gray-700">{r.label}</td>
                <td className={cn("py-1.5 text-right whitespace-nowrap", r.value < 0 ? "text-graphite-900" : "text-graphite-900")}>
                  {r.value < 0 ? "−" : ""}{formatNum(Math.abs(r.value))}
                </td>
              </tr>
            ))}
            {b.total && (
              <tr>
                <td className="pt-2 pr-3 font-semibold">{b.total.label}</td>
                <td className="pt-2 text-right font-semibold whitespace-nowrap">{b.total.value < 0 ? "−" : ""}{formatNum(Math.abs(b.total.value))}</td>
              </tr>
            )}
          </tbody>
        </table>
      );
    case "source":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-mist px-2.5 py-1 text-xs text-gray-700">
          <FileText size={13} aria-hidden />
          {b.label}
        </span>
      );
    case "actions":
      return (
        <div className={cn("flex flex-wrap gap-2", wide && "gap-2.5")}>
          {b.items.map((it, i) =>
            it.href ? (
              <Link key={i} href={it.href} onClick={() => { if (window.innerWidth < 640) close(); }}
                className="inline-flex min-h-10 items-center rounded-btn border border-brand-500/40 bg-white px-3 text-sm font-medium text-brand-500 hover:bg-brand-50">
                {it.label}
              </Link>
            ) : it.action === "open_add_operation" ? (
              <button key={i} onClick={() => { requestAddOperation(); router.push("/app/operations?add=1"); }}
                className="inline-flex min-h-10 items-center rounded-btn border border-brand-500/40 bg-white px-3 text-sm font-medium text-brand-500 hover:bg-brand-50">
                {it.label}
              </button>
            ) : (
              <button key={i} onClick={() => void send(it.label)}
                className="inline-flex min-h-10 items-center rounded-full border border-gray-200 bg-white px-3 text-left text-sm text-graphite-900 hover:border-gray-500">
                {it.label}
              </button>
            ),
          )}
        </div>
      );
    case "warning": {
      const Icon = b.level === "error" ? CircleAlert : AlertTriangle;
      return (
        <div className={cn("flex gap-2 rounded-btn border px-3 py-2.5 text-sm", b.level === "error" ? "border-error/25 bg-error-50" : "border-warning/25 bg-warning-50")}>
          <Icon size={17} className={cn("mt-px shrink-0", b.level === "error" ? "text-error" : "text-warning")} aria-hidden />
          <span className="text-graphite-900">{b.text}</span>
        </div>
      );
    }
    case "login":
      return (
        <div className="rounded-card border border-gray-200 bg-mist p-4">
          <p className="font-semibold text-graphite-900">{t("loginTitle")}</p>
          <p className="mt-1 text-sm text-gray-700">{t("loginText")}</p>
          <ButtonLink href="/login" className="mt-3" size="sm">{t("loginBtn")}</ButtonLink>
        </div>
      );
  }
}

function plainText(m: ChatMessage) {
  return m.blocks
    .map((b) =>
      b.type === "text" ? b.markdown.replace(/\*\*/g, "")
        : b.type === "numbers" ? [...b.rows, ...(b.total ? [b.total] : [])].map((r) => `${r.label}: ${formatNum(r.value)}`).join("\n")
        : b.type === "warning" ? b.text
        : b.type === "source" ? b.label : "",
    )
    .filter(Boolean)
    .join("\n\n");
}

function AssistantMessage({ m, wide }: { m: ChatMessage; wide?: boolean }) {
  const t = useTranslations("assistant");
  const { streaming, setFeedback } = useAssistant();
  const [copied, setCopied] = useState(false);
  const isStreaming = streaming?.id === m.id;
  let budget = isStreaming ? streaming!.words : Infinity;
  const shown: ChatBlock[] = [];
  for (const b of m.blocks) {
    if (b.type === "text") {
      if (budget <= 0) break;
      const { out, used } = sliceText(b.markdown, budget);
      budget -= used;
      shown.push({ ...b, markdown: out });
      if (budget <= 0 && isStreaming) break;
    } else {
      if (isStreaming) break; // structured blocks appear after text is done
      shown.push(b);
    }
  }
  return (
    <div className="flex gap-2.5">
      <span className="mt-0.5 shrink-0"><Logo size={26} markOnly /></span>
      <div className={cn("min-w-0 flex-1 space-y-3 rounded-card rounded-tl-md border border-gray-200 bg-white px-3.5 py-3", wide && "px-4 py-3.5")}>
        {shown.map((b, i) => <Block key={i} b={b} wide={wide} />)}
        {!isStreaming && m.blocks[0]?.type !== "login" && (
          <div className="flex items-center gap-1 pt-0.5 text-gray-700">
            <IconBtn label={t("like")} active={m.feedback === "up"} onClick={() => setFeedback(m.id, "up")}><ThumbsUp size={15} /></IconBtn>
            <IconBtn label={t("dislike")} active={m.feedback === "down"} onClick={() => setFeedback(m.id, "down")}><ThumbsDown size={15} /></IconBtn>
            <IconBtn
              label={copied ? t("copied") : t("copy")}
              onClick={() => {
                void navigator.clipboard?.writeText(plainText(m)).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                });
              }}
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
            </IconBtn>
          </div>
        )}
      </div>
    </div>
  );
}

function IconBtn({ label, onClick, children, active }: { label: string; onClick: () => void; children: React.ReactNode; active?: boolean }) {
  return (
    <button type="button" aria-label={label} title={label} aria-pressed={active} onClick={onClick}
      className={cn("grid size-8 place-items-center rounded-[8px] hover:bg-mist", active && "bg-mist text-graphite-900")}>
      {children}
    </button>
  );
}

export function Typing() {
  const t = useTranslations("assistant");
  return (
    <div className="flex gap-2.5" role="status" aria-label={t("typing")}>
      <span className="mt-0.5 shrink-0"><Logo size={26} markOnly /></span>
      <div className="flex items-center gap-1 rounded-card rounded-tl-md border border-gray-200 bg-white px-4 py-3.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-2 rounded-full bg-gray-500 animate-blink" style={{ animationDelay: `${i * 0.18}s` }} />
        ))}
      </div>
    </div>
  );
}

export function ChatThread({ wide = false }: { wide?: boolean }) {
  const { messages, pending } = useAssistant();
  const locale = useLocale() as Locale;
  void locale;
  return (
    <div className="space-y-4" aria-live="polite">
      {messages.map((m) =>
        m.role === "user" ? (
          <div key={m.id} className="flex justify-end">
            <div className="max-w-[85%] rounded-card rounded-tr-md bg-graphite-900 px-3.5 py-2.5 text-[15px] text-white whitespace-pre-wrap">
              {m.blocks[0]?.type === "text" ? m.blocks[0].markdown : ""}
            </div>
          </div>
        ) : (
          <AssistantMessage key={m.id} m={m} wide={wide} />
        ),
      )}
      {pending && <Typing />}
    </div>
  );
}

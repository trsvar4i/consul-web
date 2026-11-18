"use client";
import { useTranslations } from "next-intl";
import { HelpCircle } from "lucide-react";
import { useAssistant } from "@/lib/assistant-context";
import { cn } from "../ui/primitives";

/** «Почему?» рядом с важной цифрой: открывает помощника и сразу отправляет вопрос с контекстом. */
export function WhyButton({ metric, value, question, data, className, onDark = false, label }: {
  metric: string;
  value?: number;
  question: string;
  data?: Record<string, unknown>;
  className?: string;
  onDark?: boolean;
  label?: string;
}) {
  const t = useTranslations("common");
  const { open } = useAssistant();
  return (
    <button
      type="button"
      onClick={() => open({ question, context: { data: { metric, value, ...data } } })}
      className={cn(
        "inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors",
        onDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-mist text-graphite-900 hover:bg-gray-200",
        className,
      )}
    >
      <HelpCircle size={16} aria-hidden />
      {label ?? t("why")}
    </button>
  );
}

/** Открыть помощника с готовым вопросом (чипы на панели, «Спросить Consul»). */
export function AskButton({ question, children, className }: { question?: string; children: React.ReactNode; className?: string }) {
  const { open } = useAssistant();
  return (
    <button type="button" onClick={() => open(question ? { question } : undefined)} className={className}>
      {children}
    </button>
  );
}

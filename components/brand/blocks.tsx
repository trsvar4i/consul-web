"use client";
import { useTranslations } from "next-intl";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, CircleAlert, Info, Inbox, WifiOff } from "lucide-react";
import { Button, ButtonLink, Card, cn } from "../ui/primitives";

/** Маленькая карточка показателя с изменением к прошлому месяцу. */
export function StatCard({ title, value, delta, deltaLabel, invert = false }: {
  title: string;
  value: string;
  delta?: number; // percent
  deltaLabel?: string;
  invert?: boolean; // for expenses growth is bad
}) {
  const up = (delta ?? 0) >= 0;
  const good = invert ? !up : up;
  return (
    <Card className="p-4">
      <p className="text-sm text-gray-700">{title}</p>
      <p className="num mt-1 text-xl font-semibold tracking-tight text-graphite-900">{value}</p>
      {delta !== undefined && Number.isFinite(delta) && (
        <p className={cn("mt-1 inline-flex items-center gap-0.5 text-sm num", good ? "text-success" : "text-error")} title={deltaLabel}>
          {up ? <ArrowUpRight size={16} aria-hidden /> : <ArrowDownRight size={16} aria-hidden />}
          {up ? "+" : "−"}
          {Math.abs(delta).toFixed(1).replace(".", ",")}%
          <span className="sr-only"> {deltaLabel}</span>
        </p>
      )}
    </Card>
  );
}

/** Строка-предупреждение: иконка + текст + кнопка действия. Цвет не единственный признак. */
export function AlertItem({ level, text, action }: { level: "info" | "warning" | "error"; text: string; action?: { label: string; href: string } }) {
  const Icon = level === "error" ? CircleAlert : level === "warning" ? AlertTriangle : Info;
  const tone = level === "error" ? "text-error bg-error-50" : level === "warning" ? "text-warning bg-warning-50" : "text-gray-700 bg-mist";
  return (
    <div className="flex items-start gap-3 py-3.5">
      <span className={cn("mt-0.5 grid size-8 shrink-0 place-items-center rounded-full", tone)}>
        <Icon size={18} aria-hidden />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <p className="pt-1 text-[15px] leading-snug text-graphite-900">{text}</p>
        {action && (
          <ButtonLink href={action.href} variant="secondary" size="sm" className="shrink-0 self-start">
            {action.label}
          </ButtonLink>
        )}
      </div>
    </div>
  );
}

export function Banner({ level, children, className }: { level: "warning" | "error" | "success" | "info"; children: React.ReactNode; className?: string }) {
  const Icon = level === "error" ? CircleAlert : level === "warning" ? AlertTriangle : Info;
  const tone = {
    error: "bg-error-50 text-error border-error/25",
    warning: "bg-warning-50 text-warning border-warning/25",
    success: "bg-success-50 text-success border-success/25",
    info: "bg-mist text-gray-700 border-gray-200",
  }[level];
  return (
    <div role={level === "error" ? "alert" : "status"} className={cn("flex gap-2.5 rounded-btn border px-3.5 py-3 text-sm leading-snug", tone, className)}>
      <Icon size={18} className="mt-px shrink-0" aria-hidden />
      <div className="text-graphite-900">{children}</div>
    </div>
  );
}

export function EmptyState({ title, text, children, icon: Icon = Inbox }: { title: string; text?: string; children?: React.ReactNode; icon?: typeof Inbox }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <span className="grid size-14 place-items-center rounded-card bg-mist text-gray-500">
        <Icon size={26} aria-hidden />
      </span>
      <p className="mt-4 text-lg font-semibold text-graphite-900">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-gray-700">{text}</p>}
      {children && <div className="mt-5 flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("common");
  return (
    <div role="alert" className="flex flex-col items-center px-6 py-12 text-center">
      <span className="grid size-14 place-items-center rounded-card bg-error-50 text-error">
        <WifiOff size={26} aria-hidden />
      </span>
      <p className="mt-4 text-base font-medium text-graphite-900">{t("errorLoad")}</p>
      <Button variant="secondary" className="mt-4" onClick={onRetry}>
        {t("retry")}
      </Button>
    </div>
  );
}

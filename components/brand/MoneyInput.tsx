"use client";
import { forwardRef, useId } from "react";
import { useLocale } from "next-intl";
import { currency, formatNum } from "@/lib/format";
import { cn, inputCls } from "../ui/primitives";

type Props = {
  value: number | undefined;
  onChange: (n: number | undefined) => void;
  label?: string;
  hint?: string;
  error?: string;
  suffix?: string;
  className?: string;
  autoFocus?: boolean;
  id?: string;
  onDark?: boolean;
};

/** Поле суммы: показывает «50 000 000», отдаёт число. Цифровая клавиатура на телефоне. */
export const MoneyInput = forwardRef<HTMLInputElement, Props>(function MoneyInput(
  { value, onChange, label, hint, error, suffix, className, autoFocus, id, onDark },
  ref,
) {
  const locale = useLocale();
  const auto = useId();
  const inputId = id ?? auto;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className={cn("block text-sm font-medium mb-1.5", onDark ? "text-white" : "text-graphite-900")}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          inputMode="numeric"
          autoComplete="off"
          autoFocus={autoFocus}
          aria-invalid={!!error}
          aria-describedby={hint || error ? inputId + "-d" : undefined}
          className={cn(inputCls, "pr-16 num", error && "border-error")}
          value={value === undefined || Number.isNaN(value) ? "" : formatNum(value)}
          onChange={(e) => {
            const digits = e.target.value.replace(/[^\d]/g, "").slice(0, 13);
            onChange(digits === "" ? undefined : Number(digits));
          }}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-700">{suffix ?? currency(locale)}</span>
      </div>
      {(hint || error) && (
        <p id={inputId + "-d"} className={cn("mt-1 text-sm", error ? "text-error" : onDark ? "text-ondark" : "text-gray-700")}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
});

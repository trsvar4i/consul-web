"use client";
import { cn } from "./primitives";

/** Переключатель-кнопки (radiogroup). Крупные, удобные для пальца. */
export function Segmented<T extends string>({
  value, onChange, options, label, className, size = "md", wrap = false,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; disabled?: boolean }[];
  label?: string;
  className?: string;
  size?: "md" | "lg";
  wrap?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn(wrap ? "flex flex-wrap gap-2" : "grid gap-1 rounded-btn bg-mist p-1", className)}
      style={wrap ? undefined : { gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={o.disabled}
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-[8px] px-3 text-sm font-medium transition-colors min-h-11 leading-tight",
              size === "lg" && "min-h-14 text-[15px] px-4",
              wrap
                ? on
                  ? "border-2 border-brand-500 bg-brand-50 text-graphite-900"
                  : "border border-gray-200 bg-white text-graphite-900 hover:border-gray-500"
                : on
                  ? "bg-white text-graphite-900 shadow-soft"
                  : "text-gray-700 hover:text-graphite-900",
              o.disabled && "opacity-50",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

import { cn } from "../ui/primitives";

const RATIO = 1073 / 400; // consul-logo-l: знак + слово «Consul»

/**
 * Логотип Consul (вариант L). Полный — знак + слово; markOnly — только знак на плитке.
 * tone="dark" — версия для тёмного фона (слово белое). Не перекрашивать и не растягивать.
 */
export function Logo({ size = 32, tone = "light", markOnly = false, className, hideWordOnMobile = false }: {
  size?: number;
  tone?: "light" | "dark";
  markOnly?: boolean;
  className?: string;
  hideWordOnMobile?: boolean;
}) {
  // высота полного логотипа чуть больше знака, чтобы плитка совпадала по размеру
  const h = Math.round(size * 1.25);
  const full = (
    // eslint-disable-next-line @next/next/no-img-element -- static SVG logo
    <img src={tone === "dark" ? "/logo/consul-logo-dark.svg" : "/logo/consul-logo.svg"} alt="Consul" height={h} width={Math.round(h * RATIO)}
      style={{ height: h, width: "auto" }} className={cn("shrink-0", hideWordOnMobile && "hidden sm:block")} />
  );
  const mark = (
    // eslint-disable-next-line @next/next/no-img-element -- static SVG mark
    <img src="/logo/consul-mark-tile.svg" width={size} height={size} alt="" aria-hidden className={cn("shrink-0", hideWordOnMobile && "sm:hidden")} />
  );
  if (markOnly) return <span className={cn("inline-flex items-center", className)}>{mark}</span>;
  return (
    <span className={cn("inline-flex items-center", className)}>
      {hideWordOnMobile && mark}
      {full}
    </span>
  );
}

/** Знак без плитки, крупно — для тёмных блоков. */
export function MarkLarge({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 180" className={className} aria-hidden>
      <rect x="0" y="0" width="115" height="115" rx="16" fill="#A3213A" />
      <rect x="65" y="65" width="115" height="115" rx="16" fill="#F59AAA" />
      <rect x="65" y="65" width="50" height="50" rx="10" fill="#E0566D" />
    </svg>
  );
}

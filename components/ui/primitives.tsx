// Базовые UI-примитивы в стиле shadcn/ui, окрашенные в цвета Consul.
import { forwardRef } from "react";
import { Link } from "@/i18n/navigation";

export function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

type Variant = "primary" | "secondary" | "ghost" | "dark" | "onDark" | "danger";
const variants: Record<Variant, string> = {
  primary: "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-600",
  secondary: "bg-white text-graphite-900 border border-gray-200 hover:border-gray-500 hover:bg-mist",
  ghost: "bg-transparent text-graphite-900 hover:bg-mist",
  dark: "bg-graphite-900 text-white hover:bg-graphite-800",
  onDark: "bg-transparent text-white border border-white/25 hover:bg-white/10",
  danger: "bg-white text-error border border-error/40 hover:bg-error-50",
};
const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-[15px]",
  lg: "h-12 px-5 text-base",
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: keyof typeof sizes };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-btn font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none select-none",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
});

export function ButtonLink({
  href, variant = "primary", size = "md", className, children, ...rest
}: { href: string; variant?: Variant; size?: keyof typeof sizes; className?: string; children: React.ReactNode } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-btn font-medium transition-colors select-none",
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {children}
    </Link>
  );
}

export function Card({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("bg-white border border-gray-200 rounded-card", className)} {...p} />;
}

export function Badge({ tone = "neutral", className, ...p }: React.HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "success" | "warning" | "error" | "brand" }) {
  const tones = {
    neutral: "bg-mist text-gray-700",
    success: "bg-success-50 text-success",
    warning: "bg-warning-50 text-warning",
    error: "bg-error-50 text-error",
    brand: "bg-brand-50 text-brand-600",
  };
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap", tones[tone], className)} {...p} />;
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-card bg-gray-200/70", className)} />;
}

export function Label({ className, ...p }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("block text-sm font-medium text-graphite-900 mb-1.5", className)} {...p} />;
}

export const inputCls =
  "w-full h-11 rounded-btn border border-gray-200 bg-white px-3 text-base text-graphite-900 placeholder:text-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...p }, ref) {
  return <input ref={ref} className={cn(inputCls, className)} {...p} />;
});

export function Select({ className, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(inputCls, "pr-8 appearance-auto", className)} {...p} />;
}

export function Container({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)} {...p} />;
}

export function SectionTitle({ className, ...p }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-[22px] lg:text-[32px] font-semibold tracking-tight text-graphite-900", className)} {...p} />;
}

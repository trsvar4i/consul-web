"use client";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "../ui/primitives";

function Inner({ onDark }: { onDark?: boolean }) {
  const locale = useLocale();
  const t = useTranslations("lang");
  const pathname = usePathname();
  const router = useRouter();
  const sp = useSearchParams();
  const qs = sp.toString();
  return (
    <div role="group" aria-label={t("label")} className={cn("inline-flex rounded-btn p-0.5 text-sm font-medium", onDark ? "bg-white/10" : "bg-mist")}>
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={l === locale}
          lang={l}
          onClick={() => router.replace(pathname + (qs ? `?${qs}` : ""), { locale: l, scroll: false })}
          className={cn(
            "min-h-9 min-w-10 rounded-[8px] px-2.5",
            l === locale
              ? onDark ? "bg-white text-graphite-900" : "bg-white text-graphite-900 shadow-soft"
              : onDark ? "text-ondark hover:text-white" : "text-gray-700 hover:text-graphite-900",
          )}
        >
          {t(l)}
        </button>
      ))}
    </div>
  );
}

/** UZ | RU — переключение оставляет пользователя на той же странице. */
export function LanguageSwitcher({ onDark }: { onDark?: boolean }) {
  return (
    <Suspense fallback={<div className="h-10 w-[88px]" />}>
      <Inner onDark={onDark} />
    </Suspense>
  );
}

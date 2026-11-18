"use client";
import { mln } from "@/lib/format";
import NextLink from "next/link";
import { usePathname, useRouter as useNextRouter } from "next/navigation";
import { createContext, useContext, useMemo, type ComponentProps, type ReactNode } from "react";
import { localize, translator, type Lang, type T } from "@/lib/i18n";

const Ctx = createContext<{ lang: Lang; t: T }>({ lang: "uz", t: translator("uz") });

export function I18nProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const v = useMemo(() => ({ lang, t: translator(lang) }), [lang]);
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}
export const useI18n = () => useContext(Ctx);
export const useT = () => useContext(Ctx).t;

/** next/link that keeps the current language in internal paths. */
export function Link({ href, ...rest }: ComponentProps<typeof NextLink>) {
  const { lang } = useI18n();
  return <NextLink href={typeof href === "string" ? localize(lang, href) : href} {...rest} />;
}

/** Router whose push/replace keep the current language. */
export function useRouter() {
  const r = useNextRouter(), { lang } = useI18n();
  return useMemo(() => ({ ...r, push: (h: string) => r.push(localize(lang, h)), replace: (h: string) => r.replace(localize(lang, h)) }), [r, lang]);
}

function saveLang(l: Lang) { document.cookie = `lang=${l}; path=/; max-age=31536000; samesite=lax`; }

/** UZ | RU switch. Keeps the current page, saves the choice for the proxy. */
export function LangSwitch({ className = "lng", item = "span" }: { className?: string; item?: "span" | "button" }) {
  const { lang } = useI18n();
  const path = usePathname() || "/";
  const go = (l: Lang) => {
    saveLang(l);
    const rest = path.replace(/^\/(uz|ru)(?=\/|$)/, "");
    window.location.assign(`/${l}${rest}${window.location.search}${window.location.hash}`);
  };
  const Tag = item;
  return <span className={className} role="group" aria-label="Til / Язык">
    {(["uz", "ru"] as const).map(l => <Tag key={l} className={l === lang ? "on" : ""} role="button" tabIndex={0} aria-pressed={l === lang} style={{ cursor: "pointer" }}
      onClick={() => l !== lang && go(l)} onKeyDown={e => { if ((e.key === "Enter" || e.key === " ") && l !== lang) go(l); }}>{l.toUpperCase()}</Tag>)}
  </span>;
}

/** Translates each part of "A · B, C" separately (operation titles, subtitles built from parts). */
export function useTP() {
  const t = useT();
  return (s: string) => s.split(" · ").map(p => p.split(", ").map(x => t(x)).join(", ")).join(" · ");
}

/** Extraction marker for module-level strings: returns the Uzbek source; translate with t() where rendered. */
export const tk = (s: string) => s;

/** Million/billion formatter with the unit in the current language. */
export function useMln() {
  const t = useT();
  return (n: number) => mln(n).replace(/mlrd|mln/, w => t(w));
}

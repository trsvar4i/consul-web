/** Tiny i18n: Uzbek source strings are the keys (gettext style). Missing Russian falls back to Uzbek.
 *  Params: t("{n} kundan beri", { n: 3 }). */
import { RU } from "./ru";

export const LANGS = ["uz", "ru"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "uz";
export const isLang = (s: string | undefined): s is Lang => !!s && (LANGS as readonly string[]).includes(s);

export type Params = Record<string, string | number>;
export type T = (s: string, p?: Params) => string;

const fill = (s: string, p?: Params) => (p ? s.replace(/\{(\w+)\}/g, (m, k) => (k in p ? String(p[k]) : m)) : s);

export function translator(lang: Lang): T {
  return (s, p) => fill(lang === "ru" ? RU[s] ?? s : s, p);
}

/** Prefixes an internal path with the language: ("ru", "/app/pul") -> "/ru/app/pul". */
export function localize(lang: Lang, href: string): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  if (/^\/(uz|ru)(\/|$|\?|#)/.test(href)) return href;
  return `/${lang}${href === "/" ? "" : href}`;
}

/** Strips "/uz" or "/ru" from a pathname. */
export const stripLang = (path: string) => path.replace(/^\/(uz|ru)(?=\/|$)/, "") || "/";

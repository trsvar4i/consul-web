import type { Locale } from "./types";

const nf = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });

/** "1 250 000" — без валюты, с обычными пробелами */
export const formatNum = (n: number) => nf.format(Math.round(n)).replace(/[  ,]/g, " ");

/** "1 250 000 soʻm" / "1 250 000 сум" */
export const formatSom = (n: number, locale: Locale | string) =>
  (n < 0 ? "−" : "") + formatNum(Math.abs(n)) + (locale === "uz" ? " soʻm" : " сум");

export const currency = (locale: Locale | string) => (locale === "uz" ? "soʻm" : "сум");

/** 4 200 000 → "4,2 mln" / "4,2 млн" */
export const formatShort = (n: number, locale: Locale | string) => {
  const abs = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  const fx = (v: number) => v.toFixed(1).replace(".0", "").replace(".", ",");
  if (abs >= 1e9) return sign + fx(abs / 1e9) + (locale === "uz" ? " mlrd" : " млрд");
  if (abs >= 1e6) return sign + fx(abs / 1e6) + (locale === "uz" ? " mln" : " млн");
  if (abs >= 1e3) return sign + Math.round(abs / 1e3) + (locale === "uz" ? " ming" : " тыс");
  return sign + Math.round(abs);
};

const MONTHS: Record<string, string[]> = {
  uz: ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"],
  ru: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
};
const MONTHS_NOM: Record<string, string[]> = {
  uz: ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"],
  ru: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
};

/** "2026-10-05" → "5 oktabr" / "5 октября" */
export const formatDate = (iso: string, locale: Locale | string) => {
  const [, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${d} ${MONTHS[locale === "uz" ? "uz" : "ru"][m - 1]}`;
};
export const formatDateFull = (iso: string, locale: Locale | string) => `${formatDate(iso, locale)} ${iso.slice(0, 4)}`;
const MONTHS_IN: Record<string, string[]> = {
  uz: MONTHS_NOM.uz,
  ru: ["январе", "феврале", "марте", "апреле", "мае", "июне", "июле", "августе", "сентябре", "октябре", "ноябре", "декабре"],
};
/** «в мае» / «May oyida» — форма месяца для фразы «в …» */
export const monthNameIn = (monthIdx0: number, locale: Locale | string) => MONTHS_IN[locale === "uz" ? "uz" : "ru"][monthIdx0];
export const monthName = (monthIdx0: number, locale: Locale | string) => MONTHS_NOM[locale === "uz" ? "uz" : "ru"][monthIdx0];
export const formatMonth = (ym: string, locale: Locale | string) => {
  const [y, m] = ym.split("-").map(Number);
  return `${monthName(m - 1, locale)} ${y}`;
};

/** "50 000 000" → 50000000 */
export const parseMoney = (s: string) => {
  const n = Number(s.replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

/** Демо-строки вида «uz / ru» → нужная половина */
export const pickLang = (s: string, locale: Locale | string) => {
  if (!s.includes(" / ")) return s;
  const [uz, ru] = s.split(" / ");
  return locale === "uz" ? uz : ru;
};

/** Uzbek apostrophe normalisation for search: ' ‘ ’ ` ʼ → ʻ */
export const normalizeUz = (s: string) => s.toLowerCase().replace(/['‘’`ʼ]/g, "ʻ").trim();

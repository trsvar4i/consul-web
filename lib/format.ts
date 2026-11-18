/** Number formatting for Uzbek UI: thin groups with plain spaces, real minus sign. */
export const fmt = (v: number): string =>
  (v < 0 ? "−" : "") + Math.round(Math.abs(v)).toLocaleString("ru-RU").replace(/[   ,]/g, " ");

/** 12 000 000 -> "12 mln", 1 500 000 -> "1,5 mln". */
export const mln = (v: number): string => {
  const a = Math.abs(v) / 1e6;
  const n = a >= 10 ? Math.round(a) : Math.round(a * 10) / 10;
  return (v < 0 ? "−" : "") + String(n).replace(".", ",") + " mln";
};

export const pct = (v: number): string => (Math.round(v * 10) / 10).toString().replace(".", ",") + "%";

/** Reads digits (and one decimal separator) from a user-typed money string. */
export const parseNum = (s: string): number => +s.replace(/[^\d.,]/g, "").replace(",", ".") || 0;

/** Re-formats a money input while typing: "1200000" -> "1 200 000". */
export const formatInput = (s: string): string => {
  const d = s.replace(/\D/g, "");
  return d ? fmt(+d) : "";
};

export const roundK = (v: number): number => Math.round(v / 1000) * 1000;

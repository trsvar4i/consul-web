/** Sample aggregates for the Chamber report. Production: computed by the backend with k-anonymity >= 5. */
export const DATA = {
  90: { b: "58%", bd: "+2 p.p. 90 kunda", c: "18", cd: "90 kunda", e: "31%", ed: "±5 p.p. · 90 kunda −3 p.p." },
  30: { b: "58%", bd: "+1 p.p. 30 kunda", c: "7", cd: "30 kunda", e: "31%", ed: "±5 p.p. · 30 kunda −1 p.p." },
} as const;
export const SERIES = {
  f: { v: [52, 53, 55, 56, 57, 58], mn: 40, mx: 70, c: "#22262C" },
  e: { v: [38, 37, 35, 34, 32, 31], mn: 20, mx: 50, c: "#C23650" },
} as const;
export const LABELS = ["iyun", "iyul", "avg", "sen", "okt", "noy"];
export const SECTORS: [string, number, number, number][] = [["Quruq meva, yongʻoq", 296, 64, 26], ["Oziq-ovqat", 248, 57, 33], ["Kiyim", 171, 52, 37], ["Xizmatlar", 97, 55, 30]];
export const MARKETS: [string, number, number, number, string][] = [["Chorsu", 318, 61, 28, "52 mln"], ["Oloy", 224, 57, 32, "44 mln"], ["Parkent", 178, 54, 36, "39 mln"], ["Qoʻyliq", 90, 55, 34, "41 mln"]];
export const toCsv = () => "﻿" + [["kesim", "nomi", "tadbirkorlar", "rasmiy_%", "hisobsiz_aylanma_%"], ...SECTORS.map(s => ["soha", ...s]), ...MARKETS.map(m => ["bozor", ...m.slice(0, 4)])].map(r => r.join(";")).join("\n");

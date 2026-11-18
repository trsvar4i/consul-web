import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DEMO } from "../demo";
import { apply, view } from "../ledger";
import { intent } from "../parse";
import { answer, type Topic } from "../answer";
import { translator } from "../i18n";
import { RU } from "../i18n/ru";

const ROOT = join(__dirname, "..", "..");
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap(n => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : /\.tsx?$/.test(n) && !p.includes("__tests__") ? [p] : [];
  });

/** Keys passed to t()/T()/tk() and tr() in the landing script. */
function sourceKeys(): Set<string> {
  const keys = new Set<string>();
  for (const f of ["components", "app", "lib"].flatMap(d => walk(join(ROOT, d)))) {
    const s = readFileSync(f, "utf8");
    for (const m of s.matchAll(/\b(?:t|T|tk)\("((?:[^"\\]|\\.)*)"/g)) keys.add(m[1].replace(/\\"/g, '"'));
    for (const m of s.matchAll(/\btr\('((?:[^'\\]|\\.)*)'/g)) keys.add(m[1]);
    if (f.endsWith(".tsx")) for (const m of s.matchAll(/\b(?:a|sub|b|title|backLabel|label|text|hint|unit)="([^"]*)"/g)) keys.add(m[1]);
  }
  return keys;
}

describe("Russian dictionary", () => {
  it("translates every source string", () => {
    const missing = [...sourceKeys()].filter(k => /[A-Za-zʻ]/.test(k) && !(k in RU));
    expect(missing).toEqual([]);
  });
  it("keeps every {placeholder}", () => {
    const ph = (s: string) => (s.match(/\{\w+\}/g) || []).sort().join();
    const bad = Object.entries(RU).filter(([k, v]) => ph(k) !== ph(v));
    expect(bad).toEqual([]);
  });
  it("fills params and falls back to Uzbek", () => {
    const t = translator("ru");
    expect(t("Sarflash mumkin: {x}", { x: "4 200 000" })).toBe("Можно потратить: 4 200 000");
    expect(t("not a key {a}", { a: 1 })).toBe("not a key 1");
    expect(translator("uz")("Sarflash mumkin: {x}", { x: 5 })).toBe("Sarflash mumkin: 5");
  });
});

describe("Russian input", () => {
  const d = DEMO.debtors;
  it.each([
    ["продажа 1,2 млн", { type: "op", kind: "sale", amount: 1_200_000 }],
    ["продал на 500 тысяч картой", { type: "op", kind: "sale", amount: 500_000, method: "karta" }],
    ["свет 420 тысяч", { type: "op", kind: "exp", amount: 420_000, label: "svet" }],
    ["заплатил аренду 3 млн", { type: "op", kind: "exp", label: "ijara" }],
    ["Кариму 500 тысяч в долг", { type: "op", kind: "nas", amount: 500_000, who: "карим" }],
    ["Карим вернул 200 тысяч", { type: "op", kind: "repaid", who: "Karim" }],
    ["аренда 3 млн, 5 числа", { type: "rent", amount: 3_000_000, day: "5" }],
    ["наличные осталось 4,3 млн", { type: "fix", field: "naqd", amount: 4_300_000 }],
    ["отчёт для банка", { type: "report" }],
    ["можно взять кредит?", { type: "question" }],
  ])("%s", (text, exp) => expect(intent(text, d)).toMatchObject(exp));
});

describe("Russian names match existing debtors", () => {
  it("adds to Karim, title keeps the stored name", () => {
    const r = apply(DEMO, "nas", 300_000, "naqd", undefined, "карим");
    expect(r.title).toBe("Nasiya · Karim");
    expect(r.ledger.debtors.find(x => x.name === "Karim")?.amount).toBe(800_000);
    expect(r.ledger.debtors).toHaveLength(DEMO.debtors.length);
  });
});

describe("Russian answers", () => {
  const t = translator("ru");
  const ask = (q: string, last: Topic = null, route = "consul") => answer(q, { ledger: DEMO, view: view(DEMO), route, last, t });

  it("answers in Russian with the same numbers", () => {
    const r = ask("Сколько можно потратить сегодня?");
    expect(r.topic).toBe("spend");
    expect(r.reply.text).toContain("Сегодня можно потратить: **4 200 000**");
    expect(ask("Можно взять кредит?").reply.text).toContain("34 млн на 24 мес.");
  });
  it.each([
    ["Сколько я заработала?", "profit"], ["Можно взять кредит?", "loan"], ["Когда налог?", "tax"],
    ["Моя цена правильная?", "price"], ["Составь бизнес-план", "plan"], ["Что такое маржа?", "learn"],
    ["Если взять помощника?", "help"], ["Если закуплю на 15 млн?", "buy"],
  ])("%s → %s", (q, topic) => expect(ask(q).topic).toBe(topic));

  it("every Russian suggestion routes like its Uzbek source", () => {
    const seen = new Set<string>();
    const starts: [string, Topic][] = [["salom", null], ["qancha foyda qildim?", null], ["kredit olsam boʻladimi?", null], ["soliq qachon?", null], ["biznes-reja tuz", null], ["narxim toʻgʻrimi?", null], ["yordamchi olsam?", null]];
    for (const [q0, last0] of starts) {
      const uz = answer(q0, { ledger: DEMO, view: view(DEMO), route: "consul", last: last0 });
      for (const s of uz.reply.sug || []) {
        if (seen.has(s)) continue; seen.add(s);
        const a = answer(s, { ledger: DEMO, view: view(DEMO), route: "consul", last: uz.topic });
        const b = ask(t(s), uz.topic);
        expect([s, b.topic, !!b.reply.fallback]).toEqual([s, a.topic, !!a.reply.fallback]);
      }
    }
    expect(seen.size).toBeGreaterThan(8);
  });
});

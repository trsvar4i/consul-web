"use client";
import { Link, useT, tk } from "@/components/I18n";
import { useState, type ReactNode } from "react";
import { fmt, formatInput, parseNum, pct, roundK } from "@/lib/format";
import { breakEven, credit, creditRisk, marginOf, markupOf, priceFrom, type PayType, type PriceMode } from "@/lib/finance";
import { PROFIT_TAX, turnoverRate, vatAndProfit, VAT, VAT_SIMPLIFIED, type Status } from "@/lib/tax";

export type CalcTab = "kredit" | "soliq" | "zarar" | "narx";
type Variant = "pub" | "app";
type Cta = { label: string; href?: string; onClick?: () => void; secondary?: boolean } | null;

const TABS: [CalcTab, string][] = [["kredit", tk("Kredit")], ["soliq", tk("Soliq")], ["zarar", tk("Zararsizlik")], ["narx", tk("Narx")]];

/** Money/percent input in the calculator style. Money fields reformat with spaces while typing. */
function Field({ label, value, onChange, unit, money = true, hint }: { label: ReactNode; value: string; onChange: (v: string) => void; unit: string; money?: boolean; hint?: string }) {
  const t = useT();
  return <label className="cx-f"><span>{typeof label === "string" ? t(label) : label}{hint && <small style={{ fontWeight: 400, color: "var(--mut)" }}> · {t(hint)}</small>}</span><div className="cx-in">
    <input inputMode={money ? "numeric" : "decimal"} value={value} onChange={e => onChange(money ? formatInput(e.target.value) : e.target.value.replace(/[^\d.,]/g, ""))} /><em>{t(unit)}</em></div></label>;
}
function Seg<K extends string>({ items, value, onChange }: { items: [K, string][]; value: K; onChange: (v: K) => void }) {
  const t = useT();
  return <div className="cx-f"><div className="seg">{items.map(([k, label]) => <button key={k} className={k === value ? "on" : ""} onClick={() => onChange(k)}>{t(label)}</button>)}</div></div>;
}
function Verdict({ tone, title, text }: { tone?: string; title: string; text?: string }) { const t = useT(); return <p className={"vline" + (tone ? " v-" + tone : "")}>{title && <b>{t(title)}</b>}{text && t(text)}</p>; }
function Rows({ rows }: { rows: [string, string][] }) { const t = useT(); return <div className="list">{rows.map(([a, b]) => <div className="li" key={a}><span>{t(a)}</span><b>{t(b)}</b></div>)}</div>; }
function CtaBtn({ c }: { c: Cta }) { const t = useT(); return !c ? null : c.href ? <Link className={"btn" + (c.secondary ? " sec" : "")} href={c.href}>{t(c.label)}</Link> : <button className={"btn" + (c.secondary ? " sec" : "")} onClick={c.onClick}>{t(c.label)}</button>; }

function Kredit({ cta }: { cta: Cta }) { const t = useT();
  const [S, setS] = useState("34 000 000"), [R, setR] = useState("24"), [N, setN] = useState("24"), [type, setType] = useState<PayType>("annuity");
  const [P, setP] = useState("6 000 000"), [G, setG] = useState("0"), [F, setF] = useState("0"), [sch, setSch] = useState(false);
  const s = parseNum(S), r = parseNum(R), n = parseNum(N), pr = parseNum(P);
  const c = s > 0 ? credit(s, r, n, type, parseNum(G), parseNum(F)) : null;
  let v: { tone?: string; title: string; text?: string } = { title: "" };
  if (c) {
    const g = Math.round(parseNum(G)), extra = type === "diff" ? " " + t("Oxirgisi — {x}.", { x: fmt(roundK(c.last)) }) : g ? " " + t("Birinchi {g} oy — faqat foiz.", { g }) : "";
    if (!pr) v = { title: tk("Foyda kiritilmagan"), text: t("Foydangizni yozing — xavfni baholaymiz.") + extra };
    else { const k = creditRisk(c.max, pr), p = Math.round(k.share * 100);
      v = k.risk === "ok" ? { tone: "ok", title: tk("Xavfsiz"), text: t("Eng katta toʻlov — foydaning {p}%.", { p }) + extra }
        : k.risk === "w" ? { tone: "w", title: tk("Ehtiyot boʻling"), text: t("Eng katta toʻlov — foydaning {p}%. Qoida: 30% dan oshmasin.", { p }) + extra }
          : { tone: "e", title: tk("Xavfli"), text: t("Eng katta toʻlov — foydaning {p}%. Summani kamaytiring yoki muddatni uzaytiring.", { p }) }; }
  }
  return <section className="cx-p on"><div className="cx-b">
    <Field label={t("Summa")} value={S} onChange={setS} unit="soʻm" />
    <div className="cx-2"><Field label={t("Yillik stavka")} value={R} onChange={setR} unit="%" money={false} /><Field label={t("Muddat")} value={N} onChange={setN} unit="oy" /></div>
    <Seg items={[["annuity", tk("Teng toʻlov")], ["diff", tk("Kamayib boruvchi")]]} value={type} onChange={setType} />
    <Field label={t("Oylik foyda")} value={P} onChange={setP} unit="soʻm" />
    <details className="cx-more"><summary>{t("Imtiyoz va komissiya")}</summary><div className="cx-2"><Field label={t("Imtiyozli davr")} value={G} onChange={setG} unit="oy" /><Field label={t("Komissiya")} value={F} onChange={setF} unit="%" money={false} /></div></details>
  </div><div className="cx-b cx-r">
    <p className="cx-l">{t(type === "annuity" ? tk("Oylik toʻlov") : tk("Birinchi toʻlov"))}</p><p className="cx-n">{c ? fmt(roundK(c.first)) : "0"} <small>{t("soʻm")}</small></p>
    <Verdict {...v} />
    {c && <Rows rows={[[tk("Jami qaytarasiz"), fmt(roundK(c.total))], [c.fee ? tk("Foiz va komissiya") : tk("Foizlar"), fmt(roundK(c.interest + c.fee))]]} />}
    {c && <details className="cx-more" open={sch} onToggle={e => setSch((e.target as HTMLDetailsElement).open)}><summary>{t("Toʻlov jadvali")}</summary>
      {sch && <div className="cx-tb"><table><thead><tr><th>{t("Oy")}</th><th>{t("Toʻlov")}</th><th>{t("Foiz")}</th><th>{t("Qoldiq")}</th></tr></thead><tbody>{c.rows.map(x => <tr key={x.month}><td>{x.month}</td><td>{fmt(x.pay)}</td><td>{fmt(x.interest)}</td><td>{fmt(x.balance)}</td></tr>)}</tbody></table></div>}</details>}
    <CtaBtn c={cta} />
  </div></section>;
}

function Soliq({ cta }: { cta: Cta }) { const t = useT();
  const [mode, setMode] = useState<"ayl" | "q6" | "q12">("ayl"), [st, setSt] = useState<Status>("yatt");
  const [T, setT] = useState("50 000 000"), [Y, setY] = useState("540 000 000"), [Q1, setQ1] = useState("50 000 000"), [Q2, setQ2] = useState("32 000 000"), [Q3, setQ3] = useState("12 000 000");
  const [own, setOwn] = useState(""), [pt, setPt] = useState(String(PROFIT_TAX));
  const reset = () => setOwn("");
  let tax = 0, rows: [string, string][] = [], v: { tone?: string; title: string; text?: string };
  if (mode === "ayl") {
    const m = parseNum(T), rule = turnoverRate(st, parseNum(Y) + m), r = own ? parseNum(own) : rule.rate;
    tax = (m * r) / 100;
    v = own ? { title: tk("Oʻz stavkangiz"), text: t("Qonun boʻyicha: {r}%.", { r: rule.rate }) } : { tone: rule.tone, title: rule.title, text: rule.text };
    rows = [[tk("Stavka"), pct(r)], [tk("Yiliga, taxminan"), fmt(tax * 12)], ...(rule.nextLimit ? [[tk("Keyingi chegara"), t(rule.nextLimit) + " " + t("soʻm")] as [string, string]] : [])];
  } else if (mode === "q6") {
    const r = own ? parseNum(own) : VAT_SIMPLIFIED; tax = (parseNum(Q1) * r) / 100;
    v = { title: tk("Soddalashtirilgan QQS"), text: tk("Savdo, ovqatlanish, xizmatlar. Foyda soligʻisiz, 2030-yilgacha.") };
    rows = [[tk("Aylanmadan"), pct(r)], [tk("Foyda soligʻi"), "0%"], [tk("Yiliga, taxminan"), fmt(tax * 12)]];
  } else {
    const x = vatAndProfit(parseNum(Q1), parseNum(Q2), parseNum(Q3), own ? parseNum(own) : VAT, parseNum(pt)); tax = x.total;
    v = { tone: x.profit < 0 ? "w" : "", title: x.profit < 0 ? tk("Zarar — foyda soligʻi yoʻq") : tk("QQS va foyda soligʻi"), text: tk("Xarid QQSi hisob-faktura boʻlsa chegiriladi.") };
    rows = [[tk("QQS"), fmt(x.vatDue)], [tk("Foyda soligʻi"), fmt(x.profitDue)], [tk("Yiliga, taxminan"), fmt(tax * 12)]];
  }
  const defRate = mode === "ayl" ? turnoverRate(st, parseNum(Y) + parseNum(T)).rate : mode === "q6" ? VAT_SIMPLIFIED : VAT;
  return <section className="cx-p on"><div className="cx-b">
    <Seg items={[["ayl", tk("Aylanmadan")], ["q6", tk("QQS 6%")], ["q12", tk("QQS 12%")]]} value={mode} onChange={m => { setMode(m); reset(); }} />
    {mode === "ayl" ? <>
      <Seg items={[["yatt", tk("YaTT")], ["oob", tk("Oʻzini oʻzi band")], ["mchj", tk("MChJ")]]} value={st} onChange={x => { setSt(x); reset(); }} />
      <Field label={t("Oylik aylanma")} value={T} onChange={setT} unit="soʻm" /><Field label={t("Yil boshidan aylanma")} value={Y} onChange={setY} unit="soʻm" />
    </> : <>
      <Field label={t("Oylik sotuv, QQS bilan")} value={Q1} onChange={setQ1} unit="soʻm" />
      {mode === "q12" && <><Field label={t("Oylik xarid, QQS bilan")} value={Q2} onChange={setQ2} unit="soʻm" /><Field label={t("Boshqa xarajatlar")} value={Q3} onChange={setQ3} unit="soʻm" /></>}
    </>}
    <details className="cx-more"><summary>{t("Stavkani oʻzgartirish")}</summary><div className="cx-2">
      <Field label={mode === "ayl" ? tk("Aylanma soligʻi") : tk("QQS")} value={own || String(defRate)} onChange={setOwn} unit="%" money={false} />
      {mode === "q12" && <Field label={t("Foyda soligʻi")} value={pt} onChange={setPt} unit="%" money={false} />}</div></details>
  </div><div className="cx-b cx-r">
    <p className="cx-l">{t("Oylik soliq")}</p><p className="cx-n">{fmt(tax)} <small>{t("soʻm")}</small></p><Verdict {...v} /><Rows rows={rows} />
    <CtaBtn c={cta} />
  </div></section>;
}

function Zarar({ cta }: { cta: Cta }) { const t = useT();
  const [u, setU] = useState<"kg" | "dona" | "xizmat">("kg");
  const [F, setF] = useState("12 000 000"), [Pp, setPp] = useState("70 000"), [Cc, setCc] = useState("45 000"), [G, setG] = useState("6 000 000"), [D, setD] = useState("26");
  const un = u === "xizmat" ? "ta" : u, d = Math.max(1, parseNum(D)), g = parseNum(G), b = breakEven(parseNum(F), parseNum(Pp), parseNum(Cc), g);
  return <section className="cx-p on"><div className="cx-b">
    <Seg items={[["kg", "kg"], ["dona", "dona"], ["xizmat", "xizmat"]]} value={u} onChange={setU} />
    <Field label={t("Oylik doimiy xarajatlar")} value={F} onChange={setF} unit="soʻm" />
    <div className="cx-2"><Field label={t("Sotish narxi")} value={Pp} onChange={setPp} unit="soʻm" /><Field label={t("Tannarx")} value={Cc} onChange={setCc} unit="soʻm" /></div>
    <details className="cx-more"><summary>{t("Maqsadli foyda")}</summary><div className="cx-2"><Field label={t("Foyda, oyiga")} value={G} onChange={setG} unit="soʻm" /><Field label={t("Ish kunlari")} value={D} onChange={setD} unit="kun" /></div></details>
  </div><div className="cx-b cx-r">
    <p className="cx-l">{t("Oyiga kamida sotish kerak")}</p><p className="cx-n">{b ? fmt(b.units) : "—"} <small>{t(un)}</small></p>
    {b ? <><Verdict title={t("Kuniga ~{n} {u}", { n: fmt(Math.ceil(b.units / d)), u: t(un) })} text={t("{d} ish kuni hisobida. Undan ortigʻi — foyda.", { d: fmt(d) })} />
      <Rows rows={[[tk("Bu — aylanma"), fmt(b.turnover)], [tk("Har birlikdan qoladi"), fmt(b.margin)], ...(g ? [[t("Foyda {g} uchun", { g: fmt(g) }), `${fmt(b.unitsForGoal)} ${t(un)}`] as [string, string]] : [])]} /></>
      : <Verdict tone="e" title={t("Har sotuvda zarar")} text="Sotish narxi tannarxdan yuqori boʻlishi kerak." />}
    <CtaBtn c={cta} />
  </div></section>;
}

function Narx({ cta }: { cta: Cta }) { const t = useT();
  const [mode, setMode] = useState<PriceMode>("markup"), [C, setC] = useState("45 000"), [X, setX] = useState("56"), [Dd, setDd] = useState("0");
  const def: Record<PriceMode, string> = { markup: "56", price: "70 200", margin: "36" };
  const c = parseNum(C), x = parseNum(X), d = parseNum(Dd), p = priceFrom(mode, c, x);
  const pf = p === null ? null : p * (1 - d / 100), pr = pf === null ? 0 : pf - c, mu = pf ? markupOf(c, pf) : 0, mg = pf ? marginOf(c, pf) : 0;
  return <section className="cx-p on"><div className="cx-b">
    <Seg items={[["markup", tk("Ustamadan")], ["price", tk("Narxdan")], ["margin", tk("Marjadan")]]} value={mode} onChange={m => { setMode(m); setX(def[m]); }} />
    <Field label={t("Tannarx, 1 birlik")} value={C} onChange={setC} unit="soʻm" />
    <Field label={mode === "markup" ? tk("Ustama") : mode === "price" ? tk("Sotish narxi") : tk("Kerakli marja")} value={X} onChange={setX} unit={mode === "price" ? tk("soʻm") : "%"} money={mode === "price"} />
    <details className="cx-more"><summary>{t("Chegirma")}</summary><Field label={t("Xaridorga chegirma")} value={Dd} onChange={setDd} unit="%" money={false} /></details>
  </div><div className="cx-b cx-r">
    <p className="cx-l">{t(d ? tk("Chegirmadan keyin") : tk("Sotish narxi"))}</p><p className="cx-n">{pf === null ? "—" : fmt(Math.round(pf / 100) * 100)} <small>{t("soʻm")}</small></p>
    {pf === null ? <Verdict tone="e" title={t("Marja 100% dan kam boʻladi")} text="Marja — narxdagi foyda ulushi." />
      : pr < 0 ? <Verdict tone="e" title={t("Zararga sotyapsiz")} text="Narx tannarxdan past." />
        : mode === "margin" ? <Verdict title={t("Ustama {x}", { x: pct(mu) })} text={t("Marja {x} uchun tannarxga shuncha qoʻshing.", { x: pct(mg) })} />
          : <Verdict title={t("Marja {x}", { x: pct(mg) })} text={t("Ustama {a}, lekin narxdagi foyda {b}. Ustama ≠ marja.", { a: pct(mu), b: pct(mg) })} />}
    {pf !== null && <Rows rows={[[tk("Har birlikdan foyda"), fmt(pr)], ...(d && p ? [[tk("Chegirma narxi"), fmt((p * d) / 100)] as [string, string]] : [])]} />}
    <CtaBtn c={cta} />
  </div></section>;
}

/** Four calculators. "pub" shows sign-up CTAs; "app" passes in-cabinet actions. */
export function Calculators({ variant, tab, onTab, ctas }: { variant: Variant; tab: CalcTab; onTab: (t: CalcTab) => void; ctas?: Partial<Record<CalcTab, Cta>> }) {
  const t = useT();
  const pub: Cta = { label: tk("Roʻyxatdan oʻtib saqlash"), href: "/kirish?register=1" };
  const c = (k: CalcTab) => (ctas && k in ctas ? ctas[k] ?? null : variant === "pub" ? pub : null);
  return <div className="cx">
    <div className="cx-tabs" role="tablist">{TABS.map(([k, label]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => onTab(k)}>{t(label)}</button>)}</div>
    {tab === "kredit" && <Kredit cta={c("kredit")} />}
    {tab === "soliq" && <Soliq cta={c("soliq")} />}
    {tab === "zarar" && <Zarar cta={c("zarar")} />}
    {tab === "narx" && <Narx cta={c("narx")} />}
  </div>;
}

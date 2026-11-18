"use client";
import { useEffect, useState } from "react";
import { useRouter, useT, tk, useMln } from "@/components/I18n";
import { fmt, formatInput, roundK } from "@/lib/format";
import { annuity } from "@/lib/finance";
import { HISTORY, USER } from "@/lib/demo";
import { GOALS, payback, planProfit, type Plan } from "@/lib/plan";
import { VOICE } from "@/lib/cabinet";
import type { OpKind } from "@/lib/ledger";
import { useStore } from "./Store";

const today = () => new Date().toLocaleDateString("ru-RU");
const print = () => { try { window.print(); } catch { /* blocked in some viewers */ } };

export function WhySheet() { const t = useT();
  const { view: v, ledger: l, closeSheet } = useStore();
  return <>
    <h4>{t("Nega")} {fmt(v.free)}?</h4>
    <p className="note" style={{ margin: "0 0 8px" }}>{t("Sizning raqamlaringiz bilan:")}</p>
    <div className="calc">
      <div><span>{t("Pul hozir")}</span><span>{fmt(v.cash)}</span></div>
      <div><span>− {t("Toʻlovlar (30 kun)")}<small style={{ display: "block", color: "var(--mut)", fontSize: 13 }}>{t("ijara")} {fmt(l.money.rent)} · {t("taʼminotchi")} {fmt(l.money.supplier)} · {t("soliq")} {fmt(v.tax)}</small></span><span>{fmt(v.obligations)}</span></div>
      <div><span>{t("− Zaxira")}</span><span>{fmt(v.reserve)}</span></div>
      <div className="t"><span>{t("Sarflash mumkin")}</span><span>{fmt(v.free)}</span></div>
    </div>
    <div className="learn"><b>{t("Bilib qoʻying:")}</b> {t("zaxira — kutilmagan xarajat uchun pul. Uni «Men → Biznes»da oʻzgartirasiz.")}</div>
    <button className="btn sec w" style={{ marginTop: 12 }} onClick={closeSheet}>{t("Tushunarli")}</button>
  </>;
}

function DocActions() { const t = useT();
  const { closeSheet } = useStore();
  return <>
    <div className="vb" style={{ marginTop: 12 }}><button className="btn sec" onClick={closeSheet}>{t("Yopish")}</button><button className="btn" onClick={print}>{t("PDF saqlash")}</button></div>
    <p className="note" style={{ margin: "8px 0 0" }}>{t("«PDF saqlash» — chop etish oynasida «PDF sifatida saqlash»ni tanlang.")}</p>
  </>;
}

export function BankReport() { const t = useT(), mln = useMln();
  const { view: v, ledger: l } = useStore();
  const M = [...HISTORY.map(h => [h.month, h.income, h.expenses] as const), [t("Noyabr*"), l.money.income, v.expenses] as const];
  const avg = roundK(M.reduce((s, m) => s + m[1] - m[2], 0) / 3), L = 34e6, p = annuity(L, 24, 0.02);
  return <>
    <div className="doc">
      <h5>{t("Moliyaviy hisobot · bank uchun")}</h5>
      <p className="m">{t(USER.full)} · {t(USER.status)} · {t("quruq mevalar")}, {t(USER.place)} · {today()}</p>
      <table><thead><tr><th>{t("Oy")}</th><th>{t("Daromad")}</th><th>{t("Xarajat")}</th><th>{t("Foyda")}</th></tr></thead>
        <tbody>{M.map(m => <tr key={m[0]}><td>{m[0]}</td><td>{mln(m[1])}</td><td>{mln(m[2])}</td><td>{mln(m[1] - m[2])}</td></tr>)}</tbody></table>
      {[[t("Oʻrtacha oylik foyda"), fmt(avg)], [t("Soliq qarzi"), t("yoʻq")], [t("Sizga qarz (nasiya)"), fmt(v.owedToMe)], [t("Taʼminotchiga qarz"), fmt(l.money.supplier)], [t("Soʻralayotgan kredit"), t("{p0} · 24 oy", { p0: fmt(L) })], [t("Oylik toʻlov (24% namuna)"), t("~{p0} · foydaning {p1}%", { p0: fmt(roundK(p)), p1: Math.round((p / avg) * 100) })]].map(([a, b]) => <div className="kv2" key={a}><span>{a}</span><b>{b}</b></div>)}
      <p className="ft">{t("* noyabr — 18-noyabr holatiga. Consul yozuvlari asosida; bank oʻz tekshiruvini oʻtkazadi.")}</p>
    </div>
    <DocActions />
  </>;
}

export function PlanReport() { const t = useT();
  const { plan: p } = useStore(), x = planProfit(p), m = payback(p), r = payback(p, 0.8);
  return <>
    <div className="doc">
      <h5>{t("Biznes-reja ·")} {p.title}</h5><p className="m">{USER.full} · {USER.status} · {today()}</p>
      {[[t("Kerakli kapital"), fmt(p.capital)], [t("Qoʻshimcha sotuv / oy"), fmt(p.sales)], [t("Xarid (tannarx {p0}%)", { p0: Math.round(p.cogs * 100) }), "−" + fmt(p.sales * p.cogs)], [t("Ijara"), p.rent ? "−" + fmt(p.rent) : "0"], [t("Yordamchi"), p.helper ? "−" + fmt(p.helper) : "0"], [t("Foyda / oy"), fmt(x)], [t("Oʻzini oqlash"), m ? m + " " + t("oy") : "—"], [t("Savdo 20% kam boʻlsa"), r ? r + " " + t("oy") : "—"]].map(([a, b]) => <div className="kv2" key={a}><span>{a}</span><b>{b}</b></div>)}
      <p className="ft">{t("Hisob-kitob kalkulyator bilan; taxminlar belgilangan. Consul yozuvlari asosida.")}</p>
    </div>
    <DocActions />
  </>;
}

export function PlanWizard({ fresh }: { fresh?: boolean }) { const t = useT();
  const s = useStore(), router = useRouter();
  const [p, setP] = useState<Plan>(fresh ? { ...s.plan, ...GOALS.rasta, title: t("Ikkinchi rasta · Chorsu") } : s.plan);
  const [st, setSt] = useState(0);
  const [err, setErr] = useState("");
  const inp = (k: "capital" | "sales" | "rent" | "helper", label: string, hint?: string) => (
    <label><span>{label} {hint && <small>· {hint}</small>}</span>
      <input inputMode="numeric" value={fmt(p[k])} onChange={e => setP({ ...p, [k]: +e.target.value.replace(/\D/g, "") || 0, ...(k === "rent" || k === "helper" ? { estimated: false } : {}) })} /></label>);
  const next = () => {
    if (st === 1 && (!p.capital || !p.sales)) return setErr(t("Ikkala raqamni kiriting"));
    setErr("");
    if (st === 3) { s.setPlan(p); s.closeSheet(); router.push("/app/reja"); const m = payback(p); s.showToast({ main: t("Reja saqlandi"), sub: `${p.title} · ${m ? m + t(" oyda oʻzini oqlaydi") : t("oʻzini oqlamaydi")}` }); return; }
    setSt(st + 1);
  };
  const m = payback(p), r = payback(p, 0.8);
  return <div className="wz">
    <div className="dots">{[0, 1, 2, 3].map(i => <i key={i} className={i <= st ? "on" : ""} />)}</div>
    {st === 0 && <><h4>{t("Nima qilmoqchisiz?")}</h4><div className="opts">{Object.values(GOALS).map(g => <button key={g.goal} className={p.goal === g.goal ? "on" : ""} onClick={() => setP({ ...p, ...g, title: g.title + t(" · Chorsu"), estimated: true })}>{g.title}</button>)}</div></>}
    {st === 1 && <><h4>{t("Pul va savdo")}</h4>{inp("capital", t("Qancha pul kerak"))}{inp("sales", t("Qoʻshimcha sotuv, oyiga"), "taxminan")}</>}
    {st === 2 && <><h4>{t("Yangi xarajatlar, oyiga")}</h4>{inp("rent", t("Ijara"), t("boʻlmasa 0"))}{inp("helper", t("Yordamchi maoshi"), t("boʻlmasa 0"))}</>}
    {st === 3 && <><h4>{m ? t("{p0} oyda oʻzini oqlaydi", { p0: m }) : t("Hozircha oʻzini oqlamaydi")}</h4>
      <div className="list" style={{ background: "none", padding: 0 }}><div className="li"><span>{t("Foyda / oy")}</span><b className="num">{fmt(planProfit(p))}</b></div><div className="li"><span>{t("Savdo 20% kam boʻlsa")}</span><b className="num">{r ? r + " oy" : "—"}</b></div></div>
      <p className="note" style={{ margin: "8px 0" }}>{t("Tannarx {p0}% — sotuvlaringiz tarixidan. Hisobni kalkulyator qiladi.", { p0: Math.round(p.cogs * 100) })}</p></>}
    {err && <p className="note" style={{ color: "var(--err)" }}>{err}</p>}
    <div className="nav2"><button className="btn sec" onClick={() => (st ? setSt(st - 1) : s.closeSheet())}>{st ? t("Orqaga") : t("Bekor")}</button><button className="btn" onClick={next}>{st === 3 ? t("Saqlash") : t("Davom etish")}</button></div>
  </div>;
}

export function ChooseKind({ text, amount }: { text: string; amount: number }) { const t = useT();
  const s = useStore();
  const K: [OpKind, string, string][] = [["sale", t("Sotuv"), t("pul kirdi")], ["buy", t("Tovar xaridi"), t("pul chiqdi")], ["exp", t("Boshqa xarajat"), t("ijara, svet, maosh")], ["nas", t("Nasiya"), t("pul keyin keladi")]];
  return <>
    <h4>{fmt(amount)} — bu nima?</h4><p className="note" style={{ margin: "0 0 10px" }}>{t("«")}{text}»</p>
    <div className="pick">{K.map(([k, a, b]) => <button key={k} onClick={() => { s.closeSheet(); s.applyFixed(k, text, amount); }}>{a}<small>{b}</small></button>)}</div>
  </>;
}

export function BigConfirm({ text, amount }: { text: string; amount: number }) { const t = useT();
  const s = useStore();
  return <>
    <h4>{fmt(amount)} {t("soʻm")}?</h4><p className="sub1" style={{ margin: "0 0 12px" }}>{t("Summa juda katta. Toʻgʻrimi?")}</p>
    <div className="vb"><button className="btn sec" onClick={s.closeSheet}>{t("Yoʻq")}</button><button className="btn" onClick={() => { s.closeSheet(); s.forceAct(text); }}>{t("Ha, yozish")}</button></div>
  </>;
}

export function VoiceSheet() { const t = useT();
  const s = useStore(), ph = t(VOICE[s.route] || "Bugun qancha sarflasam boʻladi?");
  const [i, setI] = useState(0);
  useEffect(() => { const t = setTimeout(() => setI(n => Math.min(ph.length, n + 1)), i ? 45 : 700); return () => clearTimeout(t); }, [i, ph]);
  const done = i >= ph.length;
  return <div className="vc">
    <div className={"wv" + (done ? " st" : "")}>{Array.from({ length: 18 }, (_, k) => <i key={k} />)}</div>
    <p className="vl">{done ? t("Eshitdim:") : t("Tinglayapman…")}</p><p className="vt">{ph.slice(0, i)}</p>
    <p className="note" style={{ textAlign: "center", margin: "4px 0 12px" }}>{t("Demo: namunaviy ibora. Haqiqiy ovoz — VoiceLab orqali, oʻzbek va rus tilida.")}</p>
    {done && <div className="vb"><button className="btn sec" onClick={() => setI(0)}>{t("Qayta")}</button><button className="btn" onClick={() => { s.closeSheet(); s.handle(ph, { voice: true }); }}>{t("Yuborish")}</button></div>}
  </div>;
}

export function CameraSheet() { const t = useT();
  const s = useStore();
  const [st, setSt] = useState<0 | 1 | 2>(0);
  useEffect(() => { if (st === 1) { const t = setTimeout(() => setSt(2), 1600); return () => clearTimeout(t); } }, [st]);
  if (st === 2) return <>
    <h4>{t("Chekdan oʻqildi")}</h4>
    <div className="list rcl">
      <div className="li"><span>{t("Oʻrik qoqi")}<small>{t("50 kg × 46 000")}</small></span><b className="num">2 300 000</b></div>
      <div className="li"><span>{t("Mayiz")}<small>{t("20 kg × 37 000")}</small></span><b className="num">740 000</b></div>
      <div className="li"><span><strong>{t("Jami")}</strong><small>{t("Akmal aka · naqd")}</small></span><b className="num">3 040 000</b></div>
    </div>
    <p className="note" style={{ margin: "8px 0 12px" }}>{t("Qoqi narxi Chorsu medianasidan +2% — normal.")}</p>
    <div className="vb"><button className="btn sec" onClick={() => setSt(0)}>{t("Qayta")}</button><button className="btn" onClick={() => { s.closeSheet(); s.applyFixed("buy", "naqd", 3_040_000); }}>{t("Xarid deb yozish")}</button></div>
  </>;
  return <>
    <h4>{t("Chek yoki nakladnoy")}</h4>
    <div className={"vf" + (st === 1 ? " go" : "")}><div className="rc"><b>{t("AKMAL AKA · CHORSU")}</b><span>{t("Oʻrik qoqi 50 kg × 46 000")}</span><span>{t("Mayiz 20 kg × 37 000")}</span><span className="ln" /><span><b>{t("JAMI 3 040 000")}</b></span></div><i className="scan" /></div>
    <p className="note" style={{ margin: "8px 0 12px" }}>{t("Demo: namunaviy chek. Haqiqiy tanib olish — backend ulanganda.")}</p>
    <button className="btn w" disabled={st === 1} onClick={() => setSt(1)}>{st === 1 ? t("Oʻqiyapman…") : t("Suratga olish")}</button>
  </>;
}

export function SupportSheet() { const t = useT();
  const s = useStore();
  return <><h4>{t("Yordamga yozish")}</h4><textarea className="ta" placeholder={t("Muammoni qisqacha yozing…")} />
    <button className="btn w" style={{ marginTop: 10 }} onClick={() => { s.closeSheet(); s.showToast({ main: t("Yuborildi"), sub: t("Javob 1 ish kuni ichida — ilovada") }); }}>{t("Yuborish")}</button></>;
}

export function MoneyInput({ value, onChange, ...rest }: { value: number; onChange: (n: number) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return <input inputMode="numeric" value={value ? fmt(value) : ""} onChange={e => onChange(+formatInput(e.target.value).replace(/\D/g, "") || 0)} {...rest} />;
}

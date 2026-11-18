"use client";
import { Link, LangSwitch, useT } from "@/components/I18n";
import { useRouter } from "@/components/I18n";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Icons";
import { fmt } from "@/lib/format";

/** Demo SMS code. Production: the backend sends a real OTP (see backend plan). */
const DEMO_CODE = "481903";
type Mode = "login" | "reg";
type Tax = "ayl" | "qqs" | "rasm" | "bilm";

const phoneFmt = (d: string) => { d = d.slice(0, 9); return [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(" "); };

export default function AuthClient({ register = false }: { register?: boolean }) { const t = useT();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(register ? "reg" : "login");
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [err, setErr] = useState(""), [tries, setTries] = useState(5), [shake, setShake] = useState(false);
  const [timer, setTimer] = useState(60);
  const [biz, setBiz] = useState<string | null>(null), [where, setWhere] = useState<string | null>(null), [other, setOther] = useState("");
  const [tax, setTax] = useState<Tax | null>(null), [q1, setQ1] = useState<string | null>(null), [q2, setQ2] = useState<string | null>(null);
  const [terms, setTerms] = useState(false), [stats, setStats] = useState(true);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false), [offline, setOffline] = useState(false);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [refocus, setRefocus] = useState(0);
  useEffect(() => { if (refocus) codeRefs.current[0]?.focus(); }, [refocus]);

  useEffect(() => {
    const off = () => setOffline(true), on = () => setOffline(false);
    window.addEventListener("offline", off); window.addEventListener("online", on);
    return () => { window.removeEventListener("offline", off); window.removeEventListener("online", on); };
  }, []);
  useEffect(() => { if (step !== 1 || timer <= 0) return; const t = setTimeout(() => setTimer(x => x - 1), 1000); return () => clearTimeout(t); }, [step, timer]);

  /** Simulates a network call; waits while offline so nothing typed is lost. */
  const wait = (fn: () => void) => { setBusy(true); const go = () => { if (!navigator.onLine) { setOffline(true); setTimeout(go, 1500); return; } setOffline(false); setBusy(false); fn(); }; setTimeout(go, 650); };

  const taxResolved: Exclude<Tax, "bilm"> | null = tax === "bilm" ? (q1 && q2 ? (q2 === "n" ? "rasm" : q1 === "3" ? "qqs" : "ayl") : null) : tax;
  const dots = mode === "reg" ? [1, 1, 1, 2, 3, 4, 4, 4, 4, 4][step] : 0;

  const verify = (digits: string) => {
    if (digits !== DEMO_CODE) {
      const left = tries - 1; setTries(left); setShake(false); requestAnimationFrame(() => setShake(true));
      setErr(left > 0 ? t("Kod notoʻgʻri. Yana {p0} urinish qoldi.", { p0: left }) : t("Urinishlar tugadi. 10 daqiqadan keyin qayta urining."));
      setCode(["", "", "", "", "", ""]); setRefocus(n => n + 1); return;
    }
    wait(() => setStep(mode === "reg" ? 2 : 9));
  };
  const setDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1), next = code.map((x, k) => (k === i ? d : x));
    setCode(next); setErr(""); setShake(false);
    if (d && i < 5) codeRefs.current[i + 1]?.focus();
    if (next.every(Boolean)) verify(next.join(""));
  };
  const key = (k: string) => setAmount(a => (k === "⌫" ? a.slice(0, -1) : a.length < 12 ? (a + k).replace(/^0+/, "") : a));
  useEffect(() => {
    if (step !== 6) return;
    const h = (e: KeyboardEvent) => { if (/^\d$/.test(e.key)) key(e.key); if (e.key === "Backspace") key("⌫"); };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [step]);

  const btn = (label: string, disabled: boolean, onClick: () => void) =>
    <button className={"btn" + (busy ? " ld" : "")} disabled={disabled || busy} onClick={onClick}>{busy ? <span>{label}</span> : label}</button>;
  const back = (to: number) => <div className="links"><button className="lk mut" onClick={() => setStep(to)}>{t("Orqaga")}</button></div>;
  const a = +amount || 0;

  return <div className="auth">
    <div className="bg" />
    <div className={"off" + (offline ? " on" : "")}><i />{t("Internet yoʻq. Ulanishi bilan davom etamiz — kiritganingiz saqlanadi.")}</div>
    <div className="pg">
      <div className="top"><Link className="logo" href="/"><svg width="32" height="32" aria-hidden="true"><use href="#logo" /></svg>{t("Consul")}</Link><LangSwitch item="button" /></div>
      <div className="mid">
        <Link className="auth-mark" href="/" aria-label={t("Consul")}><Logo size={88} /></Link>
        <div className={"card" + (mode === "login" ? " glass-login" : "")}>
          <div className="dots">{[0, 1, 2, 3].map(i => <i key={i} className={i < dots ? "on" : ""} />)}</div>
          <div className="fade" key={step + mode}>
            {step === 0 && <>
              <h1>{mode === "reg" ? t("Roʻyxatdan oʻtish") : t("Kirish")}</h1><p className="sub">{t("Telefon raqamingizga SMS kod yuboramiz.")}</p>
              <label className="in"><span>+998</span><input inputMode="tel" autoComplete="tel" placeholder="90 123 45 67" value={phoneFmt(phone)} aria-label={t("Telefon raqami")}
                onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))} onKeyDown={e => { if (e.key === "Enter" && phone.length === 9) wait(() => { setStep(1); setTimer(60); }); }} /></label>
              {btn(t("Kodni olish"), phone.length < 9, () => wait(() => { setStep(1); setTimer(60); }))}
              <div className="links"><button className="lk mut" onClick={() => setMode(mode === "reg" ? "login" : "reg")}>{mode === "reg" ? t("Hisobim bor — kirish") : t("Roʻyxatdan oʻtish")}</button><Link className="lk" href="/app">{t("Demo bilan kirish")}</Link></div>
            </>}
            {step === 1 && <>
              <h1>{t("SMS kod")}</h1><p className="sub">{t("+998 {p} raqamiga yuborildi.", { p: phoneFmt(phone) })} <button className="lk" style={{ fontSize: 15 }} onClick={() => setStep(0)}>{t("Oʻzgartirish")}</button></p>
              <button className="sms" onClick={() => { setCode(DEMO_CODE.split("")); verify(DEMO_CODE); }}><span>💬</span><span>{t("SMS: Consul kodingiz")} <b>{DEMO_CODE}</b></span></button>
              <div className={"code" + (shake ? " err" : "")}>{code.map((c, i) => <input key={i} ref={el => { codeRefs.current[i] = el; }} inputMode="numeric" maxLength={1} autoComplete="one-time-code" value={c} disabled={tries <= 0} aria-label={t("Kod {n}-raqam", { n: i + 1 })}
                onChange={e => setDigit(i, e.target.value)} onKeyDown={e => { if (e.key === "Backspace" && !c && i > 0) codeRefs.current[i - 1]?.focus(); }}
                onPaste={e => { const d = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6); if (d.length === 6) { e.preventDefault(); setCode(d.split("")); verify(d); } }} />)}</div>
              <p className="em">{err}</p>
              {btn(t("Davom etish"), !code.every(Boolean) || tries <= 0, () => verify(code.join("")))}
              <div className="links"><button className="lk mut" disabled={timer > 0} onClick={() => setTimer(60)}>{timer > 0 ? t("Qayta yuborish · 0:{p0}", { p0: String(timer).padStart(2, "0") }) : t("Kodni qayta yuborish")}</button></div>
            </>}
            {step === 2 && <>
              <h1>{t("Biznesingiz")}</h1>
              <p className="lb">{t("Nima sotasiz?")}</p><div className="ch">{[t("Quruq mevalar"), t("Oziq-ovqat"), t("Kiyim"), t("Xizmat"), t("Boshqa")].map(x => <button key={x} className={biz === x ? "on" : ""} onClick={() => setBiz(x)}>{x}</button>)}</div>
              <p className="lb">{t("Qayerda?")}</p><div className="ch">{[t("Chorsu"), t("Oloy"), t("Parkent"), t("Qoʻyliq"), t("Onlayn"), t("Boshqa")].map(x => <button key={x} className={where === x ? "on" : ""} onClick={() => setWhere(x)}>{x}</button>)}</div>
              {(biz === "Boshqa" || where === "Boshqa") && <label className="in"><input placeholder={t("Qisqacha yozing: nima, qayerda")} aria-label={t("Boshqa")} value={other} onChange={e => setOther(e.target.value)} /></label>}
              {btn(t("Davom etish"), !biz || !where, () => setStep(3))}{back(0)}
            </>}
            {step === 3 && <>
              <h1>{t("Soliq rejimi")}</h1><p className="sub">{t("Bilmasangiz — Consul aniqlab beradi.")}</p>
              {([["ayl", t("Aylanmadan soliq"), t("YaTT yoki oʻzini oʻzi band · 1%, katta aylanmada 4%")], ["qqs", t("QQS va foyda soligʻi"), t("umumiy rejim · yiliga ~4,9 mlrd dan ortiq aylanma")], ["rasm", t("Hali roʻyxatdan oʻtmaganman"), t("Consul qanday oʻtishni koʻrsatadi")], ["bilm", t("Bilmayman"), t("2 ta savol bilan aniqlaymiz")]] as [Tax, string, string][]).map(([k, label, s]) =>
                <button key={k} className={"opt" + (tax === k ? " on" : "")} onClick={() => setTax(k)}>{label}<small>{s}</small></button>)}
              {tax === "bilm" && <>
                <p className="lb">{t("Yillik aylanma taxminan?")}</p><div className="ch">{[["1", t("1 mlrd gacha")], ["2", t("1–5 mlrd")], ["3", t("5 mlrd dan koʻp")]].map(([k, t]) => <button key={k} className={q1 === k ? "on" : ""} onClick={() => setQ1(k)}>{t}</button>)}</div>
                <p className="lb">{t("Soliq organida roʻyxatdan oʻtganmisiz?")}</p><div className="ch">{[["y", t("Ha")], ["n", t("Yoʻq")]].map(([k, t]) => <button key={k} className={q2 === k ? "on" : ""} onClick={() => setQ2(k)}>{t}</button>)}</div>
                {taxResolved && <p className="sub" style={{ margin: "4px 0 0" }}>{t("Sizga mos:")} <b>{{ ayl: t("aylanmadan soliq"), qqs: t("QQS va foyda soligʻi"), rasm: t("avval roʻyxatdan oʻtish") }[taxResolved]}</b>{t(". Keyin oʻzgartirish mumkin.")}</p>}
              </>}
              {btn(t("Davom etish"), !taxResolved, () => setStep(4))}{back(2)}
            </>}
            {step === 4 && <>
              <h1>{t("Rozilik")}</h1><div className="cons">{t("Maʼlumotlaringizni faqat siz koʻrasiz. Istalgan vaqtda yuklab olasiz yoki oʻchirasiz.")}</div>
              <div className={"ck" + (terms ? " on" : "")} role="checkbox" aria-checked={terms} tabIndex={0} onClick={e => { if (!(e.target as HTMLElement).closest("a")) setTerms(!terms); }} onKeyDown={e => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); setTerms(!terms); } }}>
                <i>{terms ? "✓" : ""}</i><span><Link href="/maxfiylik#rozilik" target="_blank">{t("Foydalanish shartlari")}</Link> {t("va")} <Link href="/maxfiylik#maxfiylik" target="_blank">{t("maxfiylik siyosati")}</Link>{t("ga roziman")}</span></div>
              <button className={"ck" + (stats ? " on" : "")} onClick={() => setStats(!stats)} aria-pressed={stats}><i>{stats ? "✓" : ""}</i><span>{t("Anonim statistika")} <small>{t("ixtiyoriy · ismsiz umumiy raqamlar Savdo-sanoat palatasi hisobotiga. Istalgan vaqtda oʻchirasiz.")}</small></span></button>
              {btn(t("Davom etish"), !terms, () => setStep(5))}{back(3)}
            </>}
            {step === 5 && <>
              <h1>{t("Hozir qancha pulingiz bor?")}</h1><p className="sub">{t("Naqd va karta birga. Taxminan boʻlsa ham boʻladi.")}</p>
              <p className="big">{a ? fmt(a) : "0"} <small>{t("soʻm")}</small></p>
              <div className="kp">{["1", "2", "3", "4", "5", "6", "7", "8", "9", "000", "0", "⌫"].map(k => <button key={k} onClick={() => key(k)}>{k}</button>)}</div>
              {btn(t("Tayyor"), !a, () => setStep(7))}
              <div className="links"><button className="lk mut" onClick={() => setStep(4)}>{t("Orqaga")}</button><button className="lk mut" onClick={() => setStep(8)}>{t("Keyinroq")}</button></div>
            </>}
            {(step === 7 || step === 8) && <>
              <h1>{t("Tayyor")}</h1>
              {step === 7 ? <><p className="sub">{t("Hozircha: pulingiz")} <b>{fmt(a)}</b>{t(". Ijara, qarz va soliqlarni aytsangiz, Consul «sarflash mumkin»ni hisoblaydi.")}</p>
                <div className="res"><div><span>{t("Pul hozir")}</span><span>{fmt(a)}</span></div><div><span>{t("− Zaxira, 10%")}</span><span>{fmt(Math.round((a * 0.1) / 1000) * 1000)}</span></div><div><span>{t("Toʻlovlar")}</span><span>{t("keyin qoʻshasiz")}</span></div></div></>
                : <p className="sub">{t("Pul miqdorini keyin «Bugun» sahifasida aytasiz.")}</p>}
              <button className="btn" onClick={() => router.push("/app")}>{t("Panelga oʻtish")}</button>
              <div className="links"><span className="lk mut" style={{ textDecoration: "none" }}>{t("Anonim statistika:")} {stats ? "yoqilgan" : t("oʻchirilgan")}</span></div>
            </>}
            {step === 9 && <>
              <h1>{t("Xush kelibsiz, Dilnoza")}</h1><p className="sub">{t("Bugun sarflash mumkin:")}</p><p className="big">4 200 000 <small>{t("soʻm")}</small></p>
              <button className="btn" onClick={() => router.push("/app")}>{t("Panelga oʻtish")}</button>
            </>}
          </div>
        </div>
      </div>
      <div className="auth-metrics">
    <div className="fc f1">{t("Sarflash mumkin")}<b>4 200 000</b></div>
    <div className="fc f2">{t("Aylanma soligʻi")}<b>1%</b></div>
    <div className="fc f3">{t("Xavfsiz kredit")}<b className="g">{t("34 mln gacha")}</b></div>
    <div className="fc f4">{t("Oʻrik qoqi · Oloy")}<b className="r">−3%</b></div>
      </div>
      <div className="ft"><Link href="/maxfiylik">{t("Maʼlumot")}</Link></div>
    </div>
  </div>;
}

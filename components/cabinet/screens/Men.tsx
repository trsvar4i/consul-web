"use client";
import { Link, LangSwitch, useT, useTP, tk } from "@/components/I18n";
import { useRouter } from "@/components/I18n";
import { useState, type ReactNode } from "react";
import { fmt } from "@/lib/format";
import { USER } from "@/lib/demo";
import { Icon } from "@/components/Icons";
import { useStore } from "../Store";
import { SupportSheet } from "../Sheets";

const Tg = ({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) =>
  <button className={"tg" + (on ? " on" : "")} aria-pressed={on} aria-label={label} onClick={() => onChange(!on)} />;
function Seg({ items, value, onChange }: { items: string[]; value: string; onChange: (v: string) => void }) {
  return <span className="seg mini">{items.map(x => <button key={x} className={x === value ? "on" : ""} onClick={() => onChange(x)}>{x}</button>)}</span>;
}

function downloadCsv(rows: (string | number)[][], name: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["﻿" + rows.map(r => r.join(";")).join("\n")], { type: "text/csv" }));
  a.download = name; document.body.appendChild(a); a.click(); a.remove();
}

const NAV: [string, ReactNode, string, (t: ReturnType<typeof useT>, n: number) => string][] = [
  ["biznes", <Icon id="i-mkt" key="i" />, tk("Biznes"), (t: ReturnType<typeof useT>) => t("maqom, soliq, zaxira")],
  ["xotira", <svg width="20" height="20" key="i"><use href="#sq" /></svg>, tk("Consul xotirasi"), (t, n) => t("{p0} ta fakt", { p0: n })],
  ["sozlama", <svg key="i" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" /></svg>, tk("Sozlamalar"), (t: ReturnType<typeof useT>) => t("til, shrift, ovoz, eslatmalar")],
  ["maxfiy", <svg key="i" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>, tk("Maxfiylik"), (t: ReturnType<typeof useT>) => t("rozilik, maʼlumotlar")],
  ["yordam", <svg key="i" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.7M12 17h0" /></svg>, tk("Yordam"), () => ""],
];

export default function Men({ sub }: { sub?: string }) { const t = useT(), tp = useTP();
  const s = useStore(), router = useRouter(), l = s.ledger;
  const [remember, setRemember] = useState(true);
  const [voice, setVoice] = useState(true), [speed, setSpeed] = useState(t("Oddiy"));
  const [taxR, setTaxR] = useState(true), [nasR, setNasR] = useState(true), [where, setWhere] = useState(t("Ilova"));
  const cur = sub || "biznes";
  const back = <Link className="back pb" href="/app/men">{t("← Men")}</Link>;
  const editMem = (i: number) => {
    let val = l.memory[i][1];
    s.openSheet(<><h4>{tp(l.memory[i][0])}</h4><input className="in2" defaultValue={val} onChange={e => (val = e.target.value)} aria-label={tp(l.memory[i][0])} />
      <button className="btn w" style={{ marginTop: 12 }} onClick={() => { s.setMemory(l.memory.map((m, k) => (k === i ? [m[0], val] : m))); s.closeSheet(); }}>{t("Saqlash")}</button></>);
  };
  const confirm = (title: string, text: string, ok: string, run: () => void) => s.openSheet(<><h4>{title}</h4><p style={{ fontSize: 15, lineHeight: 1.5, margin: "0 0 12px" }}>{text}</p>
    <button className="btn w" style={{ background: "var(--err)" }} onClick={() => { s.closeSheet(); run(); }}>{ok}</button><button className="btn sec w" style={{ marginTop: 8 }} onClick={s.closeSheet}>{t("Bekor qilish")}</button></>);

  return <section className="scr on" id="s-men"><div className="pw2">
    <aside className="pnav">
      <div className="phead"><span className="av big">D</span><div><p className="pn">{USER.full}</p><p className="pd">{t(USER.trade)} · {t(USER.place)} · {t(USER.status)}</p></div></div>
      <div className="list">{NAV.map(([k, ic, label, d]) => <Link key={k} className={"li" + (sub === k || (!sub && k === "biznes") ? " on" : "")} href={"/app/men/" + k}><span className="ti2">{ic}</span><span className="lt">{t(label)}{d(t, l.memory.length) && <small>{d(t, l.memory.length)}</small>}</span><i className="chev">›</i></Link>)}</div>
      <Link className="lnk2 out" href="/kirish">{t("Chiqish")}</Link>
    </aside>
    <div className="pbody">
      {cur === "biznes" && <div className="pp" style={{ display: "block" }}>{back}<h3 className="ph">{t("Biznes")}</h3>
        <div className="list">
          <div className="li"><span>{t("Nima sotasiz")}</span><b className="v">{t(USER.trade)}</b></div>
          <div className="li"><span>{t("Qayerda")}</span><b className="v">{t(USER.place)}</b></div>
          <div className="li"><span>{t("Maqom")}</span><b className="v">{t(USER.status)}</b></div>
          <div className="li"><span>{t("Soliq")}<small>{t("aylanmadan, yillik 1 mlrd gacha")}</small></span><b className="v">1%</b></div>
          <div className="li"><span>{t("Zaxira")}<small>{t("kutilmagan xarajat uchun · tavsiya: pulning ~10%")}</small></span><span className="stp"><button onClick={() => s.setReserve(l.money.reserve - 100_000)} aria-label={t("Kamaytirish")}>−</button><b className="num">{fmt(l.money.reserve)}</b><button onClick={() => s.setReserve(l.money.reserve + 100_000)} aria-label={t("Oshirish")}>+</button></span></div>
        </div><p className="note">{t("Bu raqamlar barcha hisob-kitoblarga taʼsir qiladi.")}</p></div>}
      {cur === "xotira" && <div className="pp" style={{ display: "block" }}>{back}<h3 className="ph">{t("Consul xotirasi")}</h3>
        <p className="plead">{t("Consul suhbatlardan eslab qolgan narsalar. Notoʻgʻri boʻlsa — tuzating yoki oʻchiring.")}</p>
        <div className="list"><div className="li"><span>{t("Suhbatlardan eslab qolish")}</span><Tg on={remember} onChange={setRemember} label={t("Eslab qolish")} /></div></div>
        <p className="bh">{t("Eslab qolgan")}</p>
        <div className="list">{l.memory.length === 0 ? <div className="li"><span>{t("Hech narsa eslab qolinmagan")}</span></div> :
          l.memory.map((m, i) => <div className="li mem" key={m[0] + i}><span>{tp(m[0])}<small>{tp(m[1])}</small></span><span className="act"><button onClick={() => editMem(i)}>{t("Tuzatish")}</button><button onClick={() => s.setMemory(l.memory.filter((_, k) => k !== i))}>{t("Unutish")}</button></span></div>)}</div>
        {l.memory.length > 0 && <button className="lnk2 dng" onClick={() => confirm(t("Hammasini unutish?"), t("Consul eslab qolgan {p0} ta faktni unutadi. Operatsiyalaringiz oʻchmaydi.", { p0: l.memory.length }), t("Ha, unutish"), () => s.setMemory([]))}>{t("Hammasini unutish")}</button>}
      </div>}
      {cur === "sozlama" && <div className="pp" style={{ display: "block" }}>{back}<h3 className="ph">{t("Sozlamalar")}</h3>
        <p className="bh">{t("Koʻrinish")}</p><div className="list">
          <div className="li"><span>{t("Til")}</span><LangSwitch className="seg mini" item="button" /></div>
          <div className="li"><span>{t("Katta shrift")}<small>{t("oʻqish oson boʻladi")}</small></span><Tg on={s.bigText} onChange={s.setBigText} label={t("Katta shrift")} /></div></div>
        <p className="bh">{t("Ovoz")}</p><div className="list">
          <div className="li"><span>{t("Javoblarni ovoz bilan oʻqish")}</span><Tg on={voice} onChange={setVoice} label={t("Ovozli javob")} /></div>
          <div className="li"><span>{t("Tezlik")}</span><Seg items={[t("Sekin"), t("Oddiy")]} value={speed} onChange={setSpeed} /></div></div>
        <p className="bh">{t("Eslatmalar")}</p><div className="list">
          <div className="li"><span>{t("Soliq muddati")}<small>{t("3 kun oldin")}</small></span><Tg on={taxR} onChange={setTaxR} label={t("Soliq eslatmasi")} /></div>
          <div className="li"><span>{t("Nasiya")}<small>{t("14 kundan oshsa")}</small></span><Tg on={nasR} onChange={setNasR} label={t("Nasiya eslatmasi")} /></div>
          <div className="li"><span>{t("Qayerga")}</span><Seg items={[t("Ilova"), t("SMS")]} value={where} onChange={setWhere} /></div></div>
      </div>}
      {cur === "maxfiy" && <div className="pp" style={{ display: "block" }}>{back}<h3 className="ph">{t("Maxfiylik")}</h3>
        <div className="list">
          <div className="li"><span>{t("Anonim statistika")}<small>{t("ismsiz, faqat umumiy raqamlar · Palata hisobotiga")}</small></span><Tg on={s.stats} onChange={s.setStats} label={t("Anonim statistika")} /></div>
          <a className="li" role="button" tabIndex={0} onClick={() => { downloadCsv([["sana", "turi", "summa"], ...l.ops.map(o => [o.day, o.title, o.amount])], t("consul_operatsiyalar.csv")); s.showToast({ main: t("Fayl tayyor"), sub: t("consul_operatsiyalar.csv") }); }}><span>{t("Maʼlumotlarimni yuklab olish")}<small>{t("barcha operatsiyalar · CSV, Excel ochadi")}</small></span><i className="chev">›</i></a>
          <Link className="li" href="/maxfiylik"><span>{t("Shartlar va rozilik")}</span><i className="chev">›</i></Link></div>
        <button className="lnk2 dng" onClick={() => confirm(t("Hisobni oʻchirish"), t("Barcha operatsiyalar, suhbatlar va xotira butunlay oʻchadi. Buni qaytarib boʻlmaydi."), t("Ha, oʻchirish"), () => router.push("/kirish"))}>{t("Hisobni oʻchirish")}</button>
      </div>}
      {cur === "yordam" && <div className="pp" style={{ display: "block" }}>{back}<h3 className="ph">{t("Yordam")}</h3>
        <div className="list">
          <details className="li fq"><summary>{t("«Sarflash mumkin» qanday hisoblanadi?")}</summary><p>{t("Pul hozir − 30 kunlik toʻlovlar − zaxira. Nasiya qoʻshilmaydi.")}</p></details>
          <details className="li fq"><summary>{t("Consul xato qilsa-chi?")}</summary><p>{t("Raqamlarni kalkulyator hisoblaydi. Har bir yozuvni bekor qilish mumkin.")}</p></details>
          <details className="li fq"><summary>{t("Maʼlumotlarimni kim koʻradi?")}</summary><p>{t("Faqat siz. Davlatga — faqat roziligingiz bilan, anonim umumiy raqamlar.")}</p></details>
          <a className="li" role="button" tabIndex={0} onClick={() => s.openSheet(<SupportSheet />)}><span>{t("Yordamga yozish")}<small>{t("javob 1 ish kuni ichida")}</small></span><i className="chev">›</i></a></div>
      </div>}
    </div>
  </div></section>;
}

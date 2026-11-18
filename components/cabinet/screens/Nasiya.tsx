"use client";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/format";
import { USER } from "@/lib/demo";
import { useStore } from "../Store";
import { Screen } from "./common";

export default function Nasiya() { const t = useT();
  const s = useStore(), { ledger: l, view: v } = s;
  const remind = (name: string, amount: number) => {
    const msg = t("Assalomu alaykum, {p0}! Quruq mevalar uchun {p1} soʻm qarz qolgan edi. Imkoningiz boʻlganda toʻlab qoʻysangiz. Rahmat! — {p2}", { p0: name, p1: fmt(amount), p2: USER.name });
    s.openSheet(<><h4>{t("Eslatma ·")} {name}</h4><p style={{ fontSize: 15, lineHeight: 1.55, background: "var(--mist)", borderRadius: 12, padding: 12 }}>{msg}</p>
      <button className="btn w" onClick={() => { navigator.clipboard?.writeText(msg).catch(() => {}); s.closeSheet(); s.showToast({ main: t("Nusxalandi"), sub: t("SMS yoki messenjerga joylashtiring") }); }}>{t("Nusxa olish")}</button></>);
  };
  return <Screen id="nasiya" title={t("Nasiya daftari")}><div className="g2">
    <div className="col">
      <div className="blk"><div className="big1"><p className="l">{t("Sizga qarz")}</p><p className="n num">{fmt(v.owedToMe)} <small>{t("soʻm")}</small></p><p className="sub1">{v.debtorCount ? t("{p0} kishi", { p0: v.debtorCount }) : t("Hammasi toʻlandi")}</p></div></div>
      <div className="blk"><p className="bh">{t("Qarzdorlar")}</p><div className="list">
        {l.debtors.length === 0 && <div className="li"><span>{t("Hech kim qarz emas")}</span></div>}
        {l.debtors.map(d => <div className="li" key={d.name}><span className="lt">{d.name}<small>{d.days ? t("{p0} kundan beri", { p0: d.days }) : "bugun"}{d.days >= 14 && <> · <button className="nb" onClick={() => remind(d.name, d.amount)}>{t("eslatish")}</button></>}</small></span>
          <span style={{ textAlign: "right" }}><b className="num">{fmt(d.amount)}</b><br /><button className="nb" onClick={() => s.repaid(d.name)}>{t("Toʻladi")}</button></span></div>)}
      </div></div>
    </div>
    <div className="col d-only"><div className="blk"><p className="bh">{t("Qanday qoʻshiladi")}</p><div className="list"><div className="li"><span>{t("«Karimga 500 ming nasiya»")}<small>{t("toʻlaganda: «Karim toʻladi»")}</small></span></div></div></div></div>
  </div></Screen>;
}

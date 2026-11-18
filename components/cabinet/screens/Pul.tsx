"use client";
import { Link, useT } from "@/components/I18n";
import { fmt } from "@/lib/format";
import { useStore } from "../Store";
import { Li, Screen } from "./common";

export default function Pul() { const t = useT();
  const { view: v, ledger: l } = useStore(), m = l.money;
  return <Screen id="pul" title={t("Balans")} back={null}><div className="g2">
    <div className="col">
      <div className="blk"><div className="big1"><p className="l">{t("Pul hozir")}</p><p className="n num">{fmt(v.cash)} <small>{t("soʻm")}</small></p>
        <div className="split"><span>{t("Naqd")}<b className="num">{fmt(m.naqd)}</b></span><span>{t("Karta")}<b className="num">{fmt(m.karta)}</b></span><span>{t("Erkin")}<b className="num acc2">{fmt(v.free)}</b></span></div></div></div>
      <div className="blk"><p className="bh">{t("Noyabr")}</p><div className="list">
        <Li a={t("Daromad")} b={"+" + fmt(m.income)} pos />
        <Li a={t("Xarid")} b={"−" + fmt(m.buy)} />
        <Li a={t("Ijara, maosh, kommunal")} b={"−" + fmt(m.other)} />
        <Li a={`${t("Foyda")} · ${v.margin}%`} sub={t("oktyabrda 14% — qoqi qimmatlashdi")} b={fmt(v.profit)} />
      </div></div>
    </div>
    <div className="col">
      <div className="blk"><p className="bh">{t("Qarzlar")}</p><div className="list">
        <Link className="li" href="/app/nasiya"><span>{t("Sizga qarz")}<small>{t("nasiya ·")} {t("{p0} kishi", { p0: v.debtorCount })}</small></span><span className="lr"><b className="num">{fmt(v.owedToMe)}</b><i className="chev">›</i></span></Link>
        <Li a={t("Siz qarzdorsiz")} sub={t("Akmal aka · 10-dekabr")} b={fmt(m.supplier)} />
      </div></div>
      <div className="blk"><p className="bh">{t("Erkin pul qanday hisoblandi")}</p><div className="list">
        <Li a={t("Pul hozir")} b={fmt(v.cash)} />
        <Li a={t("30 kunlik toʻlovlar")} sub={t("ijara, taʼminotchi, soliq")} b={"−" + fmt(v.obligations)} />
        <Li a={t("Zaxira")} b={"−" + fmt(v.reserve)} />
        <Li a={<strong>{t("Erkin")}</strong>} b={fmt(v.free)} />
      </div></div>
    </div>
  </div></Screen>;
}

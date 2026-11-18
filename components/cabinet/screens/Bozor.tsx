"use client";
import { useT } from "@/components/I18n";
import { fmt } from "@/lib/format";
import { PRICES } from "@/lib/demo";
import { Screen } from "./common";

export default function Bozor() { const t = useT();
  const q = PRICES[0], over = Math.round(((q.mine - q.chorsu) * 200) / 1e5) * 1e5;
  return <Screen id="bozor" title={t("Bozor narxlari")}><div className="g2">
    <div className="col">
      <div className="blk"><div className="big1"><p className="l">{t("Oxirgi oyda ortiqcha toʻladingiz")}</p><p className="n num">~{fmt(over)} <small>{t("soʻm")}</small></p><p className="sub1">{t("{n} — Chorsu medianasidan {p}% qimmat", { n: t(q.name), p: Math.round((q.mine / q.chorsu - 1) * 100) })}</p></div></div>
      <div className="blk"><p className="bh">{t("1 kg narxi")}</p><div className="list" style={{ paddingTop: 6, paddingBottom: 6 }}><table className="t">
        <thead><tr><th>{t("Mahsulot")}</th><th>{t("Siz")}</th><th>{t("Chorsu")}</th><th>{t("Oloy")}</th></tr></thead>
        <tbody>{PRICES.map(p => <tr key={p.name}><td>{t(p.name)}</td><td className={p.mine > p.chorsu * 1.03 ? "up" : ""}>{fmt(p.mine)}</td><td>{fmt(p.chorsu)}</td><td>{fmt(p.oloy)}</td></tr>)}</tbody></table></div></div>
    </div>
    <div className="col">
      <div className="blk"><p className="bh">{t("Keyingi xaridda")}</p><div className="list"><div className="li"><span>{t("Oloydan oling yoki {p} soʻrang", { p: fmt(q.chorsu) })}<small>{t("200 kg da ~{p} tejaysiz", { p: fmt(over) })}</small></span></div></div></div>
      <p className="note">{t("Namuna maʼlumotlar · narx.stat.uz va foydalanuvchilar xaridlari")}</p>
    </div>
  </div></Screen>;
}

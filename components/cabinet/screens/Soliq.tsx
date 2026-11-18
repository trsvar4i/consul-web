"use client";
import { Link, useT, tk, useMln } from "@/components/I18n";
import { fmt } from "@/lib/format";
import { TURNOVER_1PCT_LIMIT } from "@/lib/tax";
import { useStore } from "../Store";
import { Li, Screen } from "./common";

export default function Soliq() { const t = useT(), mln = useMln();
  const s = useStore(), { view: v, ledger: l } = s, ytd = l.money.ytd + l.money.income;
  const w = Math.min(100, (ytd / TURNOVER_1PCT_LIMIT) * 100);
  return <Screen id="soliq" title={t("Soliq")}><div className="g2">
    <div className="col">
      <div className="blk"><div className="big1"><p className="l">{t("Noyabr uchun soliq")}</p><p className="n num">{fmt(v.tax)} <small>{t("soʻm")}</small></p><p className="sub1">{t("15-dekabrgacha · hozircha, oy oxirida aniqlanadi")}</p></div></div>
      <div className="blk"><p className="bh">{t("Qanday hisoblandi")}</p><div className="list">
        <Li a={t("Noyabr aylanmasi")} b={fmt(l.money.income)} /><Li a={t("Stavka · YaTT, aylanmadan")} b="1%" /><Li a={<strong>{t("Soliq")}</strong>} b={fmt(v.tax)} />
      </div></div>
    </div>
    <div className="col">
      <div className="blk"><p className="bh">{tk("1% stavka chegarasi")}</p><div className="list"><div className="li" style={{ display: "block" }}>
        <div className="kv" style={{ margin: "0 0 8px" }}><span>{t("Yil boshidan")}</span><b>{mln(ytd)}</b></div>
        <div className="bar"><i style={{ width: `${w}%`, ["--c" as string]: "#5A6370" }} /></div>
        <p className="small" style={{ margin: "8px 0 0", color: "var(--mut)" }}>{t("1 mlrd dan keyin — 4%. ~4,9 mlrd dan keyin — QQS va foyda soligʻi.")}</p></div></div></div>
      <div className="blk"><p className="bh">{t("Kalendar")}</p><div className="list">
        <Li a={t("Toʻlov · noyabr")} sub={t("15-dekabr")} b={fmt(v.tax)} />
        <div className="li"><span>{t("Eslatma")}<small>{t("12-dekabr · 3 kun oldin")}</small></span><b className="tk">{t("yoqilgan")}</b></div>
      </div></div>
      <Link className="btn sec w" href="/app/hisob" onClick={() => s.setCalcTab("soliq")}>{t("Boshqa rejim bilan solishtirish")}</Link>
      <p className="note">{t("Tavsiya. Yakuniy summa — soliq.uz kabinetida.")}</p>
    </div>
  </div></Screen>;
}

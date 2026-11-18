"use client";
import { Link, useT } from "@/components/I18n";
import { fmt } from "@/lib/format";
import { Icon } from "@/components/Icons";
import { payback } from "@/lib/plan";
import { useStore } from "../Store";
import { Screen } from "./common";

export default function Vositalar() { const t = useT();
  const { view: v, plan } = useStore();
  const L: [string, string, string, string][][] = [[
    ["/app/hisob", "i-calc", t("Kalkulyatorlar"), t("kredit, soliq, zararsizlik, narx")],
    ["/app/agar", "i-q", t("Agar…?"), t("qarorni oldindan hisoblash")],
    ["/app/kredit", "i-bank", t("Kredit"), t("34 mln gacha xavfsiz")],
    ["/app/soliq", "i-tax", t("Soliq"), t("{p0} · 15-dekabr", { p0: fmt(v.tax) })],
    ["/app/reja", "i-doc", t("Biznes-reja"), t("{p0} · {p1} oy", { p0: t(plan.title.split(" · ")[0]).toLowerCase(), p1: payback(plan) ?? "—" })],
  ], [
    ["/app/health", "i-q", t("Biznes diagnostikasi"), t("hisob, toʻlovlar va rivojlanish rejasi")],
    ["/app/bozor", "i-mkt", t("Bozor narxlari"), t("qoqi 12% qimmat")],
    ["/app/nasiya", "i-book", t("Nasiya daftari"), t("sizga {p0}", { p0: fmt(v.owedToMe) })],
    ["/app/oq", "i-flag", t("Oq biznes"), t("rasmiylik foydasi")],
    ["/app/learn", "i-learn", t("Oʻrganish"), t("moliyaviy savod")],
  ]];
  return <Screen id="vositalar" title={t("Vositalar")} back={null}>
    <div className="g2 eq">{L.map((col, i) => <div className="col" key={i}><div className="list">
      {col.map(([h, ic, t, s]) => <Link className="li" href={h} key={h}><span className="ti2"><Icon id={ic} /></span><span className="lt">{t}<small>{s}</small></span><i className="chev">›</i></Link>)}
    </div></div>)}</div>
  </Screen>;
}

"use client";
import { Link, useT } from "@/components/I18n";
import { fmt, roundK } from "@/lib/format";
import { annuity } from "@/lib/finance";
import { PROFIT_3M } from "@/lib/ledger";
import { payback, planProfit } from "@/lib/plan";
import { useStore } from "../Store";
import { PlanReport, PlanWizard } from "../Sheets";
import { Screen } from "./common";

export default function Reja() { const t = useT();
  const s = useStore(), p = s.plan, x = planProfit(p), m = payback(p), r1 = payback(p, 0.8);
  const own = Math.max(0, Math.min(s.view.free, p.capital)), L = Math.max(0, p.capital - own), pay = L ? annuity(L, 24, 0.02) : 0;
  const share = L ? Math.round((pay / (PROFIT_3M + Math.max(x, 0))) * 100) : 0;
  const rows: [React.ReactNode, string][] = [[t("Qoʻshimcha sotuv"), fmt(p.sales)], [<>{t("Xarid")}<small>{t("tannarx {p0}% — tarixingizdan", { p0: Math.round(p.cogs * 100) })}</small></>, "−" + fmt(p.sales * p.cogs)], [<>{t("Ijara")}{p.estimated && p.rent ? <small>{t("taxmin — aniqlang")}</small> : null}</>, p.rent ? "−" + fmt(p.rent) : "0"], [t("Yordamchi"), p.helper ? "−" + fmt(p.helper) : "0"], [<strong key="f">{t("Foyda / oy")}</strong>, "~" + fmt(x)]];
  return <Screen id="reja" title={t("Biznes-reja")}><div className="g2">
    <div className="col">
      <div className="blk"><div className="big1"><p className="l">{p.title}</p><p className="n" style={{ whiteSpace: "normal", fontSize: 30 }}>{m ? t("{p0} oyda oʻzini oqlaydi", { p0: m }) : t("Hozircha oʻzini oqlamaydi")}</p><p className="sub1">{t("Kapital")} {fmt(p.capital)} · {t("foyda")} {x > 0 ? "+" : ""}{fmt(x)}{t("/oy")}</p></div></div>
      <div className="blk"><p className="bh">{t("Raqamlar")} <a role="button" tabIndex={0} onClick={() => s.openSheet(<PlanWizard />)}>{t("Oʻzgartirish")}</a></p><div className="list">
        {rows.map(([a, b], i) => <div className="li" key={i}><span>{a}</span><b className="num">{b}</b></div>)}</div></div>
    </div>
    <div className="col">
      <div className="blk"><p className="bh">{t("Xavf")}</p><div className="list">
        <div className="li"><span>{t("Savdo 20% kam boʻlsa")}<small>{r1 ? t("oʻzini oqlash — {p0} oy", { p0: r1 }) : t("oʻzini oqlamaydi")}</small></span></div>
        {p.rent > 0 && <div className="li"><span>{t("Ijara 20% qimmat boʻlsa")}<small>{t("foyda —")} {fmt(planProfit({ ...p, rent: p.rent * 1.2 }))}{t("/oy")}</small></span></div>}
      </div></div>
      <div className="blk"><p className="bh">{t("Pul qayerdan")}</p><div className="list">
        <div className="li"><span>{t("Oʻz pulingiz")}<small>{t("hozirgi erkin pul")}</small></span><b className="num">{fmt(own)}</b></div>
        <div className="li"><span>{t("Yetmaydi")}</span><b className="num">{fmt(L)}</b></div>
        {L > 0 && <Link className="li" href="/app/hisob" onClick={() => s.setCalcTab("kredit")}><span>{t("Kredit, 24 oy")}<small>{t("oyiga ~")}{fmt(roundK(pay))} · {t("umumiy foydaning {p0}%", { p0: share })}</small></span><i className="chev">›</i></Link>}
      </div></div>
      <button className="btn w" onClick={() => s.openSheet(<PlanReport />)}>{t("Rejani PDF qilish")}</button>
      <button className="btn sec w" onClick={() => s.openSheet(<PlanWizard fresh />)}>{t("Yangi reja tuzish")}</button>
    </div>
  </div></Screen>;
}

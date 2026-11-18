"use client";
import { Link, useT } from "@/components/I18n";
import { useMemo } from "react";
import { fmt } from "@/lib/format";
import { useStore } from "../Store";
import { WhySheet } from "../Sheets";
import { Li, OpRow, Screen } from "./common";

/** 30-day free-money outlook: daily average sales minus scheduled payments. */
function Strip() {
  const { ledger: l, view: v } = useStore();
  const bars = useMemo(() => Array.from({ length: 30 }, (_, i) => {
    let x = v.free + i * 180_000;
    if (i >= 17) x -= l.money.rent; if (i >= 22) x -= l.money.supplier; if (i >= 27) x -= v.tax;
    return Math.max(x, 300_000);
  }), [l, v]);
  const max = Math.max(...bars);
  return <div className="strip">{bars.map((x, i) => <i key={i} style={{ height: `${Math.min(100, (x / max) * 100)}%` }} className={i === 17 ? "p" : ""} />)}</div>;
}

export default function Bugun() { const t = useT();
  const s = useStore(), { view: v, ledger: l } = s, m = l.money;
  const total = v.cash || 1;
  return <Screen id="bugun" back={null}><div className="g2">
    <div className="col">
      <div className="hero"><p className="l">{t("Bugun sarflash mumkin")}</p><p className={"n num" + (v.free < 0 ? " negv" : "")}>{fmt(v.free)} <small>{t("soʻm")}</small></p>
        <svg className="mk" aria-hidden="true"><use href="#sq" /></svg>
        <div className="fx d-only"><div className="fxb"><i style={{ flex: Math.max(1, (v.obligations / total) * 100), background: "#6B737D" }} /><i style={{ flex: Math.max(1, (v.reserve / total) * 100), background: "#9A6700" }} /><i style={{ flex: Math.max(1, (Math.max(v.free, 0) / total) * 100), background: "#E0566D" }} /></div>
          <div className="fxl"><span><b>{fmt(v.cash)}</b>{t("pul hozir")}</span><span>−</span><span><b>{fmt(v.obligations)}</b>{t("toʻlovlar")}</span><span>−</span><span><b>{fmt(v.reserve)}</b>{t("zaxira")}</span><span>=</span><span><b className="acc">{fmt(v.free)}</b>{t("erkin")}</span></div></div>
        <Strip /><div className="sl"><span>{t("bugun")}</span><span>{t("5-dek · ijara")}</span><span>{t("17-dek")}</span></div>
        <a className="whyl" onClick={() => s.openSheet(<WhySheet />)} role="button" tabIndex={0}>{t("Nega aynan shuncha?")} →</a></div>
      <div className="blk"><p className="bh">{t("Diqqat qiling")}</p><div className="list">
        <Li a={t("Katta xaridni 6-dekabrga qoldiring")} sub={t("ijaradan keyin ham pul yetadi")} href="/app/agar" chev />
        {l.debtors.filter(d => d.days >= 14).slice(0, 1).map(d => <Li key={d.name} a={t("{n} {a} qarz", { n: d.name, a: fmt(d.amount) })} sub={t("{d} kundan beri", { d: d.days })} href="/app/nasiya" chev />)}
      </div></div>
      <div className="blk d-only"><p className="bh">{t("Noyabr")} <Link href="/app/pul">{t("Batafsil")}</Link></p><div className="kpis">
        <div><small>{t("Daromad")}</small><b className="num">{fmt(m.income)}</b><em className="pos">{t("+4% oktyabrga")}</em></div>
        <div><small>{t("Xarajat")}</small><b className="num">{fmt(v.expenses)}</b><em>{t("+6% oktyabrga")}</em></div>
        <div><small>{t("Foyda")}</small><b className="num">{fmt(v.profit)}</b><em className="neg">{v.margin}% · {t("oktyabrda 14%")}</em></div></div></div>
    </div>
    <div className="col">
      <Link className="health-link" href="/app/health"><span><b>{t("Biznes diagnostikasi")}</b><small>{t("Hisobingizni 7 qadamda tekshiring")}</small></span><span aria-hidden="true">↗</span></Link>
      <div className="blk"><p className="bh">{t("Yaqinda toʻlash")}</p><div className="list">
        <Li a={t("Ijara")} sub={t("5-dekabr")} b={fmt(m.rent)} />
        <Li a={t("Taʼminotchiga qarz")} sub={t("10-dekabr")} b={fmt(m.supplier)} />
        <Li a={t("Soliq 1%")} sub={t("15-dekabr · erkin puldan ayirilgan")} b={fmt(v.tax)} />
      </div></div>
      <div className="blk"><p className="bh">{t("Oxirgi operatsiyalar")} <Link href="/app/ops">{t("Hammasi")}</Link></p><div className="list">
        {l.ops.filter(o => o.amount !== 0).slice(0, 4).map((o, i) => <OpRow key={o.id} o={o} day cls={i === 3 ? "d-only" : ""} />)}
      </div></div>
      <div className="blk d-only"><div className="list"><Link className="li" href="/app/nasiya" style={{ border: 0 }}><span>{t("Sizga qarz · nasiya")}<small>{t("{p0} kishi", { p0: v.debtorCount })}</small></span><span style={{ display: "flex", gap: 10, alignItems: "center" }}><b className="num">{fmt(v.owedToMe)}</b><i className="chev">›</i></span></Link></div></div>
    </div>
  </div></Screen>;
}

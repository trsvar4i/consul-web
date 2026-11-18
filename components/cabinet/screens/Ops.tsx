"use client";
import { useT, tk } from "@/components/I18n";
import { useState } from "react";
import { fmt } from "@/lib/format";
import { useStore } from "../Store";
import { OpRow, Screen } from "./common";
import { AddOperation } from "../AddOperation";

const F = [["all", tk("Hammasi")], ["in", tk("Kirim")], ["out", tk("Chiqim")], ["nas", tk("Nasiya")]] as const;

export default function Ops() { const t = useT();
  const { ledger: l, view: v, openSheet } = useStore();
  const [f, setF] = useState<(typeof F)[number][0]>("all");
  const ops = l.ops.filter(o => f === "all" || (f === "in" && o.amount > 0) || (f === "out" && o.amount < 0) || (f === "nas" && (o.kind === "nas" || /nasiya/i.test(o.title))));
  const days = [...new Set(ops.map(o => o.day))];
  return <Screen id="ops" title={t("Operatsiyalar")} back={null}>
    <div className="ops-toolbar"><p className="lead">{t("Barcha kirim va chiqimlar bir joyda.")}</p><button className="btn" onClick={() => openSheet(<AddOperation />)}><span aria-hidden="true">+</span>{t("Operatsiya qoʻshish")}</button></div>
    <div className="seg" style={{ margin: "4px 0 6px", maxWidth: 420 }}>{F.map(([k, label]) => <button key={k} className={f === k ? "on" : ""} onClick={() => setF(k)}>{t(label)}</button>)}</div>
    <div className="g2"><div className="col">
      {days.length === 0 && <div className="blk"><div className="list"><div className="li"><span>{t("Bu turda operatsiya yoʻq")}</span></div></div></div>}
      {days.map(d => <div className="blk" key={d}><p className="bh">{t(d)}</p><div className="list">{ops.filter(o => o.day === d).map(o => <OpRow key={o.id} o={o} />)}</div></div>)}
    </div>
      <div className="col d-only"><div className="blk"><p className="bh">{t("Noyabr")}</p><div className="list">
        <div className="li"><span>{t("Kirim")}</span><b className="num pos">+{fmt(l.money.income)}</b></div>
        <div className="li"><span>{t("Chiqim")}</span><b className="num">−{fmt(v.expenses)}</b></div>
        <div className="li"><span>{t("Yozuvlar")}</span><b className="num">{l.ops.length}</b></div></div></div><p className="note">{t("Sinov versiyasi: yozuvlar shu brauzerda saqlanadi.")}</p></div>
    </div>
  </Screen>;
}

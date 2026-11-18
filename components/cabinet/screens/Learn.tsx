"use client";
import { useT, tk } from "@/components/I18n";
import { useState } from "react";
import { GLOSSARY } from "@/lib/answer";
import { useStore } from "../Store";
import { Rich } from "../Reply";
import { Screen } from "./common";

const LESSONS = [
  { id: "foyda", t: tk("Pul va foyda — farqi nima?"), body: tk("Kassadagi pul — bu foyda emas. Foyda = daromad − barcha xarajatlar. Pulning bir qismi ijara, taʼminotchi va soliq uchun band.") },
  { id: "zaxira", t: tk("Zaxira nima uchun kerak?"), body: GLOSSARY.zaxira },
  { id: "ustama", t: tk("Ustama va narx"), body: GLOSSARY.ustama },
  { id: "stavka", t: tk("Yillik stavka nima?"), body: [GLOSSARY.stavka, tk("**Qoida:** oylik toʻlov foydangizning 30% dan oshmasin.")] },
  { id: "nasiya", t: tk("Nasiyani boshqarish"), body: [GLOSSARY.nasiya, tk("14 kundan oshgan qarzga yumshoq eslatma yuboring.")] },
];

export default function Learn() { const t = useT();
  const s = useStore();
  const [done, setDone] = useState<string[]>(["foyda", "zaxira"]);
  const next = LESSONS.find(l => !done.includes(l.id));
  const open = (l: (typeof LESSONS)[number]) => s.openSheet(<><h4>{t(l.t)}</h4><p style={{ fontSize: 16, lineHeight: 1.55, margin: 0 }}><Rich text={[l.body].flat().map(x => t(x)).join(" ")} /></p>
    <button className="btn w" style={{ marginTop: 12 }} onClick={() => { setDone(d => (d.includes(l.id) ? d : [...d, l.id])); s.closeSheet(); }}>{t("Tushundim · +1 dars")}</button></>);
  const pct = Math.round((done.length / LESSONS.length) * 100);
  return <Screen id="learn" title={t("Oʻrganish")}><div className="g2">
    <div className="col">
      <div className="blk"><div className="big1"><p className="l">{t("Moliyaviy pasport")}</p><p className="n" style={{ fontSize: 30 }}>{done.length === LESSONS.length ? t("Tayyor ✓") : `${done.length + 1}-daraja`}</p>
        <div className="bar" style={{ margin: "10px 0 6px" }}><i style={{ width: `${pct}%`, ["--c" as string]: "#C23650" }} /></div>
        <p className="sub1">{done.length} / {LESSONS.length} {t("dars")}{next ? t(" · keyingisi — «{p0}»", { p0: t(next.t) }) : ""}</p></div></div>
      {next && <div className="blk"><p className="bh">{t("Siz uchun hozir")}</p><div className="list"><a className="li" style={{ cursor: "pointer" }} onClick={() => open(next)} role="button" tabIndex={0}><span>{t(next.t)}<small>{t("1 daqiqa")}</small></span><i className="chev">›</i></a></div></div>}
    </div>
    <div className="col"><div className="blk"><p className="bh">{t("Darslar")}</p><div className="list">
      {LESSONS.map(l => <a key={l.id} className="li" onClick={() => open(l)} role="button" tabIndex={0} style={{ cursor: "pointer" }}><span>{t(l.t)}{!done.includes(l.id) && <small>{t("1 daqiqa")}</small>}</span>{done.includes(l.id) ? <b className="tk">✓</b> : <i className="chev">›</i>}</a>)}
    </div></div></div>
  </div></Screen>;
}

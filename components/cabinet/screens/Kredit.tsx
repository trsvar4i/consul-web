"use client";
import { Link, useT, tk } from "@/components/I18n";
import { useState } from "react";
import { fmt, roundK } from "@/lib/format";
import { annuity } from "@/lib/finance";
import { PROFIT_3M } from "@/lib/ledger";
import { useStore } from "../Store";
import { BankReport } from "../Sheets";
import { Screen } from "./common";

const SUPPORT: [string, string, string, string][] = [
  ["https://www.spot.uz/oz/2026/06/02/loans-extension/", tk("Garovsiz mikrokredit · 200 mln gacha"), tk("2026-yil 1-iyuldan, ijobiy kredit tarixi boʻlsa"), "spot.uz"],
  ["https://www.spot.uz/oz/2026/09/12/loans-entrepreneurs/", tk("Foiz kompensatsiyasi"), tk("1-oktabrdan, tuman shtabi qarori bilan"), "spot.uz"],
  ["https://gov.uz/oz/eco/news/view/229225", tk("Kafillik · 75% gacha"), tk("garov yetmasa"), "gov.uz"],
];

export default function Kredit() { const t = useT();
  const s = useStore();
  const [sum, setSum] = useState(34), [m, setM] = useState(24);
  const P = annuity(sum * 1e6, m, 0.02), sh = P / PROFIT_3M, p = Math.round(sh * 100);
  const vd = sh <= 0.3 ? ["v-ok", t("Xavfsiz"), t("Toʻlov foydangizning {p0}% — qoida: 30% dan oshmasin.", { p0: p })] : sh <= 0.45 ? ["v-w", t("Ehtiyot boʻling"), t("Toʻlov foydaning {p0}%. Yomon oyda pul yetmasligi mumkin.", { p0: p })] : ["v-e", t("Xavfli"), t("Toʻlov foydaning {p0}%. Pul yetmay qolishi ehtimoli yuqori.", { p0: p })];
  return <Screen id="kredit" title={t("Kredit")}><div className="g2">
    <div className="col">
      <div className="blk"><div className="big1">
        <p className="l">{t("Oylik toʻlov")}</p><p className="n num">{fmt(roundK(P))} <small>{t("soʻm")}</small></p>
        <p className={"vline " + vd[0]}><b>{vd[1]}</b>{vd[2]}</p>
        <div className="ctl"><div className="kv"><span>{t("Summa")}</span><b>{fmt(sum * 1e6)}</b></div>
          <input type="range" className="rng" min={5} max={60} step={1} value={sum} onChange={e => setSum(+e.target.value)} aria-label={t("Kredit summasi, mln")} />
          <div className="seg">{[12, 24, 36].map(x => <button key={x} className={m === x ? "on" : ""} onClick={() => setM(x)}>{x} {t("oy")}</button>)}</div>
          <p className="small">{t("Stavka 24% — namuna. Foydangizdan:")} <b>{p}%</b> · <Link href="/app/hisob" className="lk" onClick={() => s.setCalcTab("kredit")}>{t("Stavka va muddatni oʻzgartirish")}</Link></p></div>
      </div></div>
      <div className="blk"><p className="bh">{t("Kredit olish · 5 qadam")}</p><div className="list steps">
        {[[t("Xavfsiz summani bilish"), t("oylik toʻlov — foydaning 30% gacha"), true], [t("Hujjatlarni yigʻish"), t("roʻyxat pastda"), false], [t("Davlat yordamini tekshirish"), t("kompensatsiya yoki kafillik"), false], [t("2–3 bank taklifini solishtirish"), t("stavka, komissiya, muddat — kalkulyatorda"), false], [t("Ariza va hisobotni topshirish"), t("«Bank uchun hisobot» tugmasi"), false]].map(([a, b, ok], i) =>
          <div className="li" key={i}><span><i className={"sn" + (ok ? " ok" : "")}>{i + 1}</i>{a}<small>{b}</small></span>{ok ? <b className="tk">✓</b> : i === 1 ? <b className="tk w">4 / 6</b> : null}</div>)}
      </div></div>
    </div>
    <div className="col">
      <div className="blk"><p className="bh">{t("Hujjatlar")} <span className="tk w">4 / 6</span></p><div className="list">
        <div className="li"><span>{t("Pasport yoki ID-karta")}</span><b className="tk">✓</b></div>
        <div className="li"><span>{t("YaTT guvohnomasi")}</span><b className="tk">✓</b></div>
        <div className="li"><span>{t("Soliq qarzi yoʻqligi")}<small>{t("soliq.uz kabinetidan")}</small></span><b className="tk">✓</b></div>
        <div className="li"><span>{t("Daromad tarixi")}<small>{t("Consul 3 oylik hisobot beradi · bank 6 oy soʻrashi mumkin")}</small></span><b className="tk">✓</b></div>
        <div className="li"><span>{t("Biznes-reja")}<small>{t("maqsad va qaytarish rejasi")}</small></span><Link className="tk w" href="/app/reja">{t("tayyorlash")}</Link></div>
        <div className="li"><span>{t("Garov, kafil yoki sugʻurta")}<small>{t("garovsiz kreditda shart emas")}</small></span><b className="tk w">?</b></div>
      </div></div>
      <div className="blk"><p className="bh">{t("Davlat yordami")}</p><div className="list">
        {SUPPORT.map(([h, a, b, src]) => <a key={h} className="li" href={h} target="_blank" rel="noopener noreferrer"><span>{t(a)}<small>{t(b)} · {t("manba")}: {src}</small></span><i className="chev">›</i></a>)}
      </div></div>
      <button className="btn w" onClick={() => s.openSheet(<BankReport />)}>{t("Bank uchun hisobot")}</button>
      <p className="note">{t("Shartlar oʻzgarishi mumkin — bankda va manbada tekshiring. Bir nechta bank taklifini solishtiring.")}</p>
    </div>
  </div></Screen>;
}

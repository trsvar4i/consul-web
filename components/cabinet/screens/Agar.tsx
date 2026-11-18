"use client";
import { useT, tk } from "@/components/I18n";
import { useMemo, useState } from "react";
import { fmt } from "@/lib/format";
import { useStore } from "../Store";
import { Screen } from "./common";

type Fx = (i: number) => number;
const SC: Record<string, { fx: Fx; opts?: [string, string, string][] }> = {
  buy: { fx: i => -15e6 + (i >= 5 ? (i - 4) * 720_000 : 0), opts: [[tk("15 mln hozir"), tk("pul 1-kuni yetmaydi"), "buy"], [tk("8 mln hozir, 7 mln 6-dekabrda"), tk("ijaradan keyin"), "split"], [tk("10 mln hozir"), tk("qolganini sotuvdan keyin"), "ten"]] },
  split: { fx: i => -8e6 + (i >= 5 ? (i - 4) * 384_000 : 0) + (i >= 18 ? -7e6 + (i - 17) * 336_000 : 0) },
  ten: { fx: i => -10e6 + (i >= 5 ? (i - 4) * 480_000 : 0) },
  help: { fx: i => (i >= 25 ? -2e6 : 0) + (i >= 10 ? (i - 9) * 60_000 : 0), opts: [[tk("Yordamchi 2 mln/oy"), tk("savdo +10% boʻlsa"), "help"], [tk("Yarim kun, 1 mln/oy"), tk("xavfsizroq"), "half"]] },
  half: { fx: i => (i >= 25 ? -1e6 : 0) + (i >= 10 ? (i - 9) * 30_000 : 0) },
  loan: { fx: i => 34e6 - (i >= 30 ? 1_797_000 : 0), opts: [[tk("34 mln, 24 oy"), tk("toʻlov 1,8 mln — foydaning 30%"), "loan"], [tk("20 mln, 24 oy"), tk("toʻlov 1,06 mln — 18%"), "loan20"]] },
  loan20: { fx: i => 20e6 - (i >= 30 ? 1_057_000 : 0) },
};
const MON = [tk("yan"), tk("fev"), tk("mar"), tk("apr"), tk("may"), tk("iyun"), tk("iyul"), tk("avg"), tk("sen"), tk("okt"), tk("noy"), tk("dek")];

export default function Agar() { const t = useT();
  const { ledger: l, view: v } = useStore();
  const [q, setQ] = useState("buy"), [o, setO] = useState("buy");
  const base = useMemo(() => Array.from({ length: 31 }, (_, i) => v.cash + i * 200_000 - (i >= 17 ? l.money.rent : 0) - (i >= 22 ? l.money.supplier : 0) - (i >= 27 ? v.tax : 0)), [l, v]);
  const sc = base.map((x, i) => x + SC[o].fx(i));
  const all = [...base, ...sc, 0, v.reserve], mx = Math.max(...all), mn = Math.min(...all), W = 600, H = 170, P = 10;
  const y = (x: number) => P + (H - 2 * P) * (1 - (x - mn) / (mx - mn || 1)), xx = (i: number) => i * (W / 30);
  const pl = (a: number[]) => a.map((x, i) => `${xx(i).toFixed(1)},${y(x).toFixed(1)}`).join(" ");
  let mi = 0; sc.forEach((x, i) => { if (x < sc[mi]) mi = i; });
  const low = sc[mi], d = new Date(2026, 10, 18 + mi), ds = t("{d}-{m}", { d: d.getDate(), m: t(MON[d.getMonth()]) });
  const verdict = low < 0 ? { c: "v-e", b: t("{p0}: pul {p1} soʻmga yetmaydi", { p0: ds, p1: fmt(-low) }), t: t("Bu holda ijara yoki taʼminotchiga toʻlov kechikadi. Variantlarni koʻring.") }
    : low < v.reserve ? { c: "v-w", b: t("Mumkin, lekin {p0} zaxira {p1} gacha tushadi", { p0: ds, p1: fmt(low) }), t: t("Kutilmagan xarajat chiqsa — qiyin boʻladi.") }
      : { c: "v-ok", b: t("Xavfsiz. Eng past nuqta — {p0}: {p1}", { p0: ds, p1: fmt(low) }), t: t("Zaxira saqlanadi, toʻlovlar oʻz vaqtida.") };
  return <Screen id="agar" title={t("Agar…?")}><div className="g2">
    <div className="col">
      <div className="seg sw">{[["buy", t("15 mln xarid")], ["help", t("Yordamchi")], ["loan", t("Kredit")]].map(([k, t]) => <button key={k} className={q === k ? "on" : ""} onClick={() => { setQ(k); setO(k); }}>{t}</button>)}</div>
      <div className="blk"><div className="big1"><p className={"vline " + verdict.c}><b>{verdict.b}</b>{verdict.t}</p>
        <svg className="chart" viewBox="0 0 600 170" preserveAspectRatio="none" role="img" aria-label={t("30 kunlik pul prognozi")}>
          <line x1="0" x2={W} y1={y(0)} y2={y(0)} stroke="#C2410C" strokeWidth="1" opacity=".5" />
          <polyline fill="none" stroke="#B0B7C0" strokeWidth="3" points={pl(base)} /><polyline fill="none" stroke="#C23650" strokeWidth="3" points={pl(sc)} />
        </svg>
        <div className="leg"><span><i style={{ background: "#B0B7C0" }} />{t("hozirgi reja")}</span><span><i style={{ background: "#C23650" }} />{t("agar shunday qilsangiz")}</span></div></div></div>
    </div>
    <div className="col"><div className="blk"><p className="bh">{t("Variantlar")}</p><div className="list">
      {(SC[q].opts || []).map(([a, b, k]) => <div key={k} className={"li opt2" + (k === o ? " on" : "")} onClick={() => setO(k)} role="radio" aria-checked={k === o} tabIndex={0}><span className="lt">{t(a)}<small>{t(b)}</small></span><span className="rd" /></div>)}
    </div></div></div>
  </div></Screen>;
}

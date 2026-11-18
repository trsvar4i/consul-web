"use client";
import { Link, LangSwitch, useT } from "@/components/I18n";
import { useEffect, useRef, useState } from "react";
import { Logo, SvgDefs } from "@/components/Icons";
import { DATA, SERIES, LABELS, toCsv } from "./data";

function Chart({ metric }: { metric: "e" | "f" }) { const t = useT();
  const ref = useRef<SVGSVGElement>(null);
  const [w, setW] = useState(600);
  useEffect(() => { const el = ref.current; if (!el) return; const ro = new ResizeObserver(() => setW(el.clientWidth)); ro.observe(el); return () => ro.disconnect(); }, []);
  const S = SERIES[metric], v = S.v, H = 220, P = 30;
  const x = (i: number) => P + (i * (w - 2 * P)) / (v.length - 1), y = (t: number) => H - 24 - ((H - 44) * (t - S.mn)) / (S.mx - S.mn);
  const grid = []; for (let t = S.mn; t <= S.mx; t += 10) grid.push(t);
  return <svg ref={ref} role="img" aria-label={t("6 oylik trend")}>
    {grid.map(t => <g key={t}><line x1={P} x2={w - P} y1={y(t)} y2={y(t)} stroke="#E6EAEE" /><text x="0" y={y(t) + 4} fontSize="13" fill="#5A6370">{t}%</text></g>)}
    <polyline fill="none" stroke={S.c} strokeWidth="3" points={v.map((t, i) => x(i) + "," + y(t)).join(" ")} />
    {v.map((t, i) => <circle key={i} cx={x(i)} cy={y(t)} r="4" fill={S.c} />)}
    {LABELS.map((l, i) => <text key={l} x={x(i)} y={H - 4} fontSize="13" fill="#5A6370" textAnchor="middle">{w < 420 && i % 2 ? "" : t(l)}</text>)}
    <text x={x(v.length - 1)} y={y(v[v.length - 1]) - 10} fontSize="14" fontWeight="700" fill="#22262C" textAnchor="end">{v[v.length - 1]}%</text>
  </svg>;
}

export default function Palata() { const t = useT();
  const [per, setPer] = useState<30 | 90>(90), [met, setMet] = useState<"e" | "f">("e");
  const d = DATA[per];
  const csv = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([toCsv()], { type: "text/csv" })); a.download = t("consul_toshkent_anonim.csv"); document.body.appendChild(a); a.click(); a.remove(); };
  return <div className="pal"><SvgDefs />
<header className="nav"><div className="wrap"><Link className="logo" href="/"><Logo size={30} />{t("Consul")}</Link><span className="tag">{t("Savdo-sanoat palatasi uchun")}</span>
 <span className="r"><LangSwitch className="lsw" /><button className="btn sec" onClick={csv}>{t("CSV yuklab olish")}</button><button className="btn" onClick={() => window.print()}>{t("PDF saqlash")}</button></span></div></header>
<main className="wrap">
 <div className="head"><div><h1>{t("Toshkent, kichik savdo")}</h1><p className="sub">{t("Consul foydalanuvchilari, anonim. Butun shahar statistikasi emas.")}</p></div>
  <div className="flt"><div className="seg">{([30, 90] as const).map(p => <button key={p} className={per === p ? "on" : ""} onClick={() => setPer(p)}>{t("{p0} kun", { p0: p })}</button>)}</div></div></div>

 <div className="kpis">
  <div className="k"><p>{t("Hisobsiz aylanma, baho")}</p><b className="r">{d.e}</b><em>{t(d.ed)}</em></div>
  <div className="k"><p>{t("Rasmiy maqomda")}</p><b>{d.b}</b><em className="up">{t(d.bd)}</em></div>
  <div className="k"><p>{t("Oq biznesga oʻtdi")}</p><b>{d.c}</b><em>{t(d.cd)}</em></div>
  <div className="k"><p>{t("Tadbirkorlar")}</p><b>812</b><em>{t("rozilik berganlar")}</em></div>
 </div>

 <div className="g">
  <div className="card"><p className="h"><span>{t("6 oylik trend")}</span><span className="seg sm">{([["e", t("Hisobsiz aylanma")], ["f", t("Rasmiy maqom")]] as const).map(([k, t]) => <button key={k} className={met === k ? "on" : ""} onClick={() => setMet(k)}>{t}</button>)}</span></p><div className="fig"><Chart metric={met} /></div></div>
  <div className="card"><p className="h">{t("Qanday hisoblanadi")}</p><ul className="meth">
   <li><i>1</i><span>{t("Tadbirkor har bir sotuvni Consulda yozadi: naqd, karta yoki nasiya.")}</span></li>
   <li><i>2</i><span>{t("Fiskal chek yoki QR orqali oʻtgan sotuv — hisobdagi aylanma. Qolgani — hisobsiz.")}</span></li>
   <li><i>3</i><span>{t("Faqat rozilik berganlar, 5 tadan kam guruh koʻrsatilmaydi, raqamlar yaxlitlanadi.")}</span></li></ul>
   <div className="lim"><b>{t("Cheklov:")}</b> {t("bu — Consuldan foydalanuvchilar, tasodifiy tanlov emas. Shahar boʻyicha baho uchun soha va bozor ogʻirliklari bilan tuzatiladi; xato oraligʻi koʻrsatilgan.")}</div></div>
 </div>

 <div className="g">
  <div className="card"><p className="h">{t("Sohalar kesimida")}</p><div className="scroll"><table className="tm"><tbody>
   <tr className="x"><th>{t("Soha")}</th><th>{t("Tadbirkorlar")}</th><th>{t("Rasmiy")}</th><th>{t("Hisobsiz aylanma")}</th></tr>
   <tr><td>{t("Quruq meva, yongʻoq")}</td><td>296</td><td>64%</td><td className="r">26%</td></tr>
   <tr><td>{t("Oziq-ovqat")}</td><td>248</td><td>57%</td><td className="r">33%</td></tr>
   <tr><td>{t("Kiyim")}</td><td>171</td><td>52%</td><td className="r">37%</td></tr>
   <tr><td>{t("Xizmatlar")}</td><td>97</td><td>55%</td><td className="r">30%</td></tr></tbody></table></div></div>
  <div className="card"><p className="h">{t("Nega roʻyxatdan oʻtmaydi")} <small>{t("so‘rov, 341 kishi")}</small></p><div className="cmp">
   <div className="row"><span>{t("Soliq va tekshiruvdan qoʻrqadi")}</span><b>41%</b><span className="bar"><i style={{width:'41%',background:'var(--bs)'}}></i></span></div>
   <div className="row"><span>{t("Hujjatlar murakkab")}</span><b>27%</b><span className="bar"><i style={{width:'27%',background:'var(--bs)'}}></i></span></div>
   <div className="row"><span>{t("Foydasini koʻrmaydi")}</span><b>22%</b><span className="bar"><i style={{width:'22%',background:'var(--bs)'}}></i></span></div>
   <div className="row"><span>{t("Boshqa")}</span><b>10%</b><span className="bar"><i style={{width:'10%',background:'#B0B7C0'}}></i></span></div></div></div>
 </div>

 <div className="g">
  <div className="card"><p className="h">{t("Bozorlar kesimida")}</p><div className="scroll"><table className="tm"><tbody>
   <tr><th>{t("Bozor")}</th><th>{t("Tadbirkorlar")}</th><th>{t("Rasmiy")}</th><th>{t("Hisobsiz")}</th><th>{t("Aylanma, mediana")}</th></tr>
   <tr><td>{t("Chorsu")}</td><td>318</td><td>61%</td><td className="r">28%</td><td>{t("52 mln")}</td></tr>
   <tr><td>{t("Oloy")}</td><td>224</td><td>57%</td><td className="r">32%</td><td>{t("44 mln")}</td></tr>
   <tr><td>{t("Parkent")}</td><td>178</td><td>54%</td><td className="r">36%</td><td>{t("39 mln")}</td></tr>
   <tr><td>{t("Qoʻyliq")}</td><td>90</td><td>55%</td><td className="r">34%</td><td>{t("41 mln")}</td></tr>
   <tr><td>{t("Boshqalar")}</td><td className="hid" colSpan={4}>{t("5 tadan kam — yashirilgan")}</td></tr></tbody></table></div></div>
  <div className="card"><p className="h">{t("Rasmiy statistika bilan")}</p><div className="cmp">
   <div className="row"><span>{t("Kuzatilmaydigan iqtisodiyot, YaIMda")}</span><b>21,8%</b><span className="bar"><i style={{width:'21.8%',background:'#6B737D'}}></i></span></div>
   <div className="row"><span>{t("— xizmatlar sohasida")}</span><b>23,8%</b><span className="bar"><i style={{width:'23.8%',background:'#6B737D'}}></i></span></div>
   <div className="row"><span>{t("Consul: hisobsiz aylanma, kichik savdo")}</span><b>31%</b><span className="bar"><i style={{width:'31%',background:'var(--bs)'}}></i></span></div></div>
   <p className="src">{t("Manba: Milliy statistika qoʻmitasi, 2026-yil yanvar–sentabr")} (<a href="https://anhor.uz/uzl/iqtisodiyot/unobserved-economy-uzbekistan" target="_blank" rel="noopener noreferrer">anhor.uz</a>). {t("Koʻrsatkichlar bir xil emas: YaIM ulushi va savdo aylanmasi ulushi.")}</p></div>
 </div>

 <div className="g3">
  <div className="card"><p className="h">{t("Narxlar, 1 kg")} <small>{t("Chorsu, haftalik")}</small></p><div className="scroll"><table><tbody>
   <tr><th>{t("Mahsulot")}</th><th>{t("Mediana")}</th><th>{t("Haftada")}</th></tr>
   <tr><td>{t("Oʻrik qoqi")}</td><td>45 000</td><td className="up">+2,1%</td></tr>
   <tr><td>{t("Mayiz")}</td><td>38 000</td><td>0%</td></tr>
   <tr><td>{t("Yongʻoq")}</td><td>70 000</td><td className="dn">−1,4%</td></tr>
   <tr><td>{t("Bodom")}</td><td>120 000</td><td className="up">+0,8%</td></tr></tbody></table></div></div>
  <div className="card"><p className="h">{t("Maxfiylik")}</p><ul className="rules">
   <li>{t("Faqat rozilik berganlar")}</li>
   <li>{t("5 tadan kam guruh koʻrsatilmaydi")}</li>
   <li>{t("Ism, telefon, aniq summa chiqmaydi")}</li></ul></div>
 </div>
 <p className="note">{t("Namuna maʼlumotlar. Narxlar narx.stat.uz bilan solishtiriladi.")}</p>
</main>

  </div>;
}

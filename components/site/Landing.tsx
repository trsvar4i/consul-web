"use client";
import { Link, LangSwitch, useT } from "@/components/I18n";
import { useEffect, useRef } from "react";
import { SvgDefs } from "@/components/Icons";
import { LandingSections, MarketingFooter } from "./LandingSections";
import { initLanding } from "./landingAnim";

/** Marketing page. Markup mirrors the approved prototype; motion lives in landingAnim.ts. */
export default function Landing() { const t = useT();
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => (root.current ? initLanding(root.current, t) : undefined), [t]);
  return <div className="land" ref={root}>

<SvgDefs /><div className="prog"></div>

<header className="nav"><div className="wrap">
 <a className="logo" href="#top"><svg viewBox="0 0 120 120" width="30" height="30" aria-hidden="true"><defs><linearGradient id="nla" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8E1C33"/><stop offset="1" stopColor="#C23650"/></linearGradient><linearGradient id="nlb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F7B3BF"/><stop offset="1" stopColor="#F28D9F"/></linearGradient><linearGradient id="nlo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F06A80"/><stop offset="1" stopColor="#D9475F"/></linearGradient><clipPath id="nlc"><rect x="22" y="22" width="48" height="48" rx="9"/></clipPath></defs><rect width="120" height="120" rx="30" fill="#2F353D"/><rect className="ba" x="22" y="22" width="48" height="48" rx="9" fill="url(#nla)"/><g className="bm"><rect className="bq" x="50" y="50" width="48" height="48" rx="9" fill="url(#nlb)"/></g><g clipPath="url(#nlc)"><g className="bm"><rect x="50" y="50" width="48" height="48" rx="9" fill="url(#nlo)"/></g></g></svg>{t("Consul")}</a>
 <nav className="desktop-menu" aria-label={t("Asosiy navigatsiya")}><a className="t" href="#imk">{t("Imkoniyatlar")}</a><a className="t" href="#steps">{t("Qanday ishlaydi")}</a><Link className="t" href="/kalkulyatorlar">{t("Kalkulyatorlar")}</Link><a className="t" href="#faq">FAQ</a></nav>
 <details className="mobile-menu"><summary>{t("Menyu")}</summary><nav><a href="#imk">{t("Imkoniyatlar")}</a><a href="#steps">{t("Qanday ishlaydi")}</a><Link href="/kalkulyatorlar">{t("Kalkulyatorlar")}</Link><a href="#faq">FAQ</a><LangSwitch className="lang" /></nav></details>
 <span className="r"><LangSwitch className="lang" /><Link className="btn" href="/kirish">{t("Kirish")}</Link></span>
</div></header>

<main id="top">
<section className="dark hero-s"><div className="wrap">
 <div className="hero">
  <div>
   <h1 className="h-in"><span className="ln"><span>{t("Nima boʻlganini")}</span></span><span className="ln"><span>{t("ayting. Qolganini")}</span></span><span className="ln"><span>{t("Consul hisoblaydi.")}</span></span></h1>
   <p className="lead h-fade"><b>{t("Consul — choʻntagingizdagi hisobchi.")}</b> {t("Bugun qancha sarflash mumkinligini koʻrsatadi va sababini oʻz raqamlaringiz bilan tushuntiradi.")}</p>
   <div className="cta h-fade"><Link className="btn" href="/kirish?register=1">{t("Boshlash")}</Link><Link className="link" href="/kalkulyatorlar#kredit">{t("Kredit kalkulyatori")}</Link></div>
  </div>
  <div className="hstage" id="scene">
   <div className="dev"><div className="dscr">
    <div className="isl"></div><div className="sbar"><span>9:41</span><span className="sig"><i></i><i></i><i></i><i></i></span></div>
    <div className="ttl"><span>{t("Bugun")}</span><span>{t("Dilnoza · Chorsu")}</span></div>
    <div className="hb"><div><p className="l">{t("Sarflash mumkin")}</p><p className="n num"><span id="hNum">4 200 000</span> <small>{t("soʻm")}</small></p><p className="l" id="hWas">{t("30 kunga")}</p></div>
     <svg viewBox="0 0 120 120" className="mk" id="hMk" width="54" height="54" aria-hidden="true"><defs><linearGradient id="hma" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8E1C33"/><stop offset="1" stopColor="#C23650"/></linearGradient><linearGradient id="hmb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F7B3BF"/><stop offset="1" stopColor="#F28D9F"/></linearGradient><linearGradient id="hmo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F06A80"/><stop offset="1" stopColor="#D9475F"/></linearGradient><clipPath id="hmc"><rect x="10" y="10" width="56" height="56" rx="11"/></clipPath></defs><rect className="ba" x="10" y="10" width="56" height="56" rx="11" fill="url(#hma)"/><g className="bm"><rect className="bq" x="44" y="44" width="56" height="56" rx="11" fill="url(#hmb)"/></g><g clipPath="url(#hmc)"><g className="bm"><rect x="44" y="44" width="56" height="56" rx="11" fill="url(#hmo)"/></g></g></svg></div>
    <span className="undo" id="undo">{t("Bekor qilish")}<i id="undoBar"></i></span>
    <div className="feed" id="hFeed">
     <div className="frow" style={{'--c':'#1F7A4D'}}><span>{t("Sotuv")}<small>{t("kecha")}</small></span><b>+2 600 000</b></div>
     <div className="frow" style={{'--c':'#4A535E'}}><span>{t("Xarid · qoqi")}<small>{t("kecha")}</small></span><b>−10 080 000</b></div>
     <div className="frow" style={{'--c':'#4A535E'}}><span>{t("Svet")}<small>{t("1-noyabr")}</small></span><b>−420 000</b></div>
    </div>
    <div className="pick" id="hPick"><button data-k="0">{t("ijara 3 mln, 5-sanada")}</button><button data-k="1">{t("bugun 1,2 mlnga sotdim")}</button><button data-k="2">{t("taʼminotchi 1,8 mln qaytardi")}</button></div>
    <button className="abar" id="hBar" aria-label={t("Consulga ayting")}><span id="hTxt" className="car"></span><span className="go" id="hGo">↑</span></button>
   </div></div>
   <div className="fc f1 c-tax"><span><i className="dot" style={{background:'#9A6700'}}></i>{t("Soliq · 15-dekabr")}</span><b className="num">500 000</b></div>
   <div className="fc d f2 c-cred"><span>{t("Xavfsiz kredit")}</span><b className="num">34 000 000 ✓</b></div>
   <div className="fc f3 c-mkt"><span><i className="dot" style={{background:'#1F7A4D'}}></i>{t("Oʻrik qoqi · Oloy")}</span><b className="num">−3%</b></div>
  </div>
 </div>
</div>
<div className="scroll-hint">{t("pastga")}<i></i></div>
</section>

<section className="mist steps-s" id="steps"><div className="steps-pin"><div className="wrap" style={{width:'100%'}}>
 <div className="steps-g">
  <div>
   <div className="counter"><span id="stN">01</span> / 03</div>
   <h2>{t("Qanday ishlaydi")}</h2>
   <div className="st-list">
    <div className="st on"><h3>{t("Ayting")}</h3><p>{t("Operatsiyani qoʻshing yoki assistentga yozing.")}</p></div>
    <div className="st"><h3>{t("Consul hisoblaydi")}</h3><p>{t("Pul, majburiyatlar, 30 kunlik prognoz.")}</p></div>
    <div className="st"><h3>{t("Qaror qiling")}</h3><p>{t("Oʻz raqamlaringiz asosida maslahat.")}</p></div>
   </div>
  </div>
  <div className="stage">
   <div className="sin" id="sBub">
    <div className="bub">{t("bugun 1,2 mlnga sotdim")}</div>
    <div className="rc"><p>{t("Chek · Chorsu")}</p><i></i><i style={{width:'70%'}}></i><i style={{width:'84%'}}></i><b className="num">{t("Jami 1 200 000")}</b></div>
    <div className="vp"><span className="mic"></span><span className="vw"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>0:03</div>
   </div>
   <div className="val" id="sVal"><p>{t("Sarflash mumkin")}</p><b id="sNum">4 200 000</b></div>
   <svg viewBox="0 0 240 240" id="sMk" className="smk" width="260" height="260" aria-hidden="true"><defs><linearGradient id="sma" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8E1C33"/><stop offset="1" stopColor="#C23650"/></linearGradient><linearGradient id="smb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F7B3BF"/><stop offset="1" stopColor="#F28D9F"/></linearGradient><linearGradient id="smo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F06A80"/><stop offset="1" stopColor="#D9475F"/></linearGradient><clipPath id="smc"><rect x="30" y="30" width="112" height="112" rx="22"/></clipPath></defs><rect className="ba" x="30" y="30" width="112" height="112" rx="22" fill="url(#sma)"/><g className="bm"><rect className="bq" x="98" y="98" width="112" height="112" rx="22" fill="url(#smb)"/></g><g clipPath="url(#smc)"><g className="bm"><rect x="98" y="98" width="112" height="112" rx="22" fill="url(#smo)"/></g></g></svg>
   <div className="sch" id="sCh" aria-hidden="true"><i style={{height:'62%'}}></i><i style={{height:'66%'}}></i><i style={{height:'60%'}}></i><i style={{height:'70%'}}></i><i style={{height:'24%'}} className="p"></i><i style={{height:'34%'}}></i><i style={{height:'46%'}}></i><i style={{height:'55%'}}></i><i style={{height:'58%'}}></i><i style={{height:'63%'}}></i><i style={{height:'66%'}}></i><i style={{height:'61%'}}></i><i style={{height:'69%'}}></i><i style={{height:'72%'}}></i><i style={{height:'70%'}}></i><i style={{height:'74%'}}></i><i style={{height:'77%'}}></i><i style={{height:'73%'}}></i><i style={{height:'79%'}}></i><i style={{height:'82%'}}></i><i style={{height:'80%'}}></i><i style={{height:'84%'}}></i><i style={{height:'81%'}}></i><i style={{height:'86%'}}></i><i style={{height:'88%'}}></i><i style={{height:'85%'}}></i><i style={{height:'90%'}}></i><i style={{height:'92%'}}></i><i style={{height:'89%'}}></i><i style={{height:'94%'}}></i><span>{t("30 kun")}</span></div>
   <div className="adv" id="sAdv"><i></i>{t("Katta xaridni 6-dekabrga qoldiring — ijaradan keyin ham pul yetadi.")}</div>
  </div>
 </div>
</div></div></section>

<section id="imk"><div className="feat-pin"><div className="wrap" style={{width:'100%'}}>
 <h2>{t("Hisobchi va maslahatchi — bitta ilovada.")}</h2>
 <div className="feat">
  <div className="fl">
   <div className="fi on">{t("Kredit")}<span>{t("Qancha olish xavfsiz — sizning raqamlaringiz bilan")}</span><div className="bar"><i></i></div></div>
   <div className="fi">{t("Soliq")}<span>{t("Rejim va oylik summa")}</span><div className="bar"><i></i></div></div>
   <div className="fi">{t("Biznes-reja")}<span>{t("Taxminlar alohida belgilanadi")}</span><div className="bar"><i></i></div></div>
   <div className="fi">{t("Bozor tahlili")}<span>{t("Qayerda arzonroq")}</span><div className="bar"><i></i></div></div>
   <p className="trust"><i>✓</i>{t("Hisob-kitoblarni kalkulyator qiladi. AI faqat tushuntiradi.")}</p>
  </div>
  <div className="pw">
   <svg className="wm" viewBox="0 0 240 240" aria-hidden="true"><rect x="20" y="20" width="130" height="130" rx="26" fill="#F7E4E8"/><rect x="90" y="90" width="130" height="130" rx="26" fill="#FBEEF1"/></svg>
   <div className="fx" id="fx"><span id="fxL">{t("Bank uchun hisobot")}</span><b id="fxV">{t("PDF")}</b></div>
  <div className="phone"><div className="isl2"></div>
   <div className="scr"><div className="ph-h"><span>{t("Kredit")}</span><span style={{color:'var(--mut)'}}>×</span></div>
    <div className="card-d"><p className="cap">{t("Xavfsiz kredit")}</p><p className="big num">34 000 000</p><p className="was">{t("oyiga ~1 800 000 · 24 oy · 24% namuna")}</p></div>
    <div className="row" style={{'--c':'#1F7A4D'}}><div>{t("Toʻlov yuki")}<small>{t("foydaning 30%")}</small></div><b>✓</b></div>
    <div className="row" style={{'--c':'#9A6700'}}><div>{t("50 mln olsangiz")}<small>{t("3-oyda pul yetmaydi")}</small></div><b>⚠</b></div></div>
   <div className="scr"><div className="ph-h"><span>{t("Soliq")}</span><span style={{color:'var(--mut)'}}>×</span></div>
    <div className="card-d"><p className="cap">{t("Noyabr uchun soliq")}</p><p className="big num">500 000</p><p className="was">{t("aylanmadan 1% · 15-dekabrgacha")}</p></div>
    <div className="row" style={{'--c':'#1F7A4D'}}><div>{t("Rezervda bor")}<small>{t("Consul hisobida ajratilgan")}</small></div><b>✓</b></div>
    <div className="row" style={{'--c':'#4A535E'}}><div>{t("QQS")}<small>{t("~4,9 mlrd gacha majburiy emas")}</small></div><b>−</b></div></div>
   <div className="scr"><div className="ph-h"><span>{t("Biznes-reja")}</span><span style={{color:'var(--mut)'}}>×</span></div>
    <div className="card-d"><p className="cap">{t("Ikkinchi rasta")}</p><p className="big num" style={{fontSize:'24px'}}>{t("Oʻzini oqlash: 7 oy")}</p><p className="was">{t("kapital 30 000 000")}</p></div>
    <div className="row" style={{'--c':'#1F7A4D'}}><div>{t("Daromad prognozi")}<small>{t("oxirgi 3 oy sotuvi asosida")}</small></div><b>✓</b></div>
    <div className="row" style={{'--c':'#1F7A4D'}}><div>{t("Xarid")}<small>{t("sizning ustamangiz bilan")}</small></div><b>✓</b></div>
    <div className="row" style={{'--c':'#9A6700'}}><div>{t("Ijara")}<small>{t("taxmin — aniqlang")}</small></div><b>⚠</b></div></div>
   <div className="scr"><div className="ph-h"><span>{t("Bozor")}</span><span style={{color:'var(--mut)'}}>×</span></div>
    <div className="card-d"><p className="cap">{t("Oʻrik qoqi · 1 kg")}</p><p className="big num">+12%</p><p className="was">{t("siz Chorsu medianasidan qimmat olyapsiz")}</p>
     <div className="bars"><i style={{height:'60%'}}></i><i style={{height:'64%'}}></i><i style={{height:'58%'}}></i><i style={{height:'62%'}}></i><i className="p" style={{height:'74%'}}></i><i style={{height:'57%'}}></i></div></div>
    <div className="row" style={{'--c':'#1F7A4D'}}><div>{t("Oloy bozori")}<small>{t("43 500 soʻm")}</small></div><b>−3%</b></div></div>
  </div>
  </div>
 </div>
</div></div></section>

<LandingSections />

<section className="dark fin" id="start"><div className="wrap">
 <h2>{t("Birinchi raqamingiz — 2 daqiqada.")}</h2>
 <div style={{marginTop:'32px'}}><Link className="btn" href="/kirish?register=1">{t("Boshlash")}</Link></div>
 <div className="word" id="word" aria-label={t("Consul")}><span>{t("C")}</span><span>{t("o")}</span><span>{t("n")}</span><span>{t("s")}</span><span>{t("u")}</span><span>{t("l")}</span></div>
</div>
</section>
</main>
<MarketingFooter />


  </div>;
}

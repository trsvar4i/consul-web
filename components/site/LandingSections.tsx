"use client";
import { Link, useT, tk } from "@/components/I18n";
import { Icon, Logo } from "@/components/Icons";

const FAQ = [
  [tk("Consul nima uchun kerak?"), tk("Kirim, xarajat va majburiyatlarni bir joyda yuritish uchun. Consul balans, foyda va sarflash mumkin boʻlgan summani hisoblaydi.")],
  [tk("Operatsiyani qanday qoʻshaman?"), tk("Kabinetda «Operatsiya qoʻshish» tugmasini bosing. Tur, summa va toʻlov usulini tanlab, saqlang. Assistentga matn bilan yozish ham mumkin.")],
  [tk("Hisobsiz boshlash mumkinmi?"), tk("Ha. Hozirgi pul qoldigʻi va birinchi operatsiyadan boshlang. Majburiy toʻlovlar va zaxirani keyin qoʻshishingiz mumkin.")],
  [tk("Kalkulyatorlar bepulmi?"), tk("Ha, ochiq kalkulyatorlar roʻyxatdan oʻtmasdan ishlaydi. Kredit toʻlovi, narx, marja va zararsizlikni oʻz raqamlaringiz bilan hisoblang.")],
  [tk("Maʼlumotlar qayerda saqlanadi?"), tk("Sinov versiyasida operatsiyalar shu brauzerda saqlanadi. Boshqa qurilmalar bilan sinxronlash hozircha mavjud emas.")],
  [tk("Telefonda ishlaydimi?"), tk("Ha. Kabinet, operatsiya formasi va kalkulyatorlar telefon ekraniga moslashadi.")],
];

export function LandingSections() {
  const t = useT();
  return <>
    <section className="sec tools-section" id="tools"><div className="wrap">
      <p className="section-label">{t("Kalkulyatorlar")}</p><div className="section-title"><h2>{t("Qarordan oldin — hisob.")}</h2><p>{t("Oʻz raqamlaringiz bilan. Bepul, roʻyxatdan oʻtmasdan.")}</p></div>
      <div className="public-tools">
        <Link className="public-tool featured" href="/kalkulyatorlar#kredit"><div className="tool-top"><Icon id="i-bank" size={28} /><span aria-hidden="true">↗</span></div><div><p className="tool-caption">{t("Rejalashtirish")}</p><h3>{t("Kredit kalkulyatori")}</h3><p>{t("Oylik toʻlov, ortiqcha toʻlov va foydaga tushadigan yuk.")}</p></div><span className="tool-open">{t("Hisoblash")} →</span></Link>
        <div className="tool-stack"><Link className="public-tool" href="/kalkulyatorlar#soliq"><Icon id="i-tax" size={28} /><div><h3>{t("Soliq kalkulyatori")}</h3><p>{t("Kiritilgan shartlar boʻyicha soliq summasini solishtiring.")}</p></div><span aria-hidden="true">↗</span></Link><Link className="public-tool" href="/kalkulyatorlar#narx"><Icon id="i-calc" size={28} /><div><h3>{t("Narx va marja")}</h3><p>{t("Tannarxdan sotuv narxigacha — foydani oldindan hisoblang.")}</p></div><span aria-hidden="true">↗</span></Link></div>
      </div>
    </div></section>
    <section className="sec trust-section"><div className="wrap">
      <p className="section-label">{t("Aniqlik va nazorat")}</p><h2>{t("Har bir raqam tushunarli.")}</h2>
      <div className="trust-grid"><div><span className="trust-number">01</span><h3>{t("Formulalar bilan hisob")}</h3><p>{t("Balans va hisob-kitoblarni kod hisoblaydi. Assistent tayyor natijani tushuntiradi.")}</p></div><div><span className="trust-number">02</span><h3>{t("Maʼlumot ustidan nazorat")}</h3><p>{t("Operatsiyalarni koʻring, CSV shaklida yuklab oling va oxirgi kiritishni bekor qiling.")}</p></div><div><span className="trust-number">03</span><h3>{t("Aniq keyingi qadam")}</h3><p>{t("Biznes diagnostikasi hisob, majburiyatlar va rivojlanish rejasini tekshirishga yordam beradi.")}</p></div></div>
      <Link className="quiet-link" href="/maxfiylik">{t("Maʼlumotlar va maxfiylik haqida")} →</Link>
    </div></section>
    <section className="sec mist" id="faq"><div className="wrap faq-layout"><div><p className="section-label">FAQ</p><h2>{t("Koʻp soʻraladigan savollar")}</h2><p className="lead">{t("Boshlashdan oldin bilishingiz kerak boʻlganlari.")}</p><Link className="quiet-link" href="/kirish">{t("Demo bilan tanishish")} →</Link></div><div className="faq-list">{FAQ.map(([q, a], i) => <details key={q}><summary><span className="faq-num">0{i + 1}</span><span>{t(q)}</span><span className="faq-plus" aria-hidden="true" /></summary><p>{t(a)}</p></details>)}</div></div></section>
  </>;
}

export function MarketingFooter() {
  const t = useT();
  return <footer className="marketing-footer"><div className="wrap"><div className="footer-grid"><div><Link className="logo" href="/"><Logo size={34} />Consul</Link><p>{t("Kichik biznes uchun moliyaviy aniqlik.")}</p></div><nav aria-label={t("Boʻlimlar")}><h3>{t("Boʻlimlar")}</h3><Link href="/#imk">{t("Imkoniyatlar")}</Link><Link href="/#steps">{t("Qanday ishlaydi")}</Link><Link href="/#faq">FAQ</Link></nav><nav aria-label={t("Kalkulyatorlar")}><h3>{t("Kalkulyatorlar")}</h3><Link href="/kalkulyatorlar#kredit">{t("Kredit kalkulyatori")}</Link><Link href="/kalkulyatorlar#soliq">{t("Soliq kalkulyatori")}</Link><Link href="/kalkulyatorlar#narx">{t("Narx va marja")}</Link></nav><nav aria-label={t("Hisob")}><h3>{t("Hisob")}</h3><Link href="/kirish">{t("Kirish")}</Link><Link href="/kirish?register=1">{t("Roʻyxatdan oʻtish")}</Link><Link href="/maxfiylik">{t("Maxfiylik")}</Link></nav></div><div className="footer-bottom"><span>© 2026 Consul</span></div></div></footer>;
}

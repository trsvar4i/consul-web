import type { Metadata } from "next";
import { isLang, translator } from "@/lib/i18n";
import { Link } from "@/components/I18n";
import { Logo, SvgDefs } from "@/components/Icons";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params, t = translator(isLang(lang) ? lang : "uz");
  return { title: t("Consul — maʼlumot") };
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params, t = translator(isLang(lang) ? lang : "uz");
  return <div className="legal"><SvgDefs />
    <header className="nav"><div className="w"><Link className="logo" href="/"><Logo size={30} />{t("Consul")}</Link><Link href="/kirish" style={{ fontWeight: 600 }}>{t("Kirish")}</Link></div></header>
    <main className="w">
 <h1>{t("Maʼlumot")}</h1>
 <nav className="toc"><a href="#maxfiylik">{t("Maxfiylik")}</a><a href="#rozilik">{t("Rozilik")}</a><a href="#statistika">{t("Anonim statistika")}</a><a href="#ochirish">{t("Oʻchirish")}</a><a href="#aloqa">{t("Aloqa")}</a></nav>

 <section id="maxfiylik"><h2>{t("Maxfiylik")}</h2>
  <div className="box">{t("Maʼlumotlaringizni faqat siz koʻrasiz. Biz ularni sotmaymiz va reklama uchun ishlatmaymiz.")}</div>
  <h3>{t("Nima saqlanadi")}</h3><ul><li>{t("Telefon raqami — kirish uchun.")}</li><li>{t("Biznes haqida: nima sotasiz, qayerda, soliq rejimi.")}</li><li>{t("Siz yozgan operatsiyalar, nasiya, eslatmalar va Consul bilan suhbatlar.")}</li><li>{t("Ovozli xabar va chek surati — faqat matnga aylantirish uchun; aylantirilgach saqlanmaydi.")}</li></ul>
  <h3>{t("Nima uchun")}</h3><p>{t("Hisob-kitob qilish, eslatish va maslahat berish uchun. Hisoblarni dastur qiladi; sunʼiy intellekt faqat tushuntiradi.")}</p>
  <h3>{t("Qayerda")}</h3><p>{t("Oʻzbekiston qonunchiligiga muvofiq saqlanadi va himoyalanadi.")}</p>
  <h3>{t("Kim koʻradi")}</h3><p>{t("Faqat siz. Bank uchun hisobotni ham faqat siz yuklab olib, oʻzingiz berasiz.")}</p></section>

 <section id="rozilik"><h2>{t("Foydalanish shartlari")}</h2>
  <ul><li>{t("Consul — maslahat vositasi. Yakuniy soliq summasi — soliq.uz kabinetida, kredit qarori — bankda.")}</li><li>{t("Hisob-kitoblar siz kiritgan raqamlarga tayanadi. Raqam notoʻgʻri boʻlsa, natija ham notoʻgʻri boʻladi.")}</li><li>{t("Davlat yordami va bank shartlari oʻzgarishi mumkin — manbada tekshiring.")}</li><li>{t("Asosiy funksiyalar roʻyxatdan keyin ishlaydi; kalkulyatorlar — roʻyxatsiz ham.")}</li></ul></section>

 <section id="statistika"><h2>{t("Anonim statistika")}</h2>
  <p>{t("Ixtiyoriy. Yoqsangiz, Savdo-sanoat palatasi hisobotiga faqat umumiy raqamlar qoʻshiladi: bozor va soha boʻyicha ulushlar va medianalar.")}</p>
  <ul><li>{t("Ism, telefon va aniq summalar hech qachon chiqmaydi.")}</li><li>{t("5 tadan kam tadbirkorli guruh koʻrsatilmaydi.")}</li><li>{t("Raqamlar yaxlitlanadi.")}</li><li>{t("«Men → Maxfiylik»da istalgan vaqtda oʻchirasiz.")}</li></ul></section>

 <section id="ochirish"><h2>{t("Yuklab olish va oʻchirish")}</h2>
  <p>{t("«Men → Maxfiylik»da barcha operatsiyalaringizni faylga yuklab olasiz. «Hisobni oʻchirish» — barcha maʼlumotlar, suhbatlar va xotira oʻchadi; anonim statistikaga qoʻshilgan umumiy raqamlar qaytarib boʻlmaydi, chunki ularda siz yoʻqsiz.")}</p></section>

 <section id="aloqa"><h2>{t("Aloqa")}</h2>
  <p>{t("Ilova ichida: «Men → Yordam → Yordamga yozish». Javob — 1 ish kuni ichida.")}</p></section>
 <p className="note">{t("© 2026 Consul. Namuna matn, xakaton prototipi.")}</p>
</main>
  </div>;
}

import type { Metadata } from "next";
import { isLang, translator } from "@/lib/i18n";
import { SvgDefs } from "@/components/Icons";
import { SiteFooter, SiteHeader } from "@/components/site/SiteHeader";
import { ToolsClient } from "./ToolsClient";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params, t = translator(isLang(lang) ? lang : "uz");
  return { title: t("Consul — kalkulyatorlar"), description: t("Kredit, soliq, zararsizlik va narx kalkulyatorlari — roʻyxatdan oʻtmasdan.") };
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params, t = translator(isLang(lang) ? lang : "uz");
  return <div className="tl"><SvgDefs />
    <SiteHeader />
    <main className="wrap">
      <div className="head"><h1>{t("Kalkulyatorlar")}</h1><p className="sub">{t("Roʻyxatdan oʻtmasdan. Natija taxminiy, qaror sizniki.")}</p></div>
      <ToolsClient />
      <p className="note">{t("Soliq — 2026-yil qoidalari, aniq summa soliq.uz kabinetida. Kredit shartlari — bankda.")}</p>
    </main>
    <SiteFooter />
  </div>;
}

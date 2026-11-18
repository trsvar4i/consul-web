import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "../globals.css";
import "@/styles/cabinet.css";
import "@/styles/calc.css";
import "@/styles/landing.css";
import "@/styles/tools.css";
import "@/styles/palata.css";
import "@/styles/auth.css";
import "@/styles/legal.css";
import { I18nProvider } from "@/components/I18n";
import { isLang, LANGS, translator } from "@/lib/i18n";

export function generateStaticParams() { return LANGS.map(lang => ({ lang })); }

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params, t = translator(isLang(lang) ? lang : "uz");
  return {
    title: t("Consul — choʻntagingizdagi hisobchi"),
    description: t("Kichik biznes uchun: bugun qancha sarflash mumkin, soliq, kredit va narx — oʻz raqamlaringiz bilan."),
    alternates: { languages: { uz: "/uz", ru: "/ru" } },
  };
}
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#22262C" };

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return <html lang={lang}><body><I18nProvider lang={lang}>{children}</I18nProvider></body></html>;
}

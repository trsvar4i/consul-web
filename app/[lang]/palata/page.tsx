import type { Metadata } from "next";
import { isLang, translator } from "@/lib/i18n";
import Palata from "./PalataClient";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params, t = translator(isLang(lang) ? lang : "uz");
  return { title: t("Consul — Savdo-sanoat palatasi uchun anonim hisobot") };
}
export default function Page() { return <Palata />; }

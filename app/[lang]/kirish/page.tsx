import type { Metadata } from "next";
import { isLang, translator } from "@/lib/i18n";
import { SvgDefs } from "@/components/Icons";
import AuthClient from "./AuthClient";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params, t = translator(isLang(lang) ? lang : "uz");
  return { title: t("Consul — kirish va roʻyxatdan oʻtish") };
}
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = await searchParams;
  return <><SvgDefs tile="#2F353D" /><AuthClient register={"register" in q} /></>;
}

import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMeta, JsonLd, SITE_URL } from "@/lib/seo";
import { Container } from "@/components/ui/primitives";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageCtx } from "@/components/layout/PageCtx";
import { MarkupCalculator } from "@/components/tools/MarkupCalculator";

export async function generateMetadata({ params }: PageProps<"/[locale]/tools/markup">) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMeta(locale, "/tools/markup", t("markupTitle"), t("markupDesc"));
}

export default async function MarkupPage({ params }: PageProps<"/[locale]/tools/markup">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("markup");
  const nav = await getTranslations("nav");
  const meta = await getTranslations("meta");
  const pages = await getTranslations("pages");
  return (
    <>
      <PageCtx page="tool_markup" title={pages("toolMarkup")} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebApplication", name: meta("markupTitle"), url: `${SITE_URL}/${locale}/tools/markup`, applicationCategory: "FinanceApplication", operatingSystem: "Web", inLanguage: locale }} />
      <PageHeader title={t("h1")} intro={t("intro")} crumbs={[{ href: "/", label: nav("home") }, { href: "/tools", label: nav("tools") }]} />
      <Container className="py-8 lg:py-12">
        <MarkupCalculator />
      </Container>
    </>
  );
}

import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMeta, JsonLd, SITE_URL } from "@/lib/seo";
import { Container } from "@/components/ui/primitives";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageCtx } from "@/components/layout/PageCtx";
import { TaxRegimeCalculator } from "@/components/tools/TaxRegimeCalculator";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({ params }: PageProps<"/[locale]/tools/tax-regime">) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMeta(locale, "/tools/tax-regime", t("taxTitle"), t("taxDesc"));
}

export default async function TaxPage({ params }: PageProps<"/[locale]/tools/tax-regime">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("tax");
  const nav = await getTranslations("nav");
  const meta = await getTranslations("meta");
  const g = await getTranslations("guides");
  const pages = await getTranslations("pages");
  return (
    <>
      <PageCtx page="tool_tax" title={pages("toolTax")} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebApplication", name: meta("taxTitle"), url: `${SITE_URL}/${locale}/tools/tax-regime`, applicationCategory: "FinanceApplication", operatingSystem: "Web", inLanguage: locale, offers: { "@type": "Offer", price: 0, priceCurrency: "UZS" } }} />
      <PageHeader title={t("h1")} intro={t("intro")} crumbs={[{ href: "/", label: nav("home") }, { href: "/tools", label: nav("tools") }]} />
      <Container className="py-8 lg:py-12">
        <TaxRegimeCalculator />
        <p className="mt-8">
          <Link href="/guides/tax-regime-2026" className="inline-flex min-h-11 items-center font-medium text-brand-500 hover:underline">{g("read")}: {nav("guides")} →</Link>
        </p>
      </Container>
    </>
  );
}

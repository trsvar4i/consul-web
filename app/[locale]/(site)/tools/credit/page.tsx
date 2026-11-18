import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMeta, JsonLd, SITE_URL } from "@/lib/seo";
import { RULES } from "@/lib/calc/rules";
import { formatDateFull } from "@/lib/format";
import { Container } from "@/components/ui/primitives";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageCtx } from "@/components/layout/PageCtx";
import { CreditCalculator } from "@/components/tools/CreditCalculator";

export async function generateMetadata({ params }: PageProps<"/[locale]/tools/credit">) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMeta(locale, "/tools/credit", t("creditTitle"), t("creditDesc"));
}

export default async function CreditPage({ params }: PageProps<"/[locale]/tools/credit">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("credit");
  const nav = await getTranslations("nav");
  const c = await getTranslations("common");
  const meta = await getTranslations("meta");
  const pages = await getTranslations("pages");
  return (
    <>
      <PageCtx page="tool_credit" title={pages("toolCredit")} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebApplication", name: meta("creditTitle"), url: `${SITE_URL}/${locale}/tools/credit`, applicationCategory: "FinanceApplication", operatingSystem: "Web", inLanguage: locale, offers: { "@type": "Offer", price: 0, priceCurrency: "UZS" } }} />
      <PageHeader title={t("h1")} intro={t("intro")} crumbs={[{ href: "/", label: nav("home") }, { href: "/tools", label: nav("tools") }]} />
      <Container className="py-8 lg:py-12">
        <CreditCalculator />
        <p className="mt-6 text-sm text-gray-700">{c("disclaimer", { date: formatDateFull(RULES.effectiveFrom, locale) })}</p>
      </Container>
      <Container className="max-w-3xl pb-16">
        <article className="prose-c border-t border-gray-200 pt-10">
          <h2>{t("seoTitle")}</h2>
          {[1, 2, 3, 4, 5].map((i) => <p key={i}>{t(`seo${i}`)}</p>)}
        </article>
      </Container>
    </>
  );
}

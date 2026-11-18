import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, Calculator, Percent, Scale } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { pageMeta } from "@/lib/seo";
import { Container } from "@/components/ui/primitives";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageCtx } from "@/components/layout/PageCtx";

export async function generateMetadata({ params }: PageProps<"/[locale]/tools">) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMeta(locale, "/tools", t("toolsTitle"), t("toolsDesc"));
}

export default async function ToolsPage({ params }: PageProps<"/[locale]/tools">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("tools");
  const nav = await getTranslations("nav");
  return (
    <>
      <PageCtx page="other" title={t("h1")} />
      <PageHeader title={t("h1")} intro={t("intro")} crumbs={[{ href: "/", label: nav("home") }]} />
      <Container className="grid gap-4 py-10 md:grid-cols-3 lg:py-16">
        {[
          { href: "/tools/credit", Icon: Calculator, k: "credit" },
          { href: "/tools/tax-regime", Icon: Scale, k: "tax" },
          { href: "/tools/markup", Icon: Percent, k: "markup" },
        ].map(({ href, Icon, k }) => (
          <Link key={href} href={href} className="group rounded-card border border-gray-200 p-6 hover:border-graphite-900">
            <Icon size={26} aria-hidden />
            <h2 className="mt-4 text-xl font-semibold">{t(`${k}Title`)}</h2>
            <p className="mt-2 text-gray-700">{t(`${k}Desc`)}</p>
            <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium">{t("open")} <ArrowRight size={16} aria-hidden /></span>
          </Link>
        ))}
      </Container>
    </>
  );
}

import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getGuide, listGuides } from "@/lib/api";
import type { Locale } from "@/lib/types";
import { formatDateFull } from "@/lib/format";
import { headings, MarkdownBody } from "@/lib/markdown";
import { pageMeta, JsonLd, SITE_URL } from "@/lib/seo";
import { RULES } from "@/lib/calc/rules";
import { Container } from "@/components/ui/primitives";
import { PageCtx } from "@/components/layout/PageCtx";
import { CreditCalculator } from "@/components/tools/CreditCalculator";
import { TaxRegimeCalculator } from "@/components/tools/TaxRegimeCalculator";
import { MarkupCalculator } from "@/components/tools/MarkupCalculator";
import { GuideAsk } from "@/components/tools/GuideAsk";
import { ChevronRight } from "lucide-react";
import { GuideCover } from "@/components/brand/GuideCover";

export async function generateStaticParams() {
  return (await listGuides()).map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/guides/[slug]">) {
  const { locale, slug } = await params;
  const g = await getGuide(slug);
  if (!g) return {};
  const l = locale as Locale;
  return pageMeta(locale, `/guides/${slug}`, `${g.title[l]} — Consul`, g.description[l]);
}

export default async function GuidePage({ params }: PageProps<"/[locale]/guides/[slug]">) {
  const { locale: lc, slug } = await params;
  setRequestLocale(lc);
  const locale = lc as Locale;
  const g = await getGuide(slug);
  if (!g) notFound();
  const t = await getTranslations("guides");
  const nav = await getTranslations("nav");
  const c = await getTranslations("common");
  const body = g.body[locale];
  const toc = headings(body);
  const related = (await listGuides()).filter((x) => x.slug !== slug).slice(0, 2);

  return (
    <>
      <PageCtx page="guide" title={g.title[locale]} data={{ title: g.title[locale] }} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: g.title[locale], description: g.description[locale], dateModified: g.updatedAt, inLanguage: locale, url: `${SITE_URL}/${locale}/guides/${slug}`, publisher: { "@type": "Organization", name: "Consul" } }} />
      <div className="border-b border-gray-200 bg-mist">
        <Container className="max-w-3xl py-8 lg:py-12">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-700">
              <li className="flex items-center gap-1"><Link href="/" className="hover:underline">{nav("home")}</Link><ChevronRight size={14} aria-hidden /></li>
              <li className="flex items-center gap-1"><Link href="/guides" className="hover:underline">{nav("guides")}</Link><ChevronRight size={14} aria-hidden /></li>
            </ol>
          </nav>
          <h1 className="mt-3 text-[28px] font-semibold leading-tight tracking-tight lg:text-[40px]">{g.title[locale]}</h1>
          <p className="mt-3 text-sm text-gray-700">{t("updated", { date: formatDateFull(g.updatedAt, locale) })} · {t("readMin", { n: g.readMinutes })}</p>
        </Container>
      </div>

      <Container className="max-w-3xl py-8 lg:py-12">
        <div className="mb-8 h-56 overflow-hidden rounded-block sm:h-72"><GuideCover guide={g} /></div>
        {toc.length > 1 && (
          <nav aria-label={t("toc")} className="mb-8 rounded-card border border-gray-200 p-5">
            <p className="text-sm font-semibold">{t("toc")}</p>
            <ol className="mt-1 text-[15px]">
              {toc.map((h) => <li key={h.id}><a href={`#${h.id}`} className="inline-flex min-h-10 items-center text-brand-500 hover:underline">{h.text}</a></li>)}
            </ol>
          </nav>
        )}
        <article className="prose-c text-[17px]">
          <MarkdownBody md={body} />
        </article>
      </Container>

      {g.tool && (
        <section className="bg-mist py-10 lg:py-14">
          <Container className={g.tool === "tax-regime" ? "" : "max-w-5xl"}>
            <h2 className="mb-6 text-[22px] font-semibold lg:text-[28px]">{t("toolTitle")}</h2>
            {g.tool === "credit" && <CreditCalculator embedded />}
            {g.tool === "tax-regime" && <TaxRegimeCalculator />}
            {g.tool === "markup" && <MarkupCalculator />}
            {g.tool !== "tax-regime" && <p className="mt-6 text-sm text-gray-700">{c("disclaimer", { date: formatDateFull(RULES.effectiveFrom, locale) })}</p>}
          </Container>
        </section>
      )}

      <Container className="max-w-3xl space-y-10 py-10 lg:py-14">
        <GuideAsk title={g.title[locale]} />
        {related.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold">{t("related")}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <Link key={r.slug} href={`/guides/${r.slug}`} className="rounded-card border border-gray-200 p-4 hover:border-graphite-900">
                  <p className="font-semibold leading-snug">{r.title[locale]}</p>
                  <p className="mt-1 text-sm text-gray-700">{t("readMin", { n: r.readMinutes })}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </Container>
    </>
  );
}

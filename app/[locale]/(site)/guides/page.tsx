import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { listGuides } from "@/lib/api";
import type { Locale } from "@/lib/types";
import { formatDateFull } from "@/lib/format";
import { pageMeta } from "@/lib/seo";
import { Container } from "@/components/ui/primitives";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageCtx } from "@/components/layout/PageCtx";
import { GuideCover } from "@/components/brand/GuideCover";
import { CreateGuide } from "@/components/guides/CreateGuide";

export async function generateMetadata({ params }: PageProps<"/[locale]/guides">) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMeta(locale, "/guides", t("guidesTitle"), t("guidesDesc"));
}


export default async function GuidesPage({ params }: PageProps<"/[locale]/guides">) {
  const { locale: l } = await params;
  setRequestLocale(l);
  const locale = l as Locale;
  const t = await getTranslations("guides");
  const nav = await getTranslations("nav");
  const guides = await listGuides();
  return (
    <>
      <PageCtx page="other" title={t("h1")} />
      <PageHeader title={t("h1")} intro={t("intro")} crumbs={[{ href: "/", label: nav("home") }]} />
      <Container className="grid gap-5 py-10 md:grid-cols-2 lg:grid-cols-3 lg:py-16">
        <CreateGuide />
        {guides.map((g) => {
          return (
            <Link key={g.slug} href={`/guides/${g.slug}`} className="group flex flex-col overflow-hidden rounded-card border border-gray-200 hover:border-graphite-900">
              <div className="relative h-48 overflow-hidden">
                <GuideCover guide={g} className="transition-transform duration-700 group-hover:scale-[1.04]" />
                <span className="absolute left-4 top-4 rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-graphite-900 shadow-soft">{g.tag[locale]}</span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="text-lg font-semibold leading-snug">{g.title[locale]}</h2>
                <p className="mt-2 flex-1 text-[15px] text-gray-700">{g.description[locale]}</p>
                <p className="mt-4 text-sm text-gray-700">{t("readMin", { n: g.readMinutes })} · {formatDateFull(g.updatedAt, locale)}</p>
              </div>
            </Link>
          );
        })}
      </Container>
    </>
  );
}

import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, ArrowUpRight, BarChart3, Calculator, Check, Lock, MessageCircleQuestion, Percent, Scale, ShieldCheck, Sparkles, Upload } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getDashboard, listGuides } from "@/lib/api";
import type { Locale } from "@/lib/types";
import { pageMeta, JsonLd, SITE_URL } from "@/lib/seo";
import { ButtonLink, Container } from "@/components/ui/primitives";
import { HeroCard } from "@/components/home/HeroCard";
import { PhoneStory } from "@/components/home/PhoneStory";
import { Waterfall } from "@/components/home/Waterfall";
import { MarkLarge } from "@/components/brand/Logo";
import { Magnetic, Marquee, Reveal, Scramble, SectionMark, Spotlight } from "@/components/fx/fx";
import { PageCtx } from "@/components/layout/PageCtx";
import { GlowGrid } from "@/components/fx/GlowGrid";
import { GuideCover } from "@/components/brand/GuideCover";

export async function generateMetadata({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMeta(locale, "/", t("homeTitle"), t("homeDesc"));
}

const H2 = ({ children, dark = false, className = "" }: { children: React.ReactNode; dark?: boolean; className?: string }) => (
  <h2 className={`text-[28px] font-semibold leading-[1.06] tracking-[-0.025em] sm:text-[36px] lg:text-[52px] ${dark ? "text-white" : "text-graphite-900"} ${className}`}>{children}</h2>
);

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale: l } = await params;
  setRequestLocale(l);
  const locale = l as Locale;
  const t = await getTranslations("home");
  const L = await getTranslations("landing");
  const tt = await getTranslations("tools");
  const tg = await getTranslations("guides");
  const pages = await getTranslations("pages");

  const dash = await getDashboard(undefined, locale);
  const guides = (await listGuides()).slice(0, 3);
  const faq = [1, 2, 3, 4, 5].map((i) => ({ q: t(`faq${i}q`), a: t(`faq${i}a`) }));
  const marquee = L.raw("marquee") as string[];

  return (
    <>
      <PageCtx page="home" title={pages("home")} />
      <JsonLd
        data={[
          { "@context": "https://schema.org", "@type": "Organization", name: "Consul", url: SITE_URL, logo: `${SITE_URL}/logo/consul-icon-512.png` },
          { "@context": "https://schema.org", "@type": "WebSite", name: "Consul", url: `${SITE_URL}/${locale}`, inLanguage: locale },
          { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
        ]}
      />

      {/* ───────── HERO ───────── */}
      <section className="relative overflow-hidden bg-graphite-900 text-white">
        <GlowGrid />
        <Container className="relative grid items-center gap-14 pb-14 pt-12 lg:grid-cols-[1.15fr_1fr] lg:gap-12 lg:pb-20 lg:pt-20">
          <div className="animate-rise">
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-ondark">
              <span className="h-px w-8 bg-brand-400" aria-hidden /> {L("heroKicker")}
            </p>
            <h1 className="mt-6 text-[38px] font-semibold leading-[1.0] tracking-[-0.035em] sm:text-[52px] lg:text-[68px]">
              {L("h1Lead")} <span className="relative whitespace-nowrap text-brand-400">{L("h1Accent")}</span> {L("h1Tail")}
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ondark">{t("sub")}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Magnetic>
                <ButtonLink href="/login" size="lg" className="h-14 rounded-full px-7 text-base">{t("ctaCheck")} <ArrowRight size={18} aria-hidden /></ButtonLink>
              </Magnetic>
              <ButtonLink href="/tools/credit" variant="onDark" size="lg" className="h-14 rounded-full px-7 text-base">{t("ctaCredit")}</ButtonLink>
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ondark">
              {["check1", "check2", "check3"].map((k) => (
                <li key={k} className="flex items-center gap-1.5"><Check size={15} className="text-[#9AD9B4]" aria-hidden />{L(k)}</li>
              ))}
            </ul>
          </div>
          <HeroCard amount={dash.safeToSpend.amount} />
        </Container>

        <div className="relative border-y border-white/10 py-4 text-sm font-medium text-white/70">
          <Marquee items={marquee} />
        </div>

        <Container className="relative grid grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`py-8 ${i > 1 ? "lg:border-l lg:border-white/10 lg:pl-8" : ""} ${i % 2 === 0 ? "border-l border-white/10 pl-6 lg:pl-8" : ""}`}>
              <Scramble text={L(`stat${i}v`)} chars="0123456789" className="text-3xl font-semibold tracking-tight lg:text-[40px]" />
              <p className="mt-1 text-sm text-ondark">{L(`stat${i}`)}</p>
            </div>
          ))}
        </Container>
      </section>

      {/* ───────── 01 БОЛЬ ───────── */}
      <section className="py-20 lg:py-28">
        <Container>
          <SectionMark n="01" label={L("sec1")} />
          <H2 className="mt-8 max-w-3xl">{t("painTitle")}</H2>
          <div className="mt-12 grid border-t border-graphite-900 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Reveal key={i} delay={i * 120} className={`py-8 md:py-10 ${i > 1 ? "border-t border-gray-200 md:border-l md:border-t-0 md:pl-8" : ""} md:pr-8`}>
                <p className="num text-sm text-brand-500">0{i}</p>
                <blockquote className="mt-4 text-2xl font-semibold leading-[1.2] tracking-[-0.015em]">«{t(`pain${i}`)}»</blockquote>
                <p className="mt-4 text-[15px] leading-relaxed text-gray-700">{t(`pain${i}Text`)}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ───────── 02 СЦЕНА С ТЕЛЕФОНОМ ───────── */}
      <PhoneStory />

      {/* ───────── 03 ДЕНЬГИ ───────── */}
      <section className="py-20 lg:py-28">
        <Container>
          <SectionMark n="03" label={L("sec3")} />
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-center">
            <Reveal>
              <H2>{t("exampleTitle")}</H2>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-gray-700">{t("exampleText")}</p>
              <p className="mt-8 flex items-baseline gap-3">
                <Scramble text="12%" chars="0123456789" className="text-[64px] font-bold leading-none tracking-tight text-brand-500 lg:text-[88px]" />
                <span className="max-w-[12rem] text-sm text-gray-700">{L("wfNote")}</span>
              </p>
            </Reveal>
            <Reveal delay={150}>
              <Waterfall rows={[
                { label: t("exRevenue").split(" (")[0], value: 50_000_000 },
                { label: t("exPurchase"), value: -32_000_000 },
                { label: t("exOpex"), value: -12_000_000 },
                { label: t("exProfit"), value: 6_000_000 },
              ]} />
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ───────── МАНИФЕСТ ───────── */}
      <section className="border-y border-gray-200 bg-mist py-16 lg:py-24">
        <Container>
          <Reveal>
            <p className="max-w-5xl text-[26px] font-semibold leading-[1.15] tracking-[-0.02em] sm:text-[36px] lg:text-[48px]">
              <span className="text-brand-500">«</span>{L("manifesto")}<span className="text-brand-500">»</span>
            </p>
            <p className="mt-6 text-sm font-medium uppercase tracking-[0.18em] text-gray-700">— {L("manifestoBy")}</p>
          </Reveal>
        </Container>
      </section>

      {/* ───────── 04 КАК РАБОТАЕТ ───────── */}
      <section className="py-20 lg:py-28">
        <Container>
          <SectionMark n="04" label={L("sec4")} />
          <H2 className="mt-8">{t("howTitle")}</H2>
          <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {[{ i: 1, Icon: Upload }, { i: 2, Icon: BarChart3 }, { i: 3, Icon: MessageCircleQuestion }].map(({ i, Icon }) => (
              <Reveal as="li" key={i} delay={i * 140}>
                <div className="flex items-center gap-4">
                  <span className="num text-[56px] font-semibold leading-none tracking-tight text-gray-200">0{i}</span>
                  <span className="grid size-11 place-items-center rounded-full bg-graphite-900 text-white"><Icon size={20} aria-hidden /></span>
                </div>
                <h3 className="mt-6 text-xl font-semibold leading-snug">{t(`how${i}`)}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-gray-700">{t(`how${i}Text`)}</p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      {/* ───────── 05 ИНСТРУМЕНТЫ (bento + spotlight) ───────── */}
      <section className="pb-20 lg:pb-28">
        <Container>
          <SectionMark n="05" label={L("sec5")} />
          <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
            <div><H2>{t("toolsTitle")}</H2><p className="mt-3 text-lg text-gray-700">{t("toolsSub")}</p></div>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3 md:grid-rows-2">
            <Reveal className="md:row-span-2">
              <Link href="/tools/credit" className="block h-full">
                <Spotlight color="rgba(224,86,109,0.22)" className="flex h-full min-h-[320px] flex-col rounded-block bg-graphite-900 p-7 text-white lg:p-9">
                  <div className="flex items-center justify-between">
                    <span className="grid size-12 place-items-center rounded-[14px] bg-white/10"><Calculator size={22} aria-hidden /></span>
                    <ArrowUpRight size={22} className="transition-transform group-hover/spot:-translate-y-1 group-hover/spot:translate-x-1" aria-hidden />
                  </div>
                  <p className="mt-auto pt-12 text-sm text-ondark">{L("toolCredit")}</p>
                  <Scramble text="2 643 555" className="mt-1 text-[44px] font-bold leading-none tracking-tight text-brand-400 lg:text-[56px]" />
                  <h3 className="mt-6 text-2xl font-semibold">{tt("creditTitle")}</h3>
                  <p className="mt-1 text-ondark">{tt("creditDesc")}</p>
                </Spotlight>
              </Link>
            </Reveal>
            {[
              { href: "/tools/tax-regime", Icon: Scale, k: "tax", prev: L("toolTax") },
              { href: "/tools/markup", Icon: Percent, k: "markup", prev: L("toolMarkup") },
            ].map(({ href, Icon, k, prev }, idx) => (
              <Reveal key={href} delay={(idx + 1) * 120} className="md:col-span-2">
                <Link href={href} className="block h-full">
                  <Spotlight className="flex h-full items-center gap-6 rounded-block border border-gray-200 bg-white p-6 lg:p-8">
                    <span className="grid size-14 shrink-0 place-items-center rounded-[16px] bg-mist"><Icon size={24} aria-hidden /></span>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{tt(`${k}Title`)}</h3>
                      <p className="mt-1 text-[15px] text-gray-700">{tt(`${k}Desc`)}</p>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-brand-500">{prev}</p>
                    </div>
                    <ArrowUpRight size={22} className="shrink-0 transition-transform group-hover/spot:-translate-y-1 group-hover/spot:translate-x-1" aria-hidden />
                  </Spotlight>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ───────── 06 ДОВЕРИЕ ───────── */}
      <section className="py-20 lg:py-28">
        <Container>
          <SectionMark n="06" label={L("sec7")} />
          <H2 className="mt-8 max-w-3xl">{t("trustTitle")}</H2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-block border border-gray-200 bg-gray-200 md:grid-cols-3">
            {[{ i: 1, Icon: Sparkles }, { i: 2, Icon: Lock }, { i: 3, Icon: ShieldCheck }].map(({ i, Icon }) => (
              <Spotlight key={i} className="bg-white p-7 lg:p-9">
                <Icon size={26} className="text-brand-500" aria-hidden />
                <h3 className="mt-6 text-lg font-semibold leading-snug">{t(`trust${i}`)}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-gray-700">{t(`trust${i}Text`)}</p>
              </Spotlight>
            ))}
          </div>
        </Container>
      </section>

      {/* ───────── 07 ГАЙДЫ ───────── */}
      <section className="pb-20 lg:pb-28">
        <Container>
          <SectionMark n="07" label={L("sec8")} />
          <div className="mt-8 flex items-end justify-between gap-4">
            <H2>{t("guidesTitle")}</H2>
            <Link href="/guides" className="hidden text-sm font-medium text-brand-500 hover:underline sm:block">{t("guidesAll")} →</Link>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {guides.map((g, i) => (
              <Reveal key={g.slug} delay={i * 120}>
                <Link href={`/guides/${g.slug}`} className="group block h-full overflow-hidden rounded-block border border-gray-200 transition-colors hover:border-graphite-900">
                  <div className="relative h-48 overflow-hidden">
                    <GuideCover guide={g} className="transition-transform duration-700 group-hover:scale-[1.04]" />
                    <span className="absolute left-4 top-4 rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-gray-700 shadow-soft">{g.tag[locale]}</span>
                    <span className="num absolute bottom-3 right-4 text-xs font-semibold text-gray-500">0{i + 1}</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold leading-snug group-hover:underline group-hover:decoration-brand-500 group-hover:underline-offset-4">{g.title[locale]}</h3>
                    <p className="mt-2 text-sm text-gray-700">{g.description[locale]}</p>
                    <p className="mt-4 text-xs font-medium uppercase tracking-[0.14em] text-gray-700">{tg("readMin", { n: g.readMinutes })}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ───────── 08 FAQ ───────── */}
      <section className="bg-mist py-20 lg:py-28">
        <Container>
          <SectionMark n="08" label={L("sec9")} />
          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1.6fr]">
            <H2>{t("faqTitle")}</H2>
            <div className="border-t border-graphite-900">
              {faq.map((f, i) => (
                <details key={i} className="faq group border-b border-gray-200">
                  <summary className="flex min-h-[72px] cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-medium [&::-webkit-details-marker]:hidden">
                    <span className="flex gap-4"><span className="num text-sm text-brand-500">0{i + 1}</span>{f.q}</span>
                    <span className="grid size-9 shrink-0 place-items-center rounded-full border border-gray-200 text-xl leading-none transition-transform duration-300 group-open:rotate-45 group-open:border-graphite-900 group-open:bg-graphite-900 group-open:text-white" aria-hidden>+</span>
                  </summary>
                  <p className="max-w-2xl pb-6 pl-9 text-[15px] leading-relaxed text-gray-700">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ───────── ФИНАЛ ───────── */}
      <section className="py-20 lg:py-28">
        <Container>
          <div className="relative overflow-hidden rounded-[36px] bg-graphite-900 p-8 text-white sm:p-12 lg:p-20">
            <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full bg-brand-500/25 blur-[120px]" />
            <MarkLarge className="absolute -bottom-12 -right-12 size-64 lg:size-96" />
            <div className="relative max-w-2xl">
              <h2 className="text-[34px] font-semibold leading-[1.02] tracking-[-0.03em] lg:text-[64px]">{t("finalTitle")}</h2>
              <p className="mt-5 text-lg text-ondark">{t("finalText")}</p>
              <Magnetic className="mt-10">
                <ButtonLink href="/login" size="lg" className="h-14 rounded-full px-8 text-base">{t("finalCta")} <ArrowRight size={18} aria-hidden /></ButtonLink>
              </Magnetic>
              <p className="mt-5 text-sm text-ondark">{L("finalNote")}</p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

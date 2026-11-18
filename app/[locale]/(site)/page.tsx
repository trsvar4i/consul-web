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
import { AskButton } from "@/components/assistant/WhyButton";
import { GlowGrid } from "@/components/fx/GlowGrid";
import { CreditCta } from "@/components/home/CreditCta";
import { NotebookSwitch } from "@/components/home/NotebookSwitch";
import { GuideCover } from "@/components/brand/GuideCover";

export async function generateMetadata({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMeta(locale, "/", t("homeTitle"), t("homeDesc"));
}

const H2 = ({ children, dark = false, className = "" }: { children: React.ReactNode; dark?: boolean; className?: string }) => (
  <h2 className={`text-[28px] font-semibold leading-[1.06] tracking-[-0.025em] text-balance sm:text-[36px] lg:text-[52px] ${dark ? "text-white" : "text-graphite-900"} ${className}`}>{children}</h2>
);

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale: l } = await params;
  setRequestLocale(l);
  const locale = l as Locale;
  const t = await getTranslations("home");
  const L = await getTranslations("landing");
  const N = await getTranslations("notebook");
  const tt = await getTranslations("tools");
  const tg = await getTranslations("guides");
  const pages = await getTranslations("pages");

  const dash = await getDashboard(undefined, locale);
  const guides = (await listGuides()).slice(0, 3);
  const faq = [1, 2, 3, 4, 5, 6].map((i) => ({ q: t(`faq${i}q`), a: t(`faq${i}a`) }));
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
          <div className="min-w-0 animate-rise">
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-ondark">
              <span className="h-px w-8 bg-brand-400" aria-hidden /> {L("heroKicker")}
            </p>
            <h1 className="mt-6 text-[34px] font-semibold leading-[1.04] text-balance tracking-[-0.035em] sm:text-[52px] lg:text-[68px]">
              {L("h1Lead")} <span className="relative text-brand-400 sm:whitespace-nowrap">{L("h1Accent")}</span> {L("h1Tail")}
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ondark">{t("sub")}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink href="/login" size="lg" className="group h-14 rounded-full px-7 text-base">
                {t("ctaCheck")} <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
              </ButtonLink>
              <CreditCta label={t("ctaCredit")} />
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

      {/* ───────── 01 ТЕТРАДЬ → CONSUL ───────── */}
      <section className="py-14 sm:py-20 lg:py-28">
        <Container>
          <SectionMark n="01" label={L("sec1")} />
          <div className="mt-8 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
            <Reveal className="lg:sticky lg:top-28">
              <H2>{N("title")}</H2>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-gray-700">{N("sub")}</p>
            </Reveal>
            <Reveal delay={120}><NotebookSwitch /></Reveal>
          </div>
        </Container>
      </section>

      {/* ───────── 02 СЦЕНА С ТЕЛЕФОНОМ ───────── */}
      <PhoneStory />

      {/* ───────── 03 ДЕНЬГИ ───────── */}
      <section className="py-14 sm:py-20 lg:py-28">
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

      {/* ───────── 04 КАК РАБОТАЕТ ───────── */}
      <section className="py-14 sm:py-20 lg:py-28">
        <Container>
          <SectionMark n="04" label={L("sec4")} />
          <H2 className="mt-8">{t("howTitle")}</H2>
          <ol className="mt-8 grid gap-8 sm:mt-12 md:grid-cols-3 md:gap-8">
            {[{ i: 1, Icon: Upload }, { i: 2, Icon: BarChart3 }, { i: 3, Icon: MessageCircleQuestion }].map(({ i, Icon }) => (
              <Reveal as="li" key={i} delay={i * 140}>
                <div className="flex items-center gap-4">
                  <span className="num text-[40px] font-semibold leading-none tracking-tight text-gray-200 sm:text-[56px]">0{i}</span>
                  <span className="grid size-11 place-items-center rounded-full bg-graphite-900 text-white"><Icon size={20} aria-hidden /></span>
                </div>
                <h3 className="mt-4 text-xl font-semibold leading-snug sm:mt-6">{t(`how${i}`)}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-gray-700">{t(`how${i}Text`)}</p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      {/* ───────── 05 ИНСТРУМЕНТЫ (bento + spotlight) ───────── */}
      <section className="pb-14 sm:pb-20 lg:pb-28">
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
                  <Scramble text="2 643 555" className="mt-auto pt-10 text-[44px] font-bold leading-none tracking-tight text-brand-400 lg:text-[56px]" />
                  <p className="mt-1 text-sm text-ondark">{L("toolCreditNote")}</p>
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
                  <Spotlight className="flex h-full flex-wrap items-start gap-x-6 gap-y-4 rounded-block border border-gray-200 bg-white p-6 sm:flex-nowrap sm:items-center lg:p-8">
                    <span className="grid size-14 shrink-0 place-items-center rounded-[16px] bg-mist"><Icon size={24} aria-hidden /></span>
                    <div className="order-3 w-full sm:order-none sm:w-auto sm:flex-1">
                      <h3 className="text-xl font-semibold">{tt(`${k}Title`)}</h3>
                      <p className="mt-1 text-[15px] text-gray-700">{tt(`${k}Desc`)}</p>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-brand-500">{prev}</p>
                    </div>
                    <ArrowUpRight size={22} className="ml-auto shrink-0 transition-transform group-hover/spot:-translate-y-1 group-hover/spot:translate-x-1 sm:ml-0" aria-hidden />
                  </Spotlight>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ───────── 06 ДОВЕРИЕ ───────── */}
      <section className="py-14 sm:py-20 lg:py-28">
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
      <section className="pb-14 sm:pb-20 lg:pb-28">
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
                    <span className="num absolute bottom-3 right-4 text-xs font-semibold text-gray-500">0{i + 1}</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold leading-snug group-hover:underline group-hover:decoration-brand-500 group-hover:underline-offset-4">{g.title[locale]}</h3>
                    <p className="mt-2 text-sm text-gray-700">{g.description[locale]}</p>
                    <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-700"><span className="rounded-full bg-mist px-2.5 py-1 text-xs font-medium text-graphite-900">{g.tag[locale]}</span>{tg("readMin", { n: g.readMinutes })}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ───────── 08 FAQ ───────── */}
      <section className="bg-mist py-14 sm:py-20 lg:py-28">
        <Container>
          <SectionMark n="08" label={L("sec9")} />
          <div className="mt-10 grid gap-10 lg:grid-cols-[5fr_7fr] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <H2>{t("faqTitle")}</H2>
              <p className="mt-5 max-w-sm text-[17px] leading-relaxed text-gray-700">{L("faqSide")}</p>
              <AskButton className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-graphite-900 px-6 font-medium text-white transition-colors hover:bg-graphite-800">
                <MessageCircleQuestion size={18} aria-hidden /> {L("faqAsk")}
              </AskButton>
            </div>
            <div className="divide-y divide-gray-200 border-y border-gray-200">
              {faq.map((f, i) => (
                <details key={i} className="faq group">
                  <summary className="grid min-h-[76px] cursor-pointer list-none grid-cols-[2.5rem_1fr_auto] items-center gap-3 py-5 [&::-webkit-details-marker]:hidden">
                    <span className="num text-sm text-brand-500">0{i + 1}</span>
                    <span className="text-[17px] font-medium leading-snug lg:text-lg">{f.q}</span>
                    <span className="grid size-9 place-items-center rounded-full border border-gray-200 bg-white text-xl leading-none transition-[transform,background-color,color,border-color] duration-300 group-open:rotate-45 group-open:border-graphite-900 group-open:bg-graphite-900 group-open:text-white" aria-hidden>+</span>
                  </summary>
                  <p className="max-w-xl pb-6 pl-[3.25rem] pr-12 text-[15px] leading-relaxed text-gray-700">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ───────── ФИНАЛ ───────── */}
      <section className="py-14 sm:py-20 lg:py-28">
        <Container>
          <div className="relative overflow-hidden rounded-[28px] bg-graphite-900 p-7 text-white sm:rounded-[36px] sm:p-12 lg:p-20">
            <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full bg-brand-500/25 blur-[120px]" />
            <MarkLarge className="absolute -bottom-12 -right-12 hidden size-64 sm:block lg:size-96" />
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

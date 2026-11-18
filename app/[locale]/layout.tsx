import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { AssistantProvider } from "@/lib/assistant-context";
import { ChatWidget } from "@/components/assistant/ChatWidget";
import { ToastProvider } from "@/components/ui/toast";
import { SITE_URL } from "@/lib/seo";
import "../globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#22262C",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("homeTitle"), template: "%s" },
    description: t("homeDesc"),
    applicationName: "Consul",
    openGraph: { siteName: "Consul", locale: locale === "uz" ? "uz_UZ" : "ru_RU", type: "website" },
    twitter: { card: "summary_large_image" },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={inter.variable}>
      <body className="min-h-dvh bg-white text-graphite-900 antialiased">
        <NextIntlClientProvider>
          <ToastProvider>
            <AssistantProvider>
              {children}
              <ChatWidget />
            </AssistantProvider>
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://consul.uz";

/** canonical + hreflang (uz, ru, x-default → uz) + Open Graph для страницы. */
export function pageMeta(locale: string, path: string, title: string, description: string): Metadata {
  const p = path === "/" ? "" : path;
  const languages: Record<string, string> = {};
  routing.locales.forEach((l) => (languages[l] = `${SITE_URL}/${l}${p}`));
  languages["x-default"] = `${SITE_URL}/uz${p}`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/${locale}${p}`, languages },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${locale}${p}`,
      siteName: "Consul",
      locale: locale === "uz" ? "uz_UZ" : "ru_RU",
      type: "website",
    },
  };
}

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

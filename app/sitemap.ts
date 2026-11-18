import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { listGuides } from "@/lib/api";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const guides = await listGuides();
  const paths = [
    "", "/tools", "/tools/credit", "/tools/tax-regime", "/tools/markup", "/guides",
    ...guides.map((g) => `/guides/${g.slug}`),
  ];
  return paths.map((p) => ({
    url: `${SITE_URL}/uz${p}`,
    lastModified: new Date("2026-11-17"),
    changeFrequency: "weekly",
    priority: p === "" ? 1 : p.startsWith("/tools") ? 0.9 : 0.7,
    alternates: { languages: Object.fromEntries(routing.locales.map((l) => [l, `${SITE_URL}/${l}${p}`])) },
  }));
}

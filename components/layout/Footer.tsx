import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "../brand/Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { FooterBand } from "./FooterBand";

export const GITHUB_URL = "https://github.com/";

export async function Footer() {
  const t = await getTranslations("footer");
  const n = await getTranslations("nav");
  const tools = await getTranslations("tools");
  return (
    <footer className="bg-graphite-900 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo size={32} tone="dark" />
          <p className="mt-4 max-w-xs text-sm text-ondark">{t("tagline")}</p>
          <div className="mt-5"><LanguageSwitcher onDark /></div>
        </div>
        <div>
          <p className="text-sm font-semibold">{t("sections")}</p>
          <ul className="mt-3 space-y-2 text-sm text-ondark">
            <li><Link className="hover:text-white" href="/tools">{n("tools")}</Link></li>
            <li><Link className="hover:text-white" href="/guides">{n("guides")}</Link></li>
            <li><Link className="hover:text-white" href="/login">{n("login")}</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">{t("tools")}</p>
          <ul className="mt-3 space-y-2 text-sm text-ondark">
            <li><Link className="hover:text-white" href="/tools/credit">{tools("creditTitle")}</Link></li>
            <li><Link className="hover:text-white" href="/tools/tax-regime">{tools("taxTitle")}</Link></li>
            <li><Link className="hover:text-white" href="/tools/markup">{tools("markupTitle")}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-ondark sm:px-6 md:flex-row md:items-center md:justify-between">
          <p>{t("disclaimer")}</p>
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            <span>{t("hackathon")}</span>
            <a className="underline-offset-2 hover:text-white hover:underline" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              {t("openSource")} · {t("github")}
            </a>
          </p>
        </div>
      </div>
      <FooterBand />
    </footer>
  );
}

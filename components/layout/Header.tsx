"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronRight, Menu, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { getSession } from "@/lib/api";
import { Logo } from "../brand/Logo";
import { ButtonLink, cn } from "../ui/primitives";
import { LanguageSwitcher } from "./LanguageSwitcher";

const NAV = [
  { href: "/tools", key: "tools" },
  { href: "/guides", key: "guides" },
  { href: "/chat", key: "assistant" },
  { href: "/app", key: "app" },
] as const;

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- read session from localStorage after mount
  useEffect(() => setLoggedIn(!!getSession()), []);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- close the mobile menu on navigation
  useEffect(() => setMenu(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded-btn focus:bg-white focus:px-3 focus:py-2">
        {t("skip")}
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" aria-label={`Consul — ${t("home")}`} className="shrink-0">
          <Logo size={32} />
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV.map((n) => {
            const active = pathname.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined}
                className={cn("rounded-btn px-3 py-2 text-[15px] font-medium transition-colors", active ? "text-brand-500" : "text-gray-700 hover:text-graphite-900")}>
                {t(n.key)}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:block"><LanguageSwitcher /></div>
          <ButtonLink href={loggedIn ? "/app" : "/login"} size="sm" className="h-10 px-3.5 sm:px-4">
            {loggedIn ? t("myPanel") : t("login")}
          </ButtonLink>
          <button className="grid size-11 place-items-center rounded-btn text-graphite-900 hover:bg-mist md:hidden" aria-label={menu ? t("closeMenu") : t("openMenu")} aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
            {menu ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
          </button>
        </div>
      </div>
      {menu && (
        <>
          <div className="fixed inset-x-0 bottom-0 top-16 z-30 bg-graphite-900/30 md:hidden" onClick={() => setMenu(false)} aria-hidden />
          <nav className="relative z-40 border-t border-gray-200 bg-white px-4 pb-6 pt-2 shadow-soft md:hidden animate-rise" aria-label="Mobile">
            {NAV.map((n) => {
              const active = pathname.startsWith(n.href);
              return (
                <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined}
                  className={cn("flex min-h-14 items-center justify-between border-b border-gray-200 text-lg font-medium", active ? "text-brand-500" : "text-graphite-900")}>
                  {t(n.key)}
                  <ChevronRight size={18} className="text-gray-500" aria-hidden />
                </Link>
              );
            })}
            <div className="mt-5 flex items-center justify-between gap-3">
              <LanguageSwitcher />
              <ButtonLink href={loggedIn ? "/app" : "/login"} className="flex-1">{loggedIn ? t("myPanel") : t("login")}</ButtonLink>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}

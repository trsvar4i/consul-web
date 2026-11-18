"use client";
import { Link, useT, LangSwitch } from "@/components/I18n";
import { Logo } from "@/components/Icons";

export function SiteHeader() { const t = useT();
  return <header className="nav"><div className="wrap"><Link className="logo" href="/"><Logo size={30} />{t("Consul")}</Link>
    <nav className="site-links" aria-label={t("Asosiy navigatsiya")}><Link href="/#imk">{t("Imkoniyatlar")}</Link><Link href="/#steps">{t("Qanday ishlaydi")}</Link><Link href="/kalkulyatorlar">{t("Kalkulyatorlar")}</Link><Link href="/#faq">FAQ</Link></nav><span className="r"><LangSwitch className="lsw" /><Link className="btn sec" href="/kirish">{t("Kirish")}</Link><Link className="btn" href="/kirish?register=1">{t("Boshlash")}</Link></span></div></header>;
}
export function SiteFooter() { const t = useT();
  return <footer><div className="wrap"><span>{t("© 2026 Consul")}</span><span><Link href="/maxfiylik#maxfiylik">{t("Maxfiylik")}</Link> · <Link href="/maxfiylik#rozilik">{t("Rozilik")}</Link></span></div></footer>;
}

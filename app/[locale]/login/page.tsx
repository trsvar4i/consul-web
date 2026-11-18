import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo, MarkLarge } from "@/components/brand/Logo";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { LoginForm } from "@/components/app/LoginForm";

export async function generateMetadata({ params }: PageProps<"/[locale]/login">) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("loginTitle"), robots: { index: false } };
}

export default async function LoginPage({ params }: PageProps<"/[locale]/login">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("login");
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-graphite-900 text-white lg:block" aria-hidden>
        <div className="absolute left-1/2 top-[44%] size-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/15" />
        <MarkLarge className="absolute left-1/2 top-[44%] size-36 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute left-[12%] top-[18%] rounded-[14px] bg-graphite-800 px-4 py-3">
          <p className="text-xs text-ondark">{t("sideSafe")}</p>
          <p className="num mt-0.5 text-lg font-semibold text-brand-400">4 200 000</p>
        </div>
        <div className="absolute right-[12%] top-[30%] rounded-[14px] bg-graphite-800 px-4 py-3">
          <p className="text-xs text-ondark">{t("sideTax")}</p>
          <p className="num mt-0.5 text-lg font-semibold">1%</p>
        </div>
        <div className="absolute left-[16%] top-[64%] rounded-[14px] bg-graphite-800 px-4 py-3">
          <p className="text-xs text-ondark">{t("sideCredit")}</p>
          <p className="num mt-0.5 text-lg font-semibold">{t("sideCreditValue")}</p>
        </div>
        <p className="absolute bottom-10 left-10 max-w-xs text-2xl font-semibold leading-snug">{t("sideTitle")}</p>
      </aside>
      <main id="main" className="flex flex-col bg-mist">
        <div className="flex items-center justify-between p-4 sm:p-6">
          <Link href="/" aria-label="Consul"><Logo size={32} /></Link>
          <LanguageSwitcher />
        </div>
        <div className="flex flex-1 items-center justify-center px-4 pb-16">
          <LoginForm />
        </div>
      </main>
    </div>
  );
}

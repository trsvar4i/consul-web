import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/primitives";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-mist px-4 text-center">
      <Logo size={48} markOnly />
      <h1 className="text-[28px] font-semibold">{t("title")}</h1>
      <p className="text-gray-700">{t("text")}</p>
      <ButtonLink href="/">{t("home")}</ButtonLink>
    </main>
  );
}

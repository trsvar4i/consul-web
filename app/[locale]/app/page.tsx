import { getTranslations } from "next-intl/server";
import { Dashboard } from "@/components/app/Dashboard";

export async function generateMetadata({ params }: PageProps<"/[locale]/app">) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("appTitle") };
}

export default function DashboardPage() {
  return <Dashboard />;
}

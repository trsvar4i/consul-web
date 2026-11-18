import { setRequestLocale } from "next-intl/server";
import { Subscribe } from "@/components/app/Subscribe";

export const metadata = { title: "Consul", robots: { index: false } };

export default async function SubscribePage({ params }: PageProps<"/[locale]/subscribe">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Subscribe />;
}

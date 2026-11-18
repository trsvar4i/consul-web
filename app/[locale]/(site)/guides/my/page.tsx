import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { UserGuidePage } from "@/components/guides/UserGuidePage";

export const metadata = { title: "Consul", robots: { index: false } };

export default async function MyGuidePage({ params }: PageProps<"/[locale]/guides/my">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense>
      <UserGuidePage />
    </Suspense>
  );
}

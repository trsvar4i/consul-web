import { setRequestLocale } from "next-intl/server";
import { Onboarding } from "@/components/app/Onboarding";

export const metadata = { robots: { index: false } };

export default async function OnboardingPage({ params }: PageProps<"/[locale]/onboarding">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Onboarding />;
}

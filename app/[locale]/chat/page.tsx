import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { ChatPage } from "@/components/assistant/ChatPage";

export const metadata = { robots: { index: false } };

export default async function Chat({ params }: PageProps<"/[locale]/chat">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense>
      <ChatPage />
    </Suspense>
  );
}

"use client";
import { useTranslations } from "next-intl";
import { MessageCircle } from "lucide-react";
import { useAssistant } from "@/lib/assistant-context";

export function GuideAsk({ title }: { title: string }) {
  const t = useTranslations("guides");
  const { open } = useAssistant();
  return (
    <div className="flex flex-col gap-4 rounded-block bg-graphite-900 p-6 text-white sm:flex-row sm:items-center sm:justify-between lg:p-8">
      <div>
        <p className="text-xl font-semibold">{t("askTitle")}</p>
        <p className="mt-1 text-ondark">{t("askText")}</p>
      </div>
      <button
        onClick={() => open({ context: { page: "guide", title, data: { title } } })}
        className="inline-flex h-12 shrink-0 items-center gap-2 rounded-btn bg-brand-500 px-5 font-medium text-white hover:bg-brand-600"
      >
        <MessageCircle size={18} aria-hidden /> {t("askBtn")}
      </button>
    </div>
  );
}

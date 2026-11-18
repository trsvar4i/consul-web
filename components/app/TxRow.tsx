"use client";
import { useLocale, useTranslations } from "next-intl";
import type { Locale, Transaction } from "@/lib/types";
import { formatDate, formatNum, pickLang } from "@/lib/format";
import { Badge, cn } from "../ui/primitives";

/** Описание в моках хранится как «uz / ru» — показываем нужную половину. */
export function txDescription(tx: Transaction, locale: Locale) {
  return pickLang(tx.description ?? "", locale);
}

export function TxRow({ tx, onClick }: { tx: Transaction; onClick?: () => void }) {
  const t = useTranslations("operations");
  const locale = useLocale() as Locale;
  const positive = tx.amount > 0;
  const debt = tx.type === "receivable" || tx.type === "payable";
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 py-3 text-left hover:bg-mist/60">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium">{txDescription(tx, locale) || t(`c_${tx.category}`)}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-gray-700">
          <span>{formatDate(tx.date, locale)}</span>·<span>{t(`m_${tx.method}`)}</span>
          <Badge>{debt ? t(`t_${tx.type}`) : t(`c_${tx.category}`)}</Badge>
          {tx.matched === false && <Badge tone="warning">{t("unmatched")}</Badge>}
        </p>
      </div>
      <span className={cn("num shrink-0 text-[15px] font-semibold", debt ? "text-gray-700" : positive ? "text-success" : "text-graphite-900")}>
        {positive ? "+" : "−"}{formatNum(Math.abs(tx.amount))}
      </span>
    </button>
  );
}

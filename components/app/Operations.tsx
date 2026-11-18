"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Camera, FileUp, Plus } from "lucide-react";
import { listTransactions, type TxFilter } from "@/lib/api";
import { usePageContext } from "@/lib/assistant-context";
import { useData } from "@/lib/use-data";
import type { Locale } from "@/lib/types";
import { formatDate, formatMonth, formatNum } from "@/lib/format";
import { EmptyState, ErrorState } from "../brand/blocks";
import { Badge, Button, ButtonLink, Card, cn, Select, Skeleton } from "../ui/primitives";
import { useApp } from "./AppShell";
import { TxRow, txDescription } from "./TxRow";

type Tab = NonNullable<TxFilter["type"]>;
const MONTHS = ["2026-11", "2026-10", "2026-09"];

export function Operations() {
  const t = useTranslations("operations");
  const pages = useTranslations("pages");
  const locale = useLocale() as Locale;
  const sp = useSearchParams();
  const { version, openAdd } = useApp();
  const [tab, setTab] = useState<Tab>((sp.get("tab") as Tab) ?? "all");
  const [month, setMonth] = useState<string>("");

  usePageContext({ page: "operations", title: pages("operations") });
  const q = useData(() => listTransactions({ type: tab, month: month || undefined }), [tab, month, version]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[22px] font-semibold tracking-tight lg:text-[28px]">{t("h1")}</h1>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
          <Button onClick={() => openAdd()} className="hidden sm:inline-flex"><Plus size={18} aria-hidden /> {t("add").replace("+ ", "")}</Button>
          <ButtonLink href="/app/operations/import" variant="secondary" className="px-3"><FileUp size={18} aria-hidden /> {t("import")}</ButtonLink>
          <ButtonLink href="/app/operations/import" variant="secondary" className="px-3"><Camera size={18} aria-hidden /> {t("photoShort")}</ButtonLink>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label={t("h1")} className="flex gap-1 overflow-x-auto rounded-btn bg-white p-1 border border-gray-200">
          {(["all", "income", "expense", "debts"] as Tab[]).map((k) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
              className={cn("min-h-10 whitespace-nowrap rounded-[8px] px-4 text-sm font-medium", tab === k ? "bg-graphite-900 text-white" : "text-gray-700 hover:text-graphite-900")}>
              {t(k)}
            </button>
          ))}
        </div>
        <label className="sr-only" htmlFor="op-month">{t("month")}</label>
        <Select id="op-month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-auto min-w-40 bg-white">
          <option value="">{t("allMonths")}</option>
          {MONTHS.map((m) => <option key={m} value={m}>{formatMonth(m, locale)}</option>)}
        </Select>
        {q.data && <span className="text-sm text-gray-700">{t("count", { n: q.data.length })}</span>}
      </div>

      <Card className="overflow-hidden">
        {q.loading && !q.data ? (
          <div className="space-y-2 p-4">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : q.error ? (
          <ErrorState onRetry={q.retry} />
        ) : !q.data || q.data.length === 0 ? (
          <EmptyState title={t("empty")} text={t("emptyText")}>
            <Button onClick={() => openAdd()}>{t("add")}</Button>
            <ButtonLink href="/app/operations/import" variant="secondary">{t("import")}</ButtonLink>
          </EmptyState>
        ) : (
          <>
            {/* desktop: table */}
            <table className="hidden w-full text-[15px] md:table">
              <thead className="bg-mist text-left text-sm text-gray-700">
                <tr>
                  <th className="px-4 py-3 font-medium">{t("date")}</th>
                  <th className="px-4 py-3 font-medium">{t("description")}</th>
                  <th className="px-4 py-3 font-medium">{t("category")}</th>
                  <th className="px-4 py-3 font-medium">{t("method")}</th>
                  <th className="px-4 py-3 text-right font-medium">{t("amount")}</th>
                </tr>
              </thead>
              <tbody>
                {q.data.map((tx) => {
                  const debt = tx.type === "receivable" || tx.type === "payable";
                  return (
                    <tr key={tx.id} className="cursor-pointer border-t border-gray-200 hover:bg-mist/60" onClick={() => openAdd(tx)}>
                      <td className="whitespace-nowrap px-4 py-3 num">{formatDate(tx.date, locale)}</td>
                      <td className="px-4 py-3">
                        <button className="text-left hover:underline" onClick={(e) => { e.stopPropagation(); openAdd(tx); }}>{txDescription(tx, locale) || t(`c_${tx.category}`)}</button>
                        {tx.matched === false && <Badge tone="warning" className="ml-2">{t("unmatched")}</Badge>}
                      </td>
                      <td className="px-4 py-3"><Badge>{debt ? t(`t_${tx.type}`) : t(`c_${tx.category}`)}</Badge></td>
                      <td className="px-4 py-3 text-gray-700">{t(`m_${tx.method}`)}</td>
                      <td className={cn("whitespace-nowrap px-4 py-3 text-right font-semibold num", debt ? "text-gray-700" : tx.amount > 0 ? "text-success" : "text-graphite-900")}>
                        {tx.amount > 0 ? "+" : "−"}{formatNum(Math.abs(tx.amount))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* mobile: cards */}
            <ul className="divide-y divide-gray-200 px-4 md:hidden">
              {q.data.map((tx) => <li key={tx.id}><TxRow tx={tx} onClick={() => openAdd(tx)} /></li>)}
            </ul>
          </>
        )}
      </Card>
    </div>
  );
}

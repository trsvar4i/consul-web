"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, Undo2 } from "lucide-react";
import { getReconcile, RECONCILE_SUMMARY, setReconcileStatus } from "@/lib/api";
import { usePageContext } from "@/lib/assistant-context";
import { useData } from "@/lib/use-data";
import type { Locale, ReconcileItem, ReconcileStatus } from "@/lib/types";
import { formatDate, formatNum, formatSom } from "@/lib/format";
import { EmptyState, ErrorState } from "../brand/blocks";
import { Card, Skeleton } from "../ui/primitives";
import { useApp } from "./AppShell";

const OPTIONS: Exclude<ReconcileStatus, "unmatched">[] = ["sale", "loan", "debt_return", "own_transfer", "other"];

export function Reconcile() {
  const t = useTranslations("reconcile");
  const pages = useTranslations("pages");
  const locale = useLocale() as Locale;
  const { refresh } = useApp();
  const q = useData(() => getReconcile(), []);
  const [items, setItems] = useState<ReconcileItem[]>([]);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- local copy for optimistic updates
  useEffect(() => { if (q.data) setItems(q.data); }, [q.data]);

  const done = items.filter((i) => i.status !== "unmatched");
  const open = items.filter((i) => i.status === "unmatched");
  const diff = RECONCILE_SUMMARY.statement - RECONCILE_SUMMARY.booked;

  usePageContext({ page: "reconcile", title: pages("reconcile"), summary: t("progress", { done: done.length, total: items.length }), data: { unmatched: open.length, diff } });

  const set = async (id: string, status: ReconcileStatus) => {
    setItems((all) => all.map((x) => (x.id === id ? { ...x, status } : x)));
    await setReconcileStatus(id, status);
    refresh();
  };

  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight lg:text-[28px]">{t("h1")}</h1>
        <p className="mt-1 text-gray-700">{t("intro")}</p>
      </div>

      <Card className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
        <div><p className="text-sm text-gray-700">{t("statement")}</p><p className="num mt-1 text-xl font-semibold">{formatNum(RECONCILE_SUMMARY.statement)}</p></div>
        <div><p className="text-sm text-gray-700">{t("booked")}</p><p className="num mt-1 text-xl font-semibold">{formatNum(RECONCILE_SUMMARY.booked)}</p></div>
        <div><p className="text-sm text-gray-700">{t("diff")}</p><p className="num mt-1 text-xl font-bold">{formatSom(diff, locale)}</p></div>
        <p className="rounded-btn bg-mist p-3 text-[15px] sm:col-span-3">{t("note")}</p>
      </Card>

      {q.error ? (
        <Card><ErrorState onRetry={q.retry} /></Card>
      ) : q.loading && !q.data ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-28" />)}</div>
      ) : items.length === 0 ? (
        <Card><EmptyState title={t("empty")} icon={CheckCircle2} /></Card>
      ) : (
        <>
          <div>
            <div className="flex items-center justify-between text-sm">
              <h2 className="text-base font-semibold">{t("listTitle")}</h2>
              <span className="num font-medium" aria-live="polite">{t("progress", { done: done.length, total: items.length })}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
              <div className="h-full rounded-full bg-success transition-[width] duration-300" style={{ width: `${(done.length / items.length) * 100}%` }} />
            </div>
          </div>

          {open.length === 0 ? (
            <Card className="flex items-center gap-3 p-5"><CheckCircle2 className="text-success" aria-hidden /> <p className="font-medium">{t("allDone")}</p></Card>
          ) : (
            <ul className="space-y-3">
              {open.map((it) => (
                <li key={it.id}>
                  <Card className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="num text-lg font-semibold">+{formatNum(it.amount)}</p>
                      <p className="text-sm text-gray-700">{formatDate(it.date, locale)} · {it.counterpartyMasked}</p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={formatNum(it.amount)}>
                      {OPTIONS.map((o) => (
                        <button key={o} onClick={() => void set(it.id, o)}
                          className="min-h-11 rounded-full border border-gray-200 px-4 text-sm font-medium hover:border-graphite-900 hover:bg-mist">
                          {t(`s_${o}`)}
                        </button>
                      ))}
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}

          {done.length > 0 && (
            <section>
              <h2 className="text-base font-semibold">{t("matchedTitle")}</h2>
              <ul className="mt-2 divide-y divide-gray-200 rounded-card border border-gray-200 bg-white">
                {done.map((it) => (
                  <li key={it.id} className="flex items-center gap-3 px-4 py-3">
                    <CheckCircle2 size={20} className="shrink-0 text-success" aria-hidden />
                    <span className="num font-medium">+{formatNum(it.amount)}</span>
                    <span className="flex-1 truncate text-sm text-gray-700">{t(`s_${it.status}`)} · {formatDate(it.date, locale)}</span>
                    <button onClick={() => void set(it.id, "unmatched")} className="inline-flex min-h-10 items-center gap-1 rounded-btn px-2 text-sm text-gray-700 hover:bg-mist">
                      <Undo2 size={15} aria-hidden /> {t("undo")}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}

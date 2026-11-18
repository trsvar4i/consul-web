import { getTranslations, setRequestLocale } from "next-intl/server";
import { AlertTriangle, Download, Pencil } from "lucide-react";
import { formatNum } from "@/lib/format";
import { Badge, Card } from "@/components/ui/primitives";
import { MarkStep } from "@/components/app/MarkStep";

// P2: показываем готовый пример бизнес-плана из цифр демо-бизнеса.
export default async function PlanPage({ params }: PageProps<"/[locale]/app/plan">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("plan");
  const ac = await getTranslations("appCredit");
  const c = await getTranslations("common");
  const months = Array.from({ length: 12 }, (_, i) => i);
  const base = 50_000_000;
  const rows = [
    { k: ac("s_pess"), f: 0.8 },
    { k: ac("s_base"), f: 1.08 },
    { k: ac("s_opt"), f: 1.15 },
  ];
  return (
    <div className="max-w-4xl space-y-5">
      <MarkStep step="plan" />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight lg:text-[28px]">{t("h1")}</h1>
          <p className="mt-1 text-gray-700">{t("intro")}</p>
        </div>
        <div className="flex gap-2">
          <button disabled className="inline-flex h-11 items-center gap-2 rounded-btn border border-gray-200 bg-white px-4 text-sm font-medium opacity-60"><Pencil size={16} aria-hidden /> {t("edit")}</button>
          <button disabled className="inline-flex h-11 items-center gap-2 rounded-btn bg-graphite-900 px-4 text-sm font-medium text-white opacity-60"><Download size={16} aria-hidden /> {t("pdf")} <Badge>{c("soon")}</Badge></button>
        </div>
      </div>
      <Card className="divide-y divide-gray-200">
        <section className="p-5 sm:p-6"><h2 className="font-semibold">{t("summary")}</h2><p className="mt-2 text-[15px]">{t("summaryText")}</p></section>
        <section className="p-5 sm:p-6"><h2 className="font-semibold">{t("goal")}</h2><p className="mt-2 text-[15px]">{t("goalText")}</p></section>
        <section className="p-5 sm:p-6">
          <h2 className="font-semibold">{t("assumptions")}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px]">{["a1", "a2", "a3"].map((k) => <li key={k}>{t(k)}</li>)}</ul>
        </section>
        <section className="p-5 sm:p-6">
          <h2 className="font-semibold">{t("forecast")} · {t("scenarios")}</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm num">
              <thead className="text-left text-gray-700">
                <tr><th className="py-2 pr-4 font-medium" />{months.filter((m) => m % 3 === 0).map((m) => <th key={m} className="py-2 pr-4 text-right font-medium">{m + 1}</th>)}<th className="py-2 text-right font-medium">Σ</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.k} className="border-t border-gray-200">
                    <td className="py-2 pr-4 font-medium">{r.k}</td>
                    {months.filter((m) => m % 3 === 0).map((m) => <td key={m} className="py-2 pr-4 text-right">{formatNum(base * r.f * (1 + m * 0.004))}</td>)}
                    <td className="py-2 text-right font-semibold">{formatNum(months.reduce((s, m) => s + base * r.f * (1 + m * 0.004), 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="p-5 sm:p-6">
          <h2 className="font-semibold">{t("risks")}</h2>
          <ul className="mt-2 space-y-1.5 text-[15px]">
            {["r1", "r2", "r3"].map((k) => <li key={k} className="flex gap-2"><AlertTriangle size={17} className="mt-0.5 shrink-0 text-warning" aria-hidden />{t(k)}</li>)}
          </ul>
        </section>
        <section className="p-5 sm:p-6"><h2 className="font-semibold">{t("need")}</h2><p className="mt-2 text-[15px]">{t("needText")}</p></section>
      </Card>
    </div>
  );
}

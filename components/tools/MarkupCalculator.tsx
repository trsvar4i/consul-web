"use client";
import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { marginPct, markupFromPrice, priceFromMarkup, unitsToCover } from "@/lib/calc/markup";
import { formatNum, formatSom } from "@/lib/format";
import { MoneyInput } from "../brand/MoneyInput";
import { Banner } from "../brand/blocks";
import { Segmented } from "../ui/segmented";
import { StickyResult } from "./StickyResult";
import { Card, Input, Label } from "../ui/primitives";

export function MarkupCalculator() {
  const t = useTranslations("markup");
  const locale = useLocale();
  const formRef = useRef<HTMLDivElement>(null);
  const resRef = useRef<HTMLDivElement>(null);
  const [cost, setCost] = useState<number | undefined>(50_000);
  const [mode, setMode] = useState<"markup" | "price">("markup");
  const [markup, setMarkup] = useState(35);
  const [price, setPrice] = useState<number | undefined>(67_500);
  const [expenses, setExpenses] = useState<number | undefined>(12_000_000);

  const c = cost ?? 0;
  const p = mode === "markup" ? priceFromMarkup(c, markup) : price ?? 0;
  const mk = mode === "markup" ? markup : markupFromPrice(c, p);
  const mg = marginPct(c, p);
  const units = unitsToCover(expenses ?? 0, c, p);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div ref={formRef}>
      <Card className="space-y-5 p-5 sm:p-6">
        <MoneyInput label={t("cost")} value={cost} onChange={setCost} />
        <div>
          <p className="mb-1.5 text-sm font-medium">{t("mode")}</p>
          <Segmented label={t("mode")} value={mode} onChange={setMode} options={[{ value: "markup", label: t("byMarkup") }, { value: "price", label: t("byPrice") }]} />
        </div>
        {mode === "markup" ? (
          <div>
            <Label htmlFor="mk">{t("markup")}</Label>
            <Input id="mk" type="number" inputMode="decimal" className="num" value={markup} onChange={(e) => setMarkup(Number(e.target.value))} />
          </div>
        ) : (
          <MoneyInput label={t("price")} value={price} onChange={setPrice} />
        )}
        <MoneyInput label={t("expenses")} value={expenses} onChange={setExpenses} />
      </Card>
      </div>
      <div ref={resRef} className="scroll-mt-24 space-y-4" aria-live="polite">
        <Card className="p-5 sm:p-6">
          <p className="text-sm text-gray-700">{t("resPrice")}</p>
          <p className="num mt-1 text-[40px] font-bold leading-none tracking-tight text-brand-500">{formatSom(p, locale)}</p>
          <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
            <div><dt className="text-sm text-gray-700">{t("resMarkup")}</dt><dd className="num text-lg font-semibold">{mk.toFixed(1).replace(".", ",")}%</dd></div>
            <div><dt className="text-sm text-gray-700">{t("resMargin")}</dt><dd className="num text-lg font-semibold">{mg.toFixed(1).replace(".", ",")}%</dd></div>
          </dl>
        </Card>
        <Card className="p-5 sm:p-6">
          <p className="text-sm text-gray-700">{t("resUnits")}</p>
          <p className="num mt-1 text-2xl font-bold">{Number.isFinite(units) ? t("units", { n: formatNum(units) }) : "—"}</p>
        </Card>
        {p <= c && c > 0 && <Banner level="error">{t("noProfit")}</Banner>}
        <p className="text-sm text-gray-700">{t("marginNote")}</p>
      </div>
      <StickyResult target={resRef} area={formRef} label={`${t("resPrice")} · ${t("resMargin").toLowerCase()} ${mg.toFixed(1).replace(".", ",")}%`} value={formatSom(p, locale)} tone={p <= c && c > 0 ? "error" : "brand"} />
    </div>
  );
}

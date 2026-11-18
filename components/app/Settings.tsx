"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import { getBusiness, localizeBusiness, logout, resetAllData, saveBusiness } from "@/lib/api";
import { useRouter } from "@/i18n/navigation";
import type { Business, Locale, RecurringPayment } from "@/lib/types";
import { MoneyInput } from "../brand/MoneyInput";
import { LanguageSwitcher } from "../layout/LanguageSwitcher";
import { Button, Card, Input, Label, Select, Skeleton } from "../ui/primitives";
import { Sheet } from "../ui/sheet";
import { useToast } from "../ui/toast";
import { useApp } from "./AppShell";

export function Settings() {
  const t = useTranslations("settings");
  const ob = useTranslations("onboarding");
  const c = useTranslations("common");
  const router = useRouter();
  const locale = useLocale() as Locale;
  const toast = useToast();
  const { refresh } = useApp();
  const [b, setB] = useState<Business | null>(null);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => { void getBusiness().then((x) => setB(localizeBusiness(x, locale))); }, [locale]);
  if (!b) return <div className="space-y-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-64" /></div>;

  const patchPay = (id: string, f: Partial<RecurringPayment>) => setB({ ...b, recurringPayments: b.recurringPayments.map((p) => (p.id === id ? { ...p, ...f } : p)) });
  const save = async () => {
    await saveBusiness(b);
    toast(ob("doneTitle"));
    refresh();
  };

  return (
    <div className="max-w-3xl space-y-5">
      <h1 className="text-[22px] font-semibold tracking-tight lg:text-[28px]">{t("h1")}</h1>

      <Card className="space-y-4 p-5 sm:p-6">
        <h2 className="font-semibold">{t("profile")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="s-name">{ob("name")}</Label><Input id="s-name" value={b.ownerName} onChange={(e) => setB({ ...b, ownerName: e.target.value })} /></div>
          <div><Label htmlFor="s-biz">{ob("bizName")}</Label><Input id="s-biz" value={b.name} onChange={(e) => setB({ ...b, name: e.target.value })} /></div>
          <MoneyInput label={t("cash")} hint={ob("q5Hint")} value={b.cashNow} onChange={(n) => setB({ ...b, cashNow: n })} />
          <div>
            <Label htmlFor="s-reg">{t("regime")}</Label>
            <Select id="s-reg" value={b.taxRegime} onChange={(e) => setB({ ...b, taxRegime: e.target.value as Business["taxRegime"] })}>
              {(["turnover", "vat6", "vat12", "unknown"] as const).map((r) => <option key={r} value={r}>{t(`r_${r}`)}</option>)}
            </Select>
          </div>
        </div>
      </Card>

      <Card className="space-y-3 p-5 sm:p-6">
        <h2 className="font-semibold">{t("payments")}</h2>
        {b.recurringPayments.map((p) => (
          <div key={p.id} className="grid grid-cols-[1fr_auto] gap-2 rounded-card border border-gray-200 p-3 sm:grid-cols-[1.3fr_1fr_90px_auto] sm:items-end">
            <div className="col-span-2 sm:col-span-1"><Label htmlFor={`pt-${p.id}`}>{ob("payTitle")}</Label><Input id={`pt-${p.id}`} value={p.title} onChange={(e) => patchPay(p.id, { title: e.target.value })} /></div>
            <MoneyInput label={ob("payAmount")} value={p.amount} onChange={(n) => patchPay(p.id, { amount: n ?? 0 })} />
            <div><Label htmlFor={`pd-${p.id}`}>{ob("payDay")}</Label><Input id={`pd-${p.id}`} type="number" min={1} max={31} className="num" value={p.dayOfMonth} onChange={(e) => patchPay(p.id, { dayOfMonth: Math.min(31, Math.max(1, Number(e.target.value) || 1)) })} /></div>
            <button aria-label={c("remove")} onClick={() => setB({ ...b, recurringPayments: b.recurringPayments.filter((x) => x.id !== p.id) })}
              className="grid size-11 place-items-center self-end rounded-btn text-gray-700 hover:bg-mist hover:text-error"><Trash2 size={18} aria-hidden /></button>
          </div>
        ))}
        <button onClick={() => setB({ ...b, recurringPayments: [...b.recurringPayments, { id: "rp" + Date.now(), title: "", amount: 0, dayOfMonth: 1, kind: "other" }] })}
          className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-brand-500 hover:underline">
          <Plus size={16} aria-hidden /> {c("add")}
        </button>
      </Card>

      <Button size="lg" onClick={save}>{c("save")}</Button>

      <Card className="space-y-4 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3"><h2 className="font-semibold">{t("language")}</h2><LanguageSwitcher /></div>
        <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-4">
          <Button variant="danger" onClick={() => setConfirm(true)}>{t("deleteData")}</Button>
          <Button variant="secondary" onClick={() => { logout(); router.push("/"); }}>{t("logout")}</Button>
        </div>
      </Card>

      <Sheet open={confirm} onClose={() => setConfirm(false)} title={t("deleteData")}
        footer={<div className="flex gap-2"><Button variant="secondary" className="flex-1" onClick={() => setConfirm(false)}>{c("cancel")}</Button>
          <Button variant="danger" className="flex-1" onClick={() => { resetAllData(); setConfirm(false); toast(t("deleted")); refresh(); void getBusiness().then((x) => setB(localizeBusiness(x, locale))); }}>{c("delete")}</Button></div>}>
        <p>{t("deleteConfirm")}</p>
      </Sheet>
    </div>
  );
}

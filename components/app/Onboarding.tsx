"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { finishOnboarding, getSession, saveBusiness } from "@/lib/api";
import type { Activity, Business, LegalForm, RecurringPayment } from "@/lib/types";
import { Logo } from "../brand/Logo";
import { MoneyInput } from "../brand/MoneyInput";
import { LanguageSwitcher } from "../layout/LanguageSwitcher";
import { Segmented } from "../ui/segmented";
import { Button, Input, Label } from "../ui/primitives";

const TOTAL = 7;
type Kind = RecurringPayment["kind"];

export function Onboarding() {
  const t = useTranslations("onboarding");
  const tax = useTranslations("tax");
  const c = useTranslations("common");
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [ownerName, setOwner] = useState("");
  const [name, setName] = useState("");
  const [activity, setActivity] = useState<Activity>("trade");
  const [legalForm, setLegal] = useState<LegalForm>("ip");
  const [range, setRange] = useState<NonNullable<Business["revenueRange"]>>("10to50");
  const [cash, setCash] = useState<number | undefined>(undefined);
  const [payments, setPayments] = useState<RecurringPayment[]>([]);
  const [method, setMethod] = useState<NonNullable<Business["inputMethod"]>>("manual");

  useEffect(() => {
    if (!getSession()) router.replace("/login");
  }, [router]);

  const next = () => {
    if (step === 1 && !ownerName.trim()) return setErr(t("required"));
    setErr(null);
    if (step < TOTAL) setStep(step + 1);
    else void finish();
  };
  const finish = async () => {
    const b: Business = {
      id: "biz_" + Math.random().toString(36).slice(2, 8),
      ownerName: ownerName.trim(),
      name: name.trim() || ownerName.trim(),
      activity,
      legalForm,
      taxRegime: legalForm === "ip" ? "turnover" : "unknown",
      revenueRange: range,
      inputMethod: method,
      cashNow: cash,
      recurringPayments: payments.filter((p) => p.amount > 0),
    };
    await saveBusiness(b);
    finishOnboarding();
    setDone(true);
  };

  const addPreset = (title: string, kind: Kind) =>
    setPayments((p) => [...p, { id: "rp" + Math.random().toString(36).slice(2, 7), title, amount: 0, dayOfMonth: 5, kind }]);
  const patch = (id: string, f: Partial<RecurringPayment>) => setPayments((p) => p.map((x) => (x.id === id ? { ...x, ...f } : x)));

  const title = [t("q1"), t("q2"), t("q3"), t("q4"), t("q5"), t("q6"), t("q7")][step - 1];

  return (
    <div className="flex min-h-dvh flex-col bg-mist">
      <header className="flex items-center justify-between p-4 sm:p-6">
        <Logo size={32} />
        <LanguageSwitcher />
      </header>
      <main id="main" className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-10">
        {done ? (
          <div className="mt-10 rounded-block bg-white p-8 text-center animate-rise">
            <CheckCircle2 size={48} className="mx-auto text-success" aria-hidden />
            <h1 className="mt-4 text-[28px] font-semibold">{t("doneTitle")}</h1>
            <p className="mt-2 text-gray-700">{t("doneText")}</p>
            <Button size="lg" className="mt-6 w-full" onClick={() => router.push("/subscribe")} autoFocus>{t("toPanel")}</Button>
          </div>
        ) : (
          <>
            <div className="mt-2" aria-hidden>
              <div className="flex gap-1.5">
                {Array.from({ length: TOTAL }, (_, i) => (
                  <span key={i} className={`h-1 flex-1 rounded-full ${i < step ? "bg-brand-500" : "bg-gray-200"}`} />
                ))}
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-700" aria-live="polite">{t("step", { n: step, total: TOTAL })}</p>
            <div key={step} className="mt-2 flex-1 animate-rise">
              <div className="flex items-start gap-3">
                <span className="mt-1 shrink-0"><Logo size={30} markOnly /></span>
                <h1 className="rounded-card rounded-tl-md border border-gray-200 bg-white px-4 py-3 text-lg font-semibold leading-snug">{title}</h1>
              </div>

              <div className="mt-6 space-y-4 sm:pl-[42px]">
                {step === 1 && (
                  <>
                    <div>
                      <Label htmlFor="ob-name">{t("name")}</Label>
                      <Input id="ob-name" autoFocus autoComplete="given-name" value={ownerName} onChange={(e) => { setOwner(e.target.value); setErr(null); }} aria-invalid={!!err} />
                      {err && <p className="mt-1 text-sm text-error">{err}</p>}
                    </div>
                    <div>
                      <Label htmlFor="ob-biz">{t("bizName")}</Label>
                      <Input id="ob-biz" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                  </>
                )}
                {step === 2 && (
                  <Segmented wrap size="lg" label={t("q2")} value={activity} onChange={setActivity}
                    options={(["trade", "catering", "services", "production", "other"] as Activity[]).map((a) => ({ value: a, label: tax(a) }))} />
                )}
                {step === 3 && (
                  <>
                    <Segmented wrap size="lg" label={t("q3")} value={legalForm} onChange={setLegal}
                      options={[{ value: "ip", label: tax("ip") }, { value: "legal", label: tax("legal") }, { value: "unregistered", label: t("unregistered") }]} />
                    {legalForm === "unregistered" && <p className="text-sm text-gray-700">{t("unregisteredHint")}</p>}
                  </>
                )}
                {step === 4 && (
                  <Segmented wrap size="lg" label={t("q4")} value={range} onChange={setRange}
                    options={(["lt10", "10to50", "50to200", "gt200"] as const).map((r) => ({ value: r, label: t(`r_${r}`) }))} />
                )}
                {step === 5 && <MoneyInput autoFocus label={t("cash")} hint={t("q5Hint")} value={cash} onChange={setCash} />}
                {step === 6 && (
                  <>
                    <p className="text-sm text-gray-700">{t("q6Hint")}</p>
                    <div className="flex flex-wrap gap-2">
                      {([["presetRent", "rent"], ["presetSalary", "salary"], ["presetLoan", "loan"], ["presetPhone", "other"]] as [string, Kind][]).map(([k, kind]) => (
                        <button key={k} type="button" onClick={() => addPreset(t(k), kind)}
                          className="inline-flex min-h-11 items-center gap-1 rounded-full border border-gray-200 bg-white px-4 text-sm font-medium hover:border-graphite-900">
                          <Plus size={15} aria-hidden /> {t(k)}
                        </button>
                      ))}
                    </div>
                    <ul className="space-y-3">
                      {payments.map((p) => (
                        <li key={p.id} className="rounded-card border border-gray-200 bg-white p-3">
                          <div className="flex gap-2">
                            <Input aria-label={t("payTitle")} value={p.title} onChange={(e) => patch(p.id, { title: e.target.value })} />
                            <button type="button" aria-label={c("remove")} onClick={() => setPayments((x) => x.filter((y) => y.id !== p.id))}
                              className="grid size-11 shrink-0 place-items-center rounded-btn text-gray-700 hover:bg-mist hover:text-error"><Trash2 size={18} aria-hidden /></button>
                          </div>
                          <div className="mt-2 grid grid-cols-[1fr_110px] gap-2">
                            <MoneyInput label={t("payAmount")} value={p.amount || undefined} onChange={(n) => patch(p.id, { amount: n ?? 0 })} />
                            <div>
                              <Label htmlFor={`d-${p.id}`}>{t("payDay")}</Label>
                              <Input id={`d-${p.id}`} type="number" inputMode="numeric" min={1} max={31} value={p.dayOfMonth}
                                onChange={(e) => patch(p.id, { dayOfMonth: Math.min(31, Math.max(1, Number(e.target.value) || 1)) })} className="num" />
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <button type="button" onClick={() => addPreset("", "other")} className="min-h-11 text-sm font-medium text-brand-500 hover:underline">{t("addPayment")}</button>
                  </>
                )}
                {step === 7 && (
                  <Segmented wrap size="lg" label={t("q7")} value={method} onChange={setMethod}
                    options={(["import", "manual", "photo", "demo"] as const).map((m) => ({ value: m, label: t(`m_${m}`) }))} />
                )}
              </div>
            </div>

            <div className="sticky bottom-0 mt-8 flex items-center gap-2 bg-mist py-3">
              <Button variant="ghost" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>{c("back")}</Button>
              <span className="flex-1" />
              {step > 1 && <Button variant="ghost" onClick={() => (step < TOTAL ? setStep(step + 1) : void finish())}>{c("skip")}</Button>}
              <Button onClick={next} className="min-w-28">{step === TOTAL ? c("save") : c("next")}</Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

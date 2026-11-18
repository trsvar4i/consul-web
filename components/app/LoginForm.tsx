"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Store } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { startDemoSession, startPhoneSession } from "@/lib/api";
import { Button, cn, inputCls } from "../ui/primitives";

export function LoginForm() {
  const t = useTranslations("login");
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const digits = phone.replace(/\D/g, "").slice(0, 9);
  const pretty = [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)].filter(Boolean).join(" ");

  const demo = () => {
    setBusy(true);
    startDemoSession();
    router.push("/app");
  };

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-[28px] font-semibold tracking-tight">{t("h1")}</h1>
      <p className="mt-1 text-gray-700">{t("sub")}</p>

      {/* Главная кнопка: демо-вход */}
      <Button size="lg" className="mt-6 h-auto w-full flex-col items-start gap-0.5 py-3 text-left" onClick={demo} disabled={busy}>
        <span className="flex w-full items-center justify-between">{t("demo")} <ArrowRight size={18} aria-hidden /></span>
        <span className="flex items-center gap-1.5 text-sm font-normal text-white/80"><Store size={14} aria-hidden />{t("demoWho")}</span>
      </Button>

      <div className="my-6 flex items-center gap-3 text-sm text-gray-700">
        <span className="h-px flex-1 bg-gray-200" />{t("or")}<span className="h-px flex-1 bg-gray-200" />
      </div>

      {step === "phone" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (digits.length !== 9) return setError(t("phoneError"));
            setError(null);
            setStep("code");
          }}
        >
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">{t("phone")}</label>
          <div className="flex">
            <span className="inline-flex h-11 items-center rounded-l-btn border border-r-0 border-gray-200 bg-white px-3 text-gray-700 num">+998</span>
            <input id="phone" inputMode="tel" autoComplete="tel-national" value={pretty} onChange={(e) => setPhone(e.target.value)}
              placeholder="90 123 45 67" className={cn(inputCls, "rounded-l-none num")} aria-invalid={!!error} aria-describedby={error ? "login-err" : undefined} />
          </div>
          {error && <p id="login-err" className="mt-1.5 text-sm text-error">{error}</p>}
          <Button type="submit" variant="secondary" className="mt-3 w-full">{t("getCode")}</Button>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim() !== "1234") return setError(t("wrongCode"));
            startPhoneSession("+998" + digits);
            router.push("/onboarding");
          }}
        >
          <label htmlFor="code" className="mb-1.5 block text-sm font-medium">{t("code")}</label>
          <input id="code" inputMode="numeric" autoComplete="one-time-code" autoFocus maxLength={4} value={code}
            onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")); setError(null); }}
            className={cn(inputCls, "text-center text-xl tracking-[0.5em] num")} aria-invalid={!!error} aria-describedby="code-hint" />
          <p id="code-hint" className={cn("mt-1.5 text-sm", error ? "text-error" : "text-gray-700")}>{error ?? t("codeHint")}</p>
          <Button type="submit" variant="dark" className="mt-3 w-full">{t("verify")}</Button>
        </form>
      )}
    </div>
  );
}

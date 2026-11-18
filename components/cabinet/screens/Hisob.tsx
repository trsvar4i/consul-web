"use client";
import { Link, useT } from "@/components/I18n";
import { Calculators, type CalcTab } from "@/components/Calculators";
import { useStore } from "../Store";
import { BankReport } from "../Sheets";
import { Screen } from "./common";

export default function Hisob() { const t = useT();
  const s = useStore();
  return <Screen id="hisob" title={t("Kalkulyatorlar")}>
    <p className="small hs">{t("Raqamlaringiz bilan toʻldirildi. Oʻzgartirib koʻring — hech narsa saqlanmaydi.")}</p>
    <Calculators variant="app" tab={s.calcTab as CalcTab} onTab={s.setCalcTab} ctas={{
      kredit: { label: t("Bank uchun hisobot"), onClick: () => s.openSheet(<BankReport />), secondary: true },
      zarar: { label: t("Biznes-rejaga qoʻshish"), href: "/app/reja", secondary: true },
      narx: { label: t("Bozor narxi bilan solishtirish"), href: "/app/bozor", secondary: true },
    }} />
    <p className="note">{t("Soliq — 2026-yil qoidalari, aniq summa soliq.uz kabinetida. Kredit shartlari — bankda.")} <Link href="/app/kredit">{t("Kredit olish qadamlari")}</Link></p>
  </Screen>;
}

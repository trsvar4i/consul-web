// Все ставки и пороги — в одном месте. Аналитик правит только этот файл.
export const RULES = {
  effectiveFrom: "2026-06-01",
  turnoverRateIP: 0.01,
  turnoverRateIPLimitSom: 1_000_000_000,
  turnoverRatesLegal: [0.01, 0.02, 0.03, 0.04],
  vatSimplified: 0.06,
  vatGeneral: 0.12,
  profitTax: 0.15,
  generalRegimeThresholdSom: 4_944_000_000,
  simplifiedVatActivities: ["trade", "catering", "services"],
  source: "Указ УП-100 от 26.05.2026; buxgalter.uz",
} as const;

// Пороги нагрузки кредита (ориентиры для демо, не банковский норматив)
export const LOAD = { comfortable: 30, hard: 50 } as const;

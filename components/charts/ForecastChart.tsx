"use client";
import { Area, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useLocale, useTranslations } from "next-intl";
import { formatDate, formatNum, formatShort } from "@/lib/format";

/** Остаток денег по дням: факт — сплошная, прогноз — пунктир, ниже нуля — зона цвета error. */
export function ForecastChart({ points }: { points: { date: string; balance: number; isForecast: boolean }[] }) {
  const locale = useLocale();
  const t = useTranslations("dashboard");
  const lastFact = points.findLastIndex((p) => !p.isForecast);
  const data = points.map((p, i) => ({
    date: p.date,
    fact: !p.isForecast ? p.balance : null,
    fc: p.isForecast || i === lastFact ? p.balance : null,
    neg: Math.min(0, p.balance),
  }));
  return (
    <div>
      <div className="h-64 w-full sm:h-72" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#D3D9E0" vertical={false} />
            <XAxis dataKey="date" tickFormatter={(d: string) => formatDate(d, locale)} tick={{ fill: "#7D8794", fontSize: 12 }} tickLine={false} axisLine={false} minTickGap={48} />
            <YAxis width={58} tickFormatter={(v: number) => formatShort(v, locale)} tick={{ fill: "#7D8794", fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip
              formatter={(v, name) => [formatNum(Number(v)), name === "fact" ? t("fact") : name === "fc" ? t("forecast") : ""]}
              labelFormatter={(d) => formatDate(String(d), locale)}
              contentStyle={{ borderRadius: 10, borderColor: "#D3D9E0", fontSize: 13 }}
              filterNull
            />
            <ReferenceLine y={0} stroke="#7D8794" />
            <Area dataKey="neg" type="monotone" stroke="none" fill="#C2410C" fillOpacity={0.18} isAnimationActive={false} tooltipType="none" />
            <Line dataKey="fact" type="monotone" stroke="#22262C" strokeWidth={2.5} dot={false} connectNulls={false} />
            <Line dataKey="fc" type="monotone" stroke="#22262C" strokeWidth={2} strokeDasharray="6 5" dot={false} connectNulls={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex items-center gap-5 text-xs text-gray-700">
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-5 bg-graphite-900" />{t("fact")}</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-5 border-t-2 border-dashed border-graphite-900" />{t("forecast")}</span>
      </div>
    </div>
  );
}

import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Consul";

const TEXT: Record<string, { h: string; s: string }> = {
  uz: { h: "Bugun qancha pul sarflashingiz mumkin?", s: "Kichik biznesning moliyaviy direktori" },
  ru: { h: "Сколько денег можно безопасно потратить сегодня?", s: "Финансовый директор малого бизнеса" },
};

export default async function OG({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = TEXT[locale] ?? TEXT.uz;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#22262C", color: "#fff", padding: 72, flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: "#2F353D", position: "relative", display: "flex" }}>
            <div style={{ position: "absolute", left: 14, top: 14, width: 30, height: 30, borderRadius: 6, background: "#A3213A" }} />
            <div style={{ position: "absolute", left: 28, top: 28, width: 30, height: 30, borderRadius: 6, background: "#F59AAA" }} />
            <div style={{ position: "absolute", left: 28, top: 28, width: 16, height: 16, borderRadius: 4, background: "#E0566D" }} />
          </div>
          <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: 6 }}>CONSUL</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 64, fontWeight: 600, lineHeight: 1.1, maxWidth: 1000 }}>{t.h}</div>
          <div style={{ fontSize: 30, color: "#B9C0C8" }}>{t.s}</div>
        </div>
      </div>
    ),
    size,
  );
}

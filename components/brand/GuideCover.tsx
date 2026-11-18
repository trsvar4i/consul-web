import type { Guide } from "@/lib/types";
import { cn } from "../ui/primitives";

/**
 * Обложка гайда. Если у гайда есть своя картинка (`cover` в mocks/guides.json,
 * файл в /public/guides/), показываем её. Иначе — фирменная иллюстрация по теме.
 */
export function GuideCover({ guide, className }: { guide: Guide; className?: string }) {
  if (guide.cover) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- user-supplied cover, any size
      <img src={guide.cover} alt="" className={cn("h-full w-full object-cover", className)} />
    );
  }
  const kind = guide.tool ?? "markup";
  return (
    <svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" aria-hidden className={cn("h-full w-full", className)}>
      <defs>
        <pattern id={`g-${guide.slug}`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        </pattern>
      </defs>
      {kind === "markup" && (
        <>
          <rect width="400" height="220" fill="#22262C" />
          <rect width="400" height="220" fill={`url(#g-${guide.slug})`} />
          {/* выручка → закупки → расходы → прибыль */}
          <rect x="48" y="40" width="58" height="150" rx="10" fill="#F2F4F7" />
          <rect x="126" y="40" width="58" height="96" rx="10" fill="#4A535E" />
          <rect x="204" y="136" width="58" height="36" rx="10" fill="#4A535E" />
          <rect x="282" y="172" width="58" height="18" rx="8" fill="#E0566D" />
          <path d="M106 40H126M184 136H204M262 172H282" stroke="#7D8794" strokeDasharray="4 4" />
          <text x="282" y="160" fill="#F59AAA" fontSize="18" fontWeight="700" fontFamily="Inter, sans-serif">12%</text>
        </>
      )}
      {kind === "tax-regime" && (
        <>
          <rect width="400" height="220" fill="#FBEAED" />
          <g opacity="0.5"><rect width="400" height="220" fill={`url(#g-${guide.slug})`} /></g>
          {/* три режима: самый низкий налог выделен */}
          <rect x="64" y="70" width="76" height="120" rx="12" fill="#FFFFFF" stroke="#D3D9E0" />
          <rect x="162" y="110" width="76" height="80" rx="12" fill="#A3213A" />
          <rect x="260" y="40" width="76" height="150" rx="12" fill="#FFFFFF" stroke="#D3D9E0" />
          <circle cx="200" cy="84" r="16" fill="#1F7A4D" />
          <path d="M192 84l6 6 10-12" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <text x="102" y="60" textAnchor="middle" fill="#4A535E" fontSize="15" fontWeight="600" fontFamily="Inter, sans-serif">1%</text>
          <text x="298" y="30" textAnchor="middle" fill="#4A535E" fontSize="15" fontWeight="600" fontFamily="Inter, sans-serif">12%</text>
        </>
      )}
      {kind === "credit" && (
        <>
          <rect width="400" height="220" fill="#F2F4F7" />
          {/* платежи по месяцам и кривая остатка долга */}
          {Array.from({ length: 12 }, (_, i) => (
            <rect key={i} x={40 + i * 28} y={190 - (130 - i * 8)} width="18" height={130 - i * 8} rx="5" fill={i === 0 ? "#22262C" : "#D3D9E0"} />
          ))}
          <path d="M40 40 C 140 50, 240 120, 372 180" fill="none" stroke="#A3213A" strokeWidth="4" strokeLinecap="round" />
          <circle cx="372" cy="180" r="7" fill="#A3213A" />
          <rect x="232" y="26" width="132" height="40" rx="12" fill="#22262C" />
          <text x="298" y="52" textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="700" fontFamily="Inter, sans-serif">≤ 30%</text>
        </>
      )}
    </svg>
  );
}

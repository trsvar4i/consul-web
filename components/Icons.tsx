/** Shared SVG symbols: logo, squares mark, icons. Render once per page. */
export function SvgDefs({ tile = "#22262C" }: { tile?: string }) {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <linearGradient id="LA" x1="0" y1="40" x2="0" y2="160" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#A3213A" /><stop offset="1" stopColor="#E0566D" /></linearGradient>
        <linearGradient id="LB" x1="0" y1="40" x2="0" y2="160" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#E0566D" /><stop offset="1" stopColor="#F59AAA" /></linearGradient>
        <clipPath id="LC"><rect x="46" y="46" width="72" height="72" rx="10" /></clipPath>
        <symbol id="logo" viewBox="0 0 200 200"><rect x="18" y="18" width="164" height="164" rx="42" fill={tile} /><rect x="46" y="46" width="72" height="72" rx="10" fill="url(#LA)" /><rect x="82" y="82" width="72" height="72" rx="10" fill="url(#LB)" /><rect x="82" y="82" width="72" height="72" rx="10" fill="#E0566D" clipPath="url(#LC)" /></symbol>
        <linearGradient id="ma" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8E1C33" /><stop offset="1" stopColor="#C23650" /></linearGradient>
        <linearGradient id="mb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F7B3BF" /><stop offset="1" stopColor="#F28D9F" /></linearGradient>
        <linearGradient id="mo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F06A80" /><stop offset="1" stopColor="#D9475F" /></linearGradient>
        <clipPath id="mc"><rect x="10" y="10" width="56" height="56" rx="11" /></clipPath>
        <symbol id="sq" viewBox="0 0 120 120"><rect x="10" y="10" width="56" height="56" rx="11" fill="url(#ma)" /><rect x="44" y="44" width="56" height="56" rx="11" fill="url(#mb)" /><g clipPath="url(#mc)"><rect x="44" y="44" width="56" height="56" rx="11" fill="url(#mo)" /></g></symbol>
        <symbol id="i-mic" viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></symbol>
        <symbol id="i-up" viewBox="0 0 24 24"><path d="M12 19V6M6 11.5 12 5.5l6 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></symbol>
        <symbol id="i-cam" viewBox="0 0 24 24"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><circle cx="12" cy="13" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.8" /></symbol>
        <symbol id="i-calc" viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="3" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M9 7.5h6M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></symbol>
        <symbol id="i-q" viewBox="0 0 24 24"><path d="M4 18 9 12l4 3 7-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 7h5v5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></symbol>
        <symbol id="i-bank" viewBox="0 0 24 24"><path d="M3 9 12 4l9 5M5 10v7M9.5 10v7M14.5 10v7M19 10v7M3 20h18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></symbol>
        <symbol id="i-tax" viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M9 15l6-6M9.5 9.5h0M14.5 14.5h0" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></symbol>
        <symbol id="i-doc" viewBox="0 0 24 24"><path d="M6 3h8l4 4v14H6z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M9 12h6M9 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></symbol>
        <symbol id="i-mkt" viewBox="0 0 24 24"><path d="M4 9h16l-1 11H5zM8 9V7a4 4 0 0 1 8 0v2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></symbol>
        <symbol id="i-book" viewBox="0 0 24 24"><path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M5 17a3 3 0 0 1 3-3h10" fill="none" stroke="currentColor" strokeWidth="2" /></symbol>
        <symbol id="i-flag" viewBox="0 0 24 24"><path d="M5 21V4M5 4h12l-2 4 2 4H5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" /></symbol>
        <symbol id="i-learn" viewBox="0 0 24 24"><path d="M3 9l9-5 9 5-9 5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M7 11.5V16c3 2 7 2 10 0v-4.5" fill="none" stroke="currentColor" strokeWidth="2" /></symbol>
      </defs>
    </svg>
  );
}
export const Logo = ({ size = 32 }: { size?: number }) => <svg width={size} height={size} aria-hidden="true"><use href="#logo" /></svg>;
export const Mark = ({ size = 18, className }: { size?: number; className?: string }) => <svg width={size} height={size} className={className} aria-hidden="true"><use href="#sq" /></svg>;
export const Icon = ({ id, size = 20 }: { id: string; size?: number }) => <svg width={size} height={size} aria-hidden="true"><use href={`#${id}`} /></svg>;

import { NextResponse, type NextRequest } from "next/server";

const LANGS = ["uz", "ru"];

/** Adds a language prefix: saved choice (cookie) -> browser language -> Uzbek. */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (LANGS.some(l => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return;
  const saved = request.cookies.get("lang")?.value;
  const accept = request.headers.get("accept-language") || "";
  const first = accept.split(",")[0].trim().slice(0, 2).toLowerCase();
  const lang = saved && LANGS.includes(saved) ? saved : first === "ru" ? "ru" : "uz";
  request.nextUrl.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = { matcher: ["/((?!_next|api|icon|favicon|.*\\..*).*)"] };

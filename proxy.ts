// Next.js 16: proxy.ts (formerly middleware.ts). Redirects "/" -> "/uz" (or /ru by browser language).
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\..*).*)"],
};

"use client";
import { createContext, Suspense, useCallback, useContext, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  BookUser, FileText, GitCompareArrows, Globe, Landmark, LayoutDashboard, ListOrdered, LogOut, MessageCircle, MoreHorizontal, Plus, Settings, X,
} from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { getBusiness, getPlan, getSession, localizeBusiness, logout } from "@/lib/api";
import type { Locale } from "@/lib/types";
import { useAssistant } from "@/lib/assistant-context";
import type { Business, Transaction } from "@/lib/types";
import { Logo } from "../brand/Logo";
import { LanguageSwitcher } from "../layout/LanguageSwitcher";
import { cn } from "../ui/primitives";
import { AddOperationSheet } from "./AddOperationSheet";

type AppCtx = {
  business: Business | null;
  version: number; // bump → pages refetch
  refresh: () => void;
  openAdd: (tx?: Transaction) => void;
};
const Ctx = createContext<AppCtx>({ business: null, version: 0, refresh: () => {}, openAdd: () => {} });
export const useApp = () => useContext(Ctx);

const NAV = [
  { href: "/app", key: "dashboard", Icon: LayoutDashboard },
  { href: "/app/operations", key: "operations", Icon: ListOrdered },
  { href: "/app/credit", key: "credit", Icon: Landmark },
  { href: "/app/reconcile", key: "reconcile", Icon: GitCompareArrows },
  { href: "/app/passport", key: "passport", Icon: BookUser },
  { href: "/app/plan", key: "plan", Icon: FileText },
  { href: "/app/settings", key: "settings", Icon: Settings },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("app");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const assistant = useAssistant();
  const { addOperationRequested } = assistant;
  const [ready, setReady] = useState(false);
  const [business, setBusiness] = useState<Business | null>(null);
  const [version, setVersion] = useState(0);
  const [sheet, setSheet] = useState<{ open: boolean; tx?: Transaction }>({ open: false });
  const [more, setMore] = useState(false);

  // auth guard: no consul_session → /login
  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/login");
      return;
    }
    if (s.isNew) {
      router.replace("/onboarding");
      return;
    }
    // после входа — выбор подписки
    if (!getPlan()) {
      router.replace("/subscribe");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- guard result
    setReady(true);
  }, [router]);

  useEffect(() => {
    if (ready) void getBusiness().then((b) => setBusiness(localizeBusiness(b, locale))).catch(() => {});
  }, [ready, version, locale]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- close the "more" menu on navigation
  useEffect(() => setMore(false), [pathname]);

  // assistant action «Добавить операцию»
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reacts to an external request
    if (addOperationRequested > 0) setSheet({ open: true });
  }, [addOperationRequested]);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);
  const openAdd = useCallback((tx?: Transaction) => setSheet({ open: true, tx }), []);

  if (!ready) {
    return <div className="min-h-dvh bg-mist" aria-busy="true" />;
  }

  const isActive = (href: string) => (href === "/app" ? pathname === "/app" : pathname.startsWith(href));

  return (
    <Ctx.Provider value={{ business, version, refresh, openAdd }}>
      <AddParam onAdd={() => setSheet({ open: true })} />
      <div className="min-h-dvh bg-mist lg:grid lg:grid-cols-[248px_1fr]">
        {/* Sidebar (lg) */}
        <aside className="sticky top-0 hidden h-dvh flex-col border-r border-gray-200 bg-white px-3 py-4 lg:flex">
          <Link href="/" className="px-2" aria-label="Consul"><Logo size={30} /></Link>
          {business && (
            <div className="mt-5 flex items-center gap-2.5 rounded-btn bg-mist p-2">
              <span className="grid size-9 place-items-center rounded-full bg-graphite-900 text-sm font-semibold text-white">{business.ownerName.slice(0, 1)}</span>
              <span className="min-w-0 text-sm leading-tight">
                <span className="block truncate font-medium">{business.ownerName}</span>
                <span className="block truncate text-gray-700">{business.name}</span>
              </span>
            </div>
          )}
          <button onClick={() => openAdd()} className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-btn bg-graphite-900 font-medium text-white hover:bg-graphite-800">
            <Plus size={18} aria-hidden /> {t("addOperation")}
          </button>
          <nav className="mt-4 flex-1 space-y-0.5" aria-label="App">
            {NAV.map(({ href, key, Icon }) => (
              <Link key={href} href={href} aria-current={isActive(href) ? "page" : undefined}
                className={cn("flex min-h-11 items-center gap-3 rounded-btn px-3 text-[15px] font-medium",
                  isActive(href) ? "bg-brand-50 text-brand-600" : "text-gray-700 hover:bg-mist hover:text-graphite-900")}>
                <Icon size={20} aria-hidden /> {t(key)}
              </Link>
            ))}
            <Link href="/chat" className="flex min-h-11 items-center gap-3 rounded-btn px-3 text-[15px] font-medium text-gray-700 hover:bg-mist hover:text-graphite-900">
              <MessageCircle size={20} aria-hidden /> {t("chat")}
            </Link>
          </nav>
          <div className="space-y-2 border-t border-gray-200 pt-3">
            <LanguageSwitcher />
            <button onClick={() => { logout(); router.push("/"); }} className="flex min-h-10 w-full items-center gap-3 rounded-btn px-3 text-sm text-gray-700 hover:bg-mist">
              <LogOut size={18} aria-hidden /> {t("logout")}
            </button>
          </div>
        </aside>

        <div className="min-w-0">
          {/* Top bar (mobile) */}
          <header className="sticky top-0 z-30 flex h-14 items-center gap-2.5 border-b border-gray-200 bg-white/95 px-4 backdrop-blur lg:hidden">
            <Link href="/" aria-label="Consul"><Logo size={28} markOnly /></Link>
            <p className="min-w-0 flex-1 truncate text-[15px] font-semibold">{business ? `${business.ownerName} · ${business.name}` : ""}</p>
            <LanguageSwitcher />
            <button onClick={() => assistant.open()} aria-label={t("chat")}
              className="relative grid size-10 shrink-0 place-items-center rounded-full bg-graphite-900 text-white">
              <MessageCircle size={18} aria-hidden />
              {assistant.unread && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-brand-400 ring-2 ring-graphite-900" aria-hidden />}
            </button>
          </header>
          <main id="main" className="mx-auto w-full max-w-6xl px-4 pb-28 pt-5 sm:px-6 lg:pb-12 lg:pt-8">{children}</main>
        </div>
      </div>

      {/* Bottom nav (mobile): Панель, Операции, +, Кредит, Ещё */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label="App">
        <BottomItem href="/app" label={t("dashboard")} Icon={LayoutDashboard} active={isActive("/app")} />
        <BottomItem href="/app/operations" label={t("operations")} Icon={ListOrdered} active={isActive("/app/operations")} />
        <button onClick={() => openAdd()} aria-label={t("addOperation")} className="flex flex-col items-center justify-center">
          <span className="grid size-12 place-items-center rounded-full bg-graphite-900 text-white"><Plus size={24} aria-hidden /></span>
        </button>
        <BottomItem href="/app/credit" label={t("credit")} Icon={Landmark} active={isActive("/app/credit")} />
        <button onClick={() => setMore(true)} aria-expanded={more} className={cn("flex min-h-16 flex-col items-center justify-center gap-0.5 text-xs font-medium", more ? "text-brand-500" : "text-gray-700")}>
          <MoreHorizontal size={22} aria-hidden /> {t("more")}
        </button>
      </nav>

      {more && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-graphite-900/40" onClick={() => setMore(false)} aria-hidden />
          <div className="absolute inset-x-0 bottom-0 rounded-t-block bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] animate-rise" role="dialog" aria-label={t("more")}>
            <div className="mb-2 flex items-center justify-between">
              <p className="px-2 font-semibold">{t("more")}</p>
              <button onClick={() => setMore(false)} className="grid size-11 place-items-center rounded-btn hover:bg-mist" aria-label="×"><X size={20} aria-hidden /></button>
            </div>
            {[...NAV.slice(3), { href: "/chat", key: "chat", Icon: MessageCircle }, { href: "/", key: "toSite", Icon: Globe }].map(({ href, key, Icon }) => (
              <Link key={href} href={href} className="flex min-h-12 items-center gap-3 rounded-btn px-3 text-base hover:bg-mist">
                <Icon size={20} className="text-gray-700" aria-hidden /> {t(key)}
              </Link>
            ))}
            <button onClick={() => { logout(); router.push("/"); }} className="flex min-h-12 w-full items-center gap-3 rounded-btn px-3 text-base text-gray-700 hover:bg-mist">
              <LogOut size={20} aria-hidden /> {t("logout")}
            </button>
          </div>
        </div>
      )}

      <AddOperationSheet
        open={sheet.open}
        tx={sheet.tx}
        onClose={() => setSheet({ open: false })}
        onSaved={refresh}
      />
    </Ctx.Provider>
  );
}

function BottomItem({ href, label, Icon, active }: { href: string; label: string; Icon: typeof Plus; active: boolean }) {
  return (
    <Link href={href} aria-current={active ? "page" : undefined}
      className={cn("flex min-h-16 flex-col items-center justify-center gap-0.5 text-xs font-medium", active ? "text-brand-500" : "text-gray-700")}>
      <Icon size={22} aria-hidden /> <span className="max-w-full px-0.5 text-center text-[11px] leading-tight">{label}</span>
    </Link>
  );
}

/** ?add=1 в адресе открывает форму добавления (ссылки из ассистента и страницы цен). */
function AddParamInner({ onAdd }: { onAdd: () => void }) {
  const sp = useSearchParams();
  const add = sp.get("add");
  useEffect(() => {
    if (add === "1") onAdd();
  }, [add, onAdd]);
  return null;
}
function AddParam({ onAdd }: { onAdd: () => void }) {
  return <Suspense fallback={null}><AddParamInner onAdd={onAdd} /></Suspense>;
}

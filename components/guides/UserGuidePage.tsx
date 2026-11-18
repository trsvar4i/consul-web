"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ChevronRight, Sparkles, Trash2 } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { deleteUserGuide, getUserGuide, type UserGuide } from "@/lib/api";
import { usePageContext } from "@/lib/assistant-context";
import { formatDateFull } from "@/lib/format";
import { Container, Skeleton } from "../ui/primitives";
import { EmptyState } from "../brand/blocks";
import { GuideBlocks } from "./GuideBlocks";

/** Страница гайда, который собрал ассистент. Данные — с этого устройства. */
export function UserGuidePage() {
  const t = useTranslations("myGuides");
  const nav = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const id = useSearchParams().get("id") ?? "";
  const [g, setG] = useState<UserGuide | null | undefined>(undefined);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- guide lives in localStorage
  useEffect(() => setG(getUserGuide(id)), [id]);
  usePageContext({ page: "guide", title: g?.title ?? t("mine"), data: { title: g?.title } });

  if (g === undefined) return <Container className="max-w-3xl space-y-4 py-12"><Skeleton className="h-10 w-2/3" /><Skeleton className="h-64" /></Container>;
  if (!g) return <Container className="py-12"><EmptyState title={t("notFound")}><Link href="/guides" className="font-medium text-brand-500 hover:underline">{t("back")}</Link></EmptyState></Container>;

  return (
    <>
      <div className="border-b border-gray-200 bg-mist">
        <Container className="max-w-3xl py-8 lg:py-12">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-700">
              <li className="flex items-center gap-1"><Link href="/" className="hover:underline">{nav("home")}</Link><ChevronRight size={14} aria-hidden /></li>
              <li className="flex items-center gap-1"><Link href="/guides" className="hover:underline">{nav("guides")}</Link><ChevronRight size={14} aria-hidden /></li>
            </ol>
          </nav>
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium shadow-soft"><Sparkles size={13} className="text-brand-500" aria-hidden /> {t("mine")} · {g.tag}</p>
          <h1 className="mt-3 text-[28px] font-semibold leading-tight tracking-tight lg:text-[40px]">{g.title}</h1>
          <p className="mt-3 text-lg text-gray-700">{g.description}</p>
          <p className="mt-3 text-sm text-gray-700">{formatDateFull(g.createdAt.slice(0, 10), locale)} · {t("saved")}</p>
        </Container>
      </div>
      <Container className="max-w-3xl py-8 lg:py-12">
        <div className="mb-8 rounded-card border border-gray-200 bg-white p-4 text-[15px]">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-700">{t("problem")}</span>
          <p className="mt-1 italic">«{g.problem}»</p>
        </div>
        <GuideBlocks id={g.id} blocks={g.blocks} />
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-6">
          <Link href="/guides" className="font-medium text-brand-500 hover:underline">← {t("back")}</Link>
          <button onClick={() => { deleteUserGuide(g.id); router.push("/guides"); }} className="inline-flex min-h-10 items-center gap-2 rounded-btn px-3 text-sm text-gray-700 hover:bg-mist hover:text-error">
            <Trash2 size={16} aria-hidden /> {t("delete")}
          </button>
        </div>
      </Container>
    </>
  );
}

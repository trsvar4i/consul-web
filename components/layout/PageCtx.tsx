"use client";
import { usePageContext } from "@/lib/assistant-context";
import type { PageKind } from "@/lib/types";

/** Серверные страницы вставляют этот компонент, чтобы ассистент знал, где пользователь. */
export function PageCtx({ page, title, summary, data }: { page: PageKind; title: string; summary?: string; data?: Record<string, unknown> }) {
  usePageContext({ page, title, summary, data });
  return null;
}

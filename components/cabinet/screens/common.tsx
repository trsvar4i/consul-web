"use client";
import { Link, useT, useTP, tk } from "@/components/I18n";
import type { ReactNode } from "react";
import { fmt } from "@/lib/format";
import type { Op } from "@/lib/ledger";

export function Screen({ id, title, back = "/app/vositalar", backLabel = tk("Vositalar"), children }: { id: string; title?: string; back?: string | null; backLabel?: string; children: ReactNode }) {
  const t = useT();
  return <section className="scr on" id={"s-" + id}>
    {back && <Link className="back" href={back}>← {t(backLabel)}</Link>}
    {title && <h2 className="pt">{t(title)}</h2>}
    {children}
  </section>;
}

export const Li = ({ a: a0, sub: sub0, b: b0, pos, href, chev, cls }: { a: ReactNode; sub?: ReactNode; b?: ReactNode; pos?: boolean; href?: string; chev?: boolean; cls?: string }) => {
  const t = useT(), tr = (x: ReactNode) => (typeof x === "string" ? t(x) : x);
  const a = tr(a0), sub = tr(sub0), b = tr(b0);
  const body = <><span>{a}{sub && <small>{sub}</small>}</span>{b !== undefined && <b className={"num" + (pos ? " pos" : "") + (cls ? " " + cls : "")}>{b}</b>}{chev && <i className="chev">›</i>}</>;
  return href ? <Link className="li" href={href}>{body}</Link> : <div className="li">{body}</div>;
};

export const money = (n: number) => (n > 0 ? "+" : n < 0 ? "−" : "") + fmt(Math.abs(n));

export function OpRow({ o, day, cls = "" }: { o: Op; day?: boolean; cls?: string }) {
  const t = useT(), tp = useTP();
  return <div className={"li " + cls}><span>{tp(o.title)}<small>{day ? [t(o.day).toLowerCase(), tp(o.sub)].filter(Boolean).join(", ") : tp(o.sub)}</small>{o.note && <small className="op-note">{o.note}</small>}</span><b className={"num" + (o.amount > 0 ? " pos" : "")}>{o.amount ? money(o.amount) : t("nasiya")}</b></div>;
}

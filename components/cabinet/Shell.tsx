"use client";
import { Link, LangSwitch, useT, tk } from "@/components/I18n";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { SvgDefs, Logo, Icon } from "@/components/Icons";
import { TITLES, TABS, SUG, routeKey, isTool, backHref } from "@/lib/cabinet";
import { useStore } from "./Store";
import { AnswerSheet } from "./Reply";
import { BankReport, BigConfirm, CameraSheet, ChooseKind, VoiceSheet } from "./Sheets";
import { AddOperation } from "./AddOperation";
import { HistorySheet } from "./Chat";

const NAV_ICONS: Record<string, ReactNode> = {
  bugun: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="10" height="10" rx="2" /><rect x="11" y="11" width="10" height="10" rx="2" /></svg>,
  consul: <svg viewBox="0 0 200 200"><use href="#logo" /></svg>,
  pul: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 20h16M7 16v-5M12 16V6M17 16v-8" /></svg>,
  vositalar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></svg>,
};

export function Shell({ children }: { children: ReactNode }) { const t = useT();
  const s = useStore(), path = usePathname(), key = routeKey(path);
  const [text, setText] = useState("");
  const { sheet, closeSheet } = s;
  const sheetRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!sheet) return;
    const previous = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () => Array.from(sheetRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select, textarea, a[href], [tabindex="0"]') || []).filter(el => el.getClientRects().length > 0);
    const raf = requestAnimationFrame(() => {
      const first = sheetRef.current?.querySelector<HTMLElement>('[autofocus], .amount-field input') || focusable()[0] || sheetRef.current;
      first?.focus();
    });
    const keydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); closeSheet(); }
      if (e.key !== "Tab") return;
      const items = focusable(), first = items[0], last = items[items.length - 1];
      if (!first) { e.preventDefault(); return; }
      if (e.shiftKey && (document.activeElement === first || !sheetRef.current?.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || !sheetRef.current?.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", keydown);
    return () => { cancelAnimationFrame(raf); document.body.style.overflow = oldOverflow; document.removeEventListener("keydown", keydown); previous?.focus(); };
  }, [sheet, closeSheet]);
  useEffect(() => { s.setRoute(key); s.closeSheet(); window.scrollTo(0, 0); }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    s.setUi({
      answerSheet: (q, r) => <AnswerSheet q={q} r={r} />,
      chooseKind: (t, a) => <ChooseKind text={t} amount={a} />,
      bigConfirm: (t, a) => <BigConfirm text={t} amount={a} />,
      bankReport: () => <BankReport />,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { document.title = tk("Consul — ") + t(TITLES[key] || "Kabinet"); }, [key, t]);

  const tab = (TABS.find(t => t.key === key)?.key) ?? (key.startsWith("men") ? "" : "vositalar");
  const tool = isTool(key);
  const send = () => { const t = text.trim(); if (!t) return; setText(""); s.handle(t); };
  const lastReply = [...s.msgs].reverse().find(m => m.reply);
  const chips = key === "consul" && lastReply?.reply?.sug ? lastReply.reply.sug.slice(0, 2) : (SUG[key] || []).map(x => t(x));

  return (
    <div className={`cab r-${key}${s.bigText ? " bigtext" : ""}`}>
      <SvgDefs />
      <header className="tb"><Link className="brand" href="/app"><Logo />{t("Consul")}</Link>
        <nav>{TABS.map(x => <Link key={x.key} href={x.href} className={tab === x.key ? "on" : ""}>{t(x.label)}</Link>)}</nav>
        <span className="r"><button className="btn add-top" onClick={() => s.openSheet(<AddOperation />)} aria-label={t("Operatsiya qoʻshish")}><b aria-hidden="true">+</b><span>{t("Operatsiya qoʻshish")}</span></button><LangSwitch /><Link className="av" href="/app/men">D</Link></span></header>
      <div className="mh"><span className="t">
        {tool && <Link className="mback" href={backHref(key)} aria-label={t("Orqaga")}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg></Link>}
        {!tool && <Logo />}<span>{t(TITLES[key])}</span></span>
        <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="mobile-add" onClick={() => s.openSheet(<AddOperation />)} aria-label={t("Operatsiya qoʻshish")}>+</button>
          <button className="hbtn" onClick={() => s.openSheet(<HistorySheet />)} aria-label={t("Suhbatlar")}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v4h4M12 7v5l3 2" /></svg></button>
          <Link className="av" href="/app/men">D</Link></span></div>
      <main className="wrap">{children}</main>
      <div className="dock">
        <div id="toastBox">{s.toast && <div className={"toast" + (s.toast.warn ? " warn" : "")}><span><b>{s.toast.main}</b>{s.toast.sub && <><br /><small>{s.toast.sub}</small></>}</span>
          {s.toast.undo && <button onClick={() => { s.toast?.undo?.(); s.hideToast(); }}>{t("Bekor qilish")}</button>}</div>}</div>
        <div className={"sug" + (key === "consul" ? "" : " only-focus")} id="sug" onMouseDown={e => e.preventDefault()}>
          {chips.map(x => <button key={x} onClick={() => s.handle(x)}>{x}</button>)}</div>
        <div className="ab">
          <button className="ic" title={t("Chek surati")} onClick={() => s.openSheet(<CameraSheet />)}><Icon id="i-cam" size={22} /></button>
          <input id="inp" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === "Enter") send(); }} placeholder={key === "consul" ? t("Consulga savol bering…") : t("Consulga ayting…")} aria-label={t("Consulga yozing")} />
          {text.trim() ? <button className="ib send" id="bSend" title={t("Yuborish")} onClick={send}><Icon id="i-up" size={22} /></button>
            : <button className="ib mic" id="bMic" title={t("Ovoz bilan")} onClick={() => s.openSheet(<VoiceSheet />)}><Icon id="i-mic" size={22} /></button>}
        </div>
        <nav className="nav">{(["bugun", "consul", "pul", "vositalar"] as const).map(k => <Link key={k} href={k === "bugun" ? "/app" : "/app/" + k} className={(tab === k ? "on " : "") + (k === "consul" ? "cn" : "")}>{NAV_ICONS[k]}{t(TITLES[k])}</Link>)}</nav>
      </div>
      <div className={"ov" + (s.sheet ? " in" : "")} onClick={s.closeSheet} />
      <div ref={sheetRef} className={"sheet" + (s.sheet ? " in" : "")} role="dialog" aria-modal="true" aria-label={t("Amal oynasi")} tabIndex={-1} inert={!s.sheet}><div className="gr" /><div id="shBody">{s.sheet}</div></div>
    </div>
  );
}

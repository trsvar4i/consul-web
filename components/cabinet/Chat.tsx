"use client";
import { useT, tk } from "@/components/I18n";
import { useEffect, useRef, useState } from "react";
import { answer } from "@/lib/answer";
import { Mark } from "@/components/Icons";
import { useStore, type ChatItem } from "./Store";
import { Bubble, Thinking } from "./Reply";

const STARTERS: [string, string][] = [["plan", tk("Biznes-reja tuzish")], ["loan", tk("Kredit olsam boʻladimi?")], ["tax", tk("Soliqni tushuntir")], ["price", tk("Narxim toʻgʻrimi?")]];
const OLD_Q: Record<string, string> = { loan: tk("Kredit olsam boʻladimi?"), tax: tk("Soliqni tushuntir."), price: tk("Narxim toʻgʻrimi?") };

function useHistory() {
  const s = useStore(), t = useT();
  const open = (h: ChatItem) => {
    s.closeSheet();
    if (h.id === "live") return;
    const q = t(OLD_Q[h.topic] || h.title);
    const r = answer(q, { ledger: s.ledger, view: s.view, route: "consul", last: null, t });
    s.loadChat(h, q, r.reply, r.topic);
  };
  return open;
}

function HistoryList({ q = "" }: { q?: string }) {
  const s = useStore(), open = useHistory(), t = useT();
  const list = s.history.filter(h => t(h.title).toLowerCase().includes(q.toLowerCase()));
  return <>{list.map((h, i) => {
    const head = i === 0 || list[i - 1].group !== h.group ? <p className="cgrp">{t(h.group)}</p> : null;
    return <div key={h.id}>{head}<a className={"ch" + (s.chatId === h.id ? " on" : "")} onClick={() => open(h)} role="button" tabIndex={0}>{t(h.title)}<small>{t(h.date)}</small></a></div>;
  })}</>;
}

export function HistorySheet() { const t = useT();
  const s = useStore();
  return <><h4>{t("Suhbatlar")}</h4><button className="cnew" onClick={() => { s.newChat(); s.closeSheet(); }}>{t("+ Yangi suhbat")}</button><div><HistoryList /></div></>;
}

export function ConsulChat() { const t = useT();
  const s = useStore(), open = useHistory();
  const [q, setQ] = useState("");
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [s.msgs]);
  return (
    <section className="scr on" id="s-consul"><div className="cw">
      <aside className="chist">
        <button className="cnew" onClick={s.newChat}>{t("+ Yangi suhbat")}</button>
        <input className="csearch" placeholder={t("Suhbatlarni qidirish")} value={q} onChange={e => setQ(e.target.value)} />
        <div><HistoryList q={q} /></div>
      </aside>
      <div className="cmain">
        {s.msgs.length === 0 && <div className="cemp">
          <Mark size={56} className="cmk" />
          <h3>{t("Nima haqida gaplashamiz, Dilnoza?")}</h3>
          <div className="cstart">{STARTERS.map(([k, label]) => <button key={k} onClick={() => { s.setTopic(null); s.chat(t(label)); }}>{t(label)}</button>)}</div>
          <a className="cresume" onClick={() => open(s.history.find(h => h.id === "c1")!)} role="button" tabIndex={0}>{t("Davom ettirish:")} <b>{t("Kredit 34 mln")}</b> {t("· kecha →")}</a>
        </div>}
        <div className="cmsgs">
          {s.chatTitle && <p className="cgrp" style={{ textAlign: "center" }}>{t(s.chatTitle)}</p>}
          {s.msgs.map(m => m.role === "user" ? <div key={m.id} className="mu">{m.text}</div> : m.thinking ? <Thinking key={m.id} /> : m.reply ? <Bubble key={m.id} r={m.reply} voice={m.voice} /> : null)}
          <div ref={end} />
        </div>
      </div>
    </div></section>
  );
}

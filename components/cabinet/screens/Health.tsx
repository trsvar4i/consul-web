"use client";
import { Link, useT, tk } from "@/components/I18n";
import { useStore } from "../Store";
import { AddOperation } from "../AddOperation";
import { Screen } from "./common";

const CHECKS = [
  { id: "balance", title: tk("Pul qoldigʻi"), text: tk("Naqd va bankdagi qoldiqni hisob bilan solishtiring."), href: "/app/pul" },
  { id: "payments", title: tk("Majburiy toʻlovlar"), text: tk("Ijara, taʼminotchi va yaqin toʻlovlarni tekshiring."), href: "/app/pul" },
  { id: "tax", title: tk("Soliq rejimi"), text: tk("Rejim va hisoblash uchun kiritilgan maʼlumotlarni tekshiring."), href: "/app/soliq" },
  { id: "reserve", title: tk("Moliyaviy zaxira"), text: tk("Kutilmagan xarajatlar uchun zaxira belgilang."), href: "/app/men/biznes" },
  { id: "debt", title: tk("Qarzlar nazorati"), text: tk("Mijozlar qarzi va qaytarish muddatlarini tekshiring."), href: "/app/nasiya" },
  { id: "plan", title: tk("Rivojlanish rejasi"), text: tk("Keyingi qadam uchun xarajat va daromadni hisoblang."), href: "/app/reja" },
];

export default function Health() {
  const t = useT(), s = useStore();
  const checks = s.ledger.checks || {};
  const hasOps = s.ledger.ops.length > 0;
  const done = Number(hasOps) + CHECKS.filter(x => checks[x.id]).length;
  const next = !hasOps ? null : CHECKS.find(x => !checks[x.id]);
  return <Screen id="health" title={t("Biznes diagnostikasi")}>
    <p className="lead">{t("Hisobdagi tartib va keyingi amaliy qadam. Oʻzingiz tekshirib, belgilab boring.")}</p>
    <div className="health-summary"><div><p className="eyebrow">{t("Tekshiruv holati")}</p><h3>{t("{n} / 7 qadam bajarildi", { n: done })}</h3><p>{t("Bu kredit reytingi emas, biznesingiz uchun ish roʻyxati.")}</p></div><span className="health-count">{done}<small>/ 7</small></span>
      <progress value={done} max={7} aria-label={t("Tekshiruv holati")} />
    </div>
    <div className="health-layout"><div className="health-checks">
      <div className="health-row"><span className={"check-mark" + (hasOps ? " done" : "")}>{hasOps ? "✓" : "01"}</span><div><h4>{t("Operatsiyalar hisobi")}</h4><p>{t("Daromad va xarajatlarni muntazam qayd eting.")}</p><button className="text-action" onClick={() => s.openSheet(<AddOperation />)}>{t("Operatsiya qoʻshish")} →</button></div><span className="health-status">{hasOps ? t("Yozuvlar bor") : t("Boshlang")}</span></div>
      {CHECKS.map((x, i) => <div className="health-row" key={x.id}><label className="check-control"><input type="checkbox" checked={!!checks[x.id]} onChange={e => s.setCheck(x.id, e.target.checked)} aria-label={t(x.title)} /><span className={"check-mark" + (checks[x.id] ? " done" : "")}>{checks[x.id] ? "✓" : `0${i + 2}`}</span></label><div><h4>{t(x.title)}</h4><p>{t(x.text)}</p><Link className="text-action" href={x.href}>{t("Tekshirish")} →</Link></div></div>)}
    </div><aside className="health-next"><p className="eyebrow">{t("Keyingi qadam")}</p><h3>{!hasOps ? t("Birinchi operatsiya") : next ? t(next.title) : t("Hammasi tekshirildi")}</h3><p>{!hasOps ? t("Daromad va xarajatlarni muntazam qayd eting.") : next ? t(next.text) : t("Maʼlumotlar oʻzgarganda tekshiruvni yangilang.")}</p>{!hasOps ? <button className="btn" onClick={() => s.openSheet(<AddOperation />)}>{t("Operatsiya qoʻshish")}</button> : <Link className="btn" href={next?.href || "/app"}>{t(next ? "Tekshirish" : "Umumiy koʻrinish")}</Link>}<p className="note">{t("Belgilar shu brauzerda saqlanadi. Bank qarori alohida tekshiruvga bogʻliq.")}</p></aside></div>
  </Screen>;
}

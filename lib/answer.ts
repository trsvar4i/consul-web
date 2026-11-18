/** Template answers for the Consul chat. Code does the math; words are fixed templates until the LLM is connected. */
import { fmt, mln as mlnUz, roundK } from "./format";
import { annuity, safeLoan } from "./finance";
import { PROFIT_3M, type Ledger, type View } from "./ledger";
import { amount, norm } from "./parse";

export type Action = { label: string; href?: string; cx?: string; run?: "why" | "bankReport" | "planWizard" | "planReport"; primary?: boolean };
export interface Reply {
  text: string;                       // supports **bold**
  card?: { title: string; value: string; rows: [string, string][] };
  actions?: Action[];
  ask?: string;
  work?: [ok: boolean, line: string][];
  sug?: string[];
  fallback?: boolean;
}
export type Topic = "plan" | "loan" | "tax" | "price" | "profit" | "spend" | "help" | "buy" | "learn" | null;
export type Tr = (s: string, p?: Record<string, string | number>) => string;
export interface Ctx { ledger: Ledger; view: View; route: string; last: Topic; t?: Tr }
const ident: Tr = (s, p) => (p ? s.replace(/\{(\w+)\}/g, (_, k) => String(p[k] ?? "")) : s);

const pay = (L: number, n = 24) => annuity(L, n, 0.02);
const PLAN = { capital: 30_000_000, sales: 25_000_000, cogs: 0.64, rent: 2_700_000, helper: 2_000_000 };
export const GLOSSARY: Record<string, string> = {
  stavka: "**Yillik stavka** — kredit narxi bir yil uchun. 24% yillik ≈ oyiga 2%. 34 mln ni 24 oyga olsangiz, ~9 mln foiz toʻlaysiz.",
  marja: "**Marja** — sotish narxidagi foyda ulushi. 70 200 ga sotib, 45 000 ga olsangiz: foyda 25 200, marja 36%.",
  ustama: "**Ustama** — tannarxga qoʻshilgan foiz. 45 000 + 56% = 70 200. Ustama 56% boʻlsa ham, marja 36% — ular har xil.",
  zaxira: "**Zaxira** — kutilmagan xarajat uchun ajratilgan pul. Uni «sarflash mumkin»ga qoʻshmaymiz.",
  qqs: "**QQS** — qoʻshilgan qiymat soligʻi, 12%. Siz YaTT sifatida aylanmadan 1% toʻlaysiz, QQS emas.",
  aylanma: "**Aylanma** — barcha sotuvlar summasi, xarajatlarni ayirmasdan. Aylanma soligʻi shundan olinadi.",
  nasiya: "**Nasiya** — mijoz tovarni olib, pulni keyin beradi. Consul kim qancha qarzligini eslab turadi.",
  zararsizlik: "**Zararsizlik nuqtasi** — doimiy xarajatlarni qoplash uchun kerakli savdo. Undan ortigʻi — foyda.",
};

/** Russian words for glossary terms. */
const RU_TERMS: Record<string, RegExp> = { stavka: /ставк/, marja: /маржа|маржу/, ustama: /наценк/, zaxira: /резерв|запас/, qqs: /ндс/, aylanma: /оборот/, nasiya: /насия|в долг/, zararsizlik: /безубыточ/ };

export function answer(raw: string, c: Ctx): { reply: Reply; topic: Topic } {
  const T = c.t ?? ident, mln = (n: number) => mlnUz(n).replace(/mlrd|mln/, w => T(w));
  let t = norm(raw);
  const a = amount(t), v = c.view, m = c.ledger.money;
  let last = c.last;
  const R = (reply: Reply, topic: Topic = last) => ({ reply, topic });
  if (/pdf|hisobot|отчёт|отчет/.test(t)) return R({ text: T("Bank uchun hisobot tayyor: daromad, foyda, soliq, qarzlar — 3 oy."), actions: [{ label: T("Hisobotni ochish"), run: "bankReport", primary: true }] });
  if ((c.route === "reja" || /ijara.*boʻlsa|аренда.*будет|если аренда/.test(t)) && a) last = "plan";
  if ((c.route === "kredit" || c.route === "hisob") && a && /olsam|возьму|взять/.test(t) && !/xarid|закуп|товар/.test(t)) t = "kredit " + t;
  if (/1 mlrd|mlrd dan|млрд/.test(t)) last = "tax";
  if (/^(salom|assalom|привет|здравств)/.test(t)) return R({ text: T("Assalomu alaykum! Bugun sarflash mumkin: **{p0}**. Nima qilamiz?", { p0: fmt(v.free) }), sug: [T("qancha foyda qildim?"), T("kredit olsam boʻladimi?")] });
  if (/rahmat|спасибо/.test(t)) return R({ text: T("Arzimaydi. Yana savol boʻlsa — yozing yoki ayting.") });

  if (last === "plan" && a && !/kredit|кредит/.test(t)) {
    const pf = PLAN.sales * (1 - PLAN.cogs) - a - PLAN.helper, mo = Math.ceil(PLAN.capital / Math.max(pf, 1));
    return R({ text: T("Ijara {p0} boʻlsa, ikkinchi rasta oyiga **~{p1}** foyda beradi va **{p2} oyda** oʻzini oqlaydi.", { p0: fmt(a), p1: fmt(pf), p2: mo }),
      card: { title: T("Biznes-reja · ikkinchi rasta"), value: T("{p0} oyda oʻzini oqlaydi", { p0: mo }), rows: [[T("Qoʻshimcha sotuv"), fmt(PLAN.sales)], [T("Xarid"), "−" + fmt(PLAN.sales * PLAN.cogs)], [T("Ijara"), "−" + fmt(a)], [T("Yordamchi"), "−" + fmt(PLAN.helper)], [T("Foyda / oy"), "~" + fmt(pf)]] },
      actions: [{ label: T("Rejani ochish"), href: "/app/reja", primary: true }], work: [[true, T("Kalkulyator: {p0} ÷ {p1}", { p0: fmt(PLAN.capital), p1: fmt(pf) })]], sug: [T("kredit kerakmi?")] }, "plan");
  }
  if (last === "plan" && /bilmayman|не знаю/.test(t))
    return R({ text: T("Mayli, Chorsu uchun taxminiy **2 700 000** bilan qoldiraman va rejada «taxmin» deb belgilayman."), sug: [T("kredit kerakmi?")] });
  if ((last === "plan" && /kredit|кредит/.test(t)) || /kredit kerakmi|нужен ли кредит|кредит нужен/.test(t)) {
    const need = PLAN.capital - Math.max(v.free, 0), L = Math.ceil(need / 1e6) * 1e6, p = pay(L);
    return R({ text: T("Ha. Erkin pulingiz {p0}, yetmagani ~**{p1}**. 24 oyga olsangiz, oyiga ~{p2} — oʻrtacha oylik foydangizning {p3}%.", { p0: fmt(Math.max(v.free, 0)), p1: mln(L), p2: fmt(roundK(p)), p3: Math.round((p / PROFIT_3M) * 100) }),
      card: { title: T("Rasta uchun kredit"), value: fmt(L), rows: [[T("Oylik toʻlov"), "~" + fmt(roundK(p))], [T("Foydadan"), Math.round((p / PROFIT_3M) * 100) + "%"]] },
      actions: [{ label: T("Kalkulyatorda oʻzgartirish"), href: "/app/hisob", cx: "kredit", primary: true }], work: [[true, T("Annuitet, 24 oy, 24% — namuna")], [false, T("Bank stavkasi boshqacha boʻlishi mumkin")]], sug: [T("stavka nima?")] }, "loan");
  }
  if (last === "loan" && /rasta|xarid|точк|прилав|закуп|товар/.test(t)) {
    const r = /rasta|точк|прилав/.test(t);
    return R({ text: r ? T("Rasta uzoq muddat foyda beradi — **24 oy** muddat mos. Toʻlov foydaning 30% idan oshmasin.") : T("Tovar tez sotiladi — **6–12 oy** qisqa muddat yaxshi: foiz kamroq. Masalan, 10 mln 12 oyga — oyiga ~{p0}.", { p0: fmt(roundK(pay(1e7, 12))) }), sug: [T("PDF tayyorla")] });
  }
  if (last === "tax" && /mlrd|oshsa|млрд|превыс|больше/.test(t)) {
    const end = m.ytd + m.income * 1.5;
    return R({ text: T("Yillik aylanma 1 mlrd dan oshsa, stavka **1% → 4%**. ~4,9 mlrd dan keyin — umumiy rejim (QQS). Sizda yil oxirigacha taxminan **{p0}** — bu yil 1% da qolasiz.", { p0: mln(end) }), actions: [{ label: T("Rejimlarni solishtirish"), href: "/app/hisob", cx: "soliq", primary: true }] });
  }
  if (last === "price" && /dushanba|eslat|понедельник|напомн|напомин/.test(t)) return R({ text: T("Yaxshi. Keyingi xariddan oldin Chorsu va Oloy narxini solishtirib, eslataman.") });
  if (/foyda|topdim|прибыл|zarar|заработ|убыт/.test(t))
    return R({ text: T("Noyabrda foyda **{p0}** — daromadning {p1}%. Oktyabrda 14% edi: asosiy sabab — oʻrik qoqini qimmat olgansiz.", { p0: fmt(v.profit), p1: v.margin }),
      card: { title: T("Noyabr"), value: fmt(v.profit), rows: [[T("Daromad"), fmt(m.income)], [T("Xarid"), "−" + fmt(m.buy)], [T("Ijara, maosh, kommunal"), "−" + fmt(m.other)]] },
      actions: [{ label: T("Pul sahifasi"), href: "/app/pul", primary: true }], work: [[true, T("Operatsiyalar: daromad − xarajat")]], sug: [T("narxim toʻgʻrimi?")] }, "profit");
  if (/sarfla|erkin|bugun qancha|qancha pul|qancha qoldi|сколько (можно|денег)|потратить|свободн/.test(t))
    return R({ text: T("Bugun sarflash mumkin: **{p0}**. Pulingiz {p1}, lekin 30 kunda {p2} toʻlov bor va {p3} zaxira.", { p0: fmt(v.free), p1: fmt(v.cash), p2: fmt(v.obligations), p3: fmt(v.reserve) }), actions: [{ label: T("Batafsil"), run: "why", primary: true }], work: [[true, T("Pul − toʻlovlar − zaxira")]] }, "spend");
  if (/yordamchi|ishchi|sotuvchi ol|сотрудник|помощник|продавц|работник/.test(t) && !/полдня|полставк|yarim kun/.test(t)) {
    const need = Math.round(2_000_000 / 0.36 / 1e5) * 1e5;
    return R({ text: T("Yordamchi oyiga 2 mln boʻlsa, foyda {p0} → {p1}. Oʻzini oqlashi uchun savdo kamida **+{p2}/oy** (~{p3}%) oshishi kerak.", { p0: fmt(PROFIT_3M), p1: fmt(PROFIT_3M - 2_000_000), p2: fmt(need), p3: Math.round((need / m.income) * 100) }),
      actions: [{ label: T("Agar…? da koʻrish"), href: "/app/agar", primary: true }], work: [[true, T("Marja 36% — narx 70 200, tannarx 45 000")]], sug: [T("yarim kunga olsam?")] }, "help");
  }
  if (/yarim kun|полдня|полставк|на пол/.test(t)) return R({ text: T("Yarim kun (1 mln/oy) xavfsizroq: savdo ~+2,8 mln/oy oshsa yetadi. Bir oy sinab koʻring.") });
  if (/kredit|qarz ol|кредит|займ/.test(t)) {
    const L = a || 34_000_000, p = pay(L), sh = Math.round((p / PROFIT_3M) * 100), safe = safeLoan(PROFIT_3M);
    const vd = sh <= 30 ? T("xavfsiz") : sh <= 45 ? T("ehtiyot boʻling") : T("xavfli");
    return R({ text: T("{p0} 24 oyga: oyiga ~**{p1}** — oʻrtacha foydangizning {p2}%, **{p3}**. {p4}Xavfsiz chegara — {p5}.", { p0: mln(L), p1: fmt(roundK(p)), p2: sh, p3: vd, p4: sh > 30 ? T("Qoida: 30% dan oshmasin. ") : "", p5: mln(safe) }),
      card: { title: T("Kredit · 24 oy · 24%"), value: fmt(L), rows: [[T("Oylik toʻlov"), "~" + fmt(roundK(p))], [T("Foydadan"), sh + "%"], [T("Jami foiz"), "~" + fmt(roundK(p * 24 - L))]] },
      actions: [{ label: T("Stavka va muddatni oʻzgartirish"), href: "/app/hisob", cx: "kredit", primary: true }, { label: T("Bankka tayyorlik"), href: "/app/kredit" }],
      work: [[true, T("Oʻrtacha oylik foyda, 3 oy: ") + fmt(PROFIT_3M)], [true, T("Kalkulyator: annuitet, 24% — namuna")]],
      ask: a ? undefined : T("Kredit nima uchun kerak? Maqsadga qarab muddatni tanlaymiz."), sug: a ? [T("PDF tayyorla")] : [T("ikkinchi rasta"), T("xarid uchun")] }, "loan");
  }
  if (/(xarid qilsam|olsam|sotib olsam|куплю|закуплю|если купить)/.test(t) && a) {
    const ok = a <= v.free;
    return R({ text: ok ? T("Ha, {p0} ni olsangiz ham toʻlovlarga yetadi. Keyin erkin: **{p1}**.", { p0: fmt(a), p1: fmt(v.free - a) }) : T("Hozir erkin **{p0}**. {p1} olsangiz, {p2} yetmaydi — ijara yoki taʼminotchiga toʻlov kechikadi. Boʻlib olish variantlarini koʻring.", { p0: fmt(v.free), p1: fmt(a), p2: fmt(a - v.free) }),
      actions: [{ label: T("Agar…? da variantlar"), href: "/app/agar", primary: true }], work: [[true, T("Erkin pul: ") + fmt(v.free)]] }, "buy");
  }
  if (/soliq|налог/.test(t))
    return R({ text: T("Noyabr uchun soliq — **{p0}** (aylanmadan 1%), **15-dekabrgacha**. Bu summa sarflash mumkin boʻlgan puldan oldindan ayirilgan. 12-dekabrda eslataman.", { p0: fmt(v.tax) }),
      card: { title: T("Soliq · noyabr"), value: fmt(v.tax), rows: [[`${fmt(m.income)} × 1%`, fmt(v.tax)], [T("Yil boshidan aylanma"), mln(m.ytd)]] },
      actions: [{ label: T("Soliq sahifasi"), href: "/app/soliq", primary: true }], work: [[true, T("Maqom: YaTT · aylanmadan 1%")], [true, T("Qoidalar: 2026-yil")]], sug: [T("1 mlrd dan oshsa?")] }, "tax");
  if (/reja|rasta|ochmoqchi|бизнес-план|план|точк|открыть/.test(t)) {
    const pf = PLAN.sales * (1 - PLAN.cogs) - PLAN.rent - PLAN.helper;
    return R({ text: T("Mumkin. 30 mln kapital bilan ikkinchi rasta taxminan **7 oyda** oʻzini oqlaydi. Lekin hozir erkin pulingiz {p0} — kapitalni kredit yoki bosqichma-bosqich toʻplash kerak.", { p0: mln(Math.max(v.free, 0)) }),
      card: { title: T("Biznes-reja · ikkinchi rasta"), value: T("7 oyda oʻzini oqlaydi"), rows: [[T("Kapital"), fmt(PLAN.capital)], [T("Qoʻshimcha sotuv"), fmt(PLAN.sales) + T("/oy")], [T("Qoʻshimcha foyda"), "~" + fmt(pf) + T("/oy")]] },
      actions: [{ label: T("Rejani ochish"), href: "/app/reja", primary: true }, { label: T("Yangi reja tuzish"), run: "planWizard" }],
      work: [[true, T("Sotuvlaringiz tahlil qilindi · 3 oy")], [true, T("Kalkulyator: oʻzini oqlash muddati")], [false, T("Ijara narxi — taxmin, sizdan soʻrayman")]],
      ask: T("Rasta ijarasi qancha boʻlishini bilasizmi? Aniq raqam bersangiz, reja aniqroq boʻladi."), sug: [T("2,5 mln"), T("bilmayman"), T("kredit kerakmi?")] }, "plan");
  }
  if (/narx|qimmat|arzon|ustama|marja|qayerda|цен|дорог|дешев|наценк|маржа/.test(t) && !/nima|что такое|что значит/.test(t))
    return R({ text: T("Sotish narxingiz bozorga mos. Muammo — **xarid narxida**: qoqini 12% qimmat oldingiz, oyiga ~1,1 mln ortiqcha."),
      card: { title: T("Oʻrik qoqi · 1 kg"), value: "50 400 → 45 000", rows: [[T("Chorsu medianasi"), "45 000"], [T("Oloy"), "43 500"]] },
      actions: [{ label: T("Bozor narxlari"), href: "/app/bozor", primary: true }], work: [[true, T("Marjangiz: 36%")], [false, T("Oʻrik qoqi xaridi: medianadan +12%")]],
      ask: T("Keyingi xaridni qachon qilasiz? Eslatib, narxni solishtirib beraman."), sug: [T("dushanba"), T("eslatma qoʻy")] }, "price");
  if (/nasiya|qarzdor|kim qarz|должн|долг|насия/.test(t)) {
    const l = c.ledger.debtors.map(d => `${d.name} — ${fmt(d.amount)}`).join(", ");
    return R({ text: c.ledger.debtors.length ? T("Sizga {p0} kishi qarz: {p1}. Jami **{p2}**.", { p0: v.debtorCount, p1: l, p2: fmt(v.owedToMe) }) : T("Hozir hech kim sizga qarz emas."), actions: [{ label: T("Nasiya daftari"), href: "/app/nasiya", primary: true }] });
  }
  if (/roʻyxat|rasmiy|yatt|oq biznes|регистрац|ип |официальн|белый бизнес/.test(t))
    return R({ text: T("Siz allaqachon **YaTT** sifatida rasmiysiz ✓. Roʻyxatdan oʻtmagan tanishingiz boʻlsa, «Oq biznes» unga qancha soliq va qanday foyda boʻlishini hisoblab beradi."), actions: [{ label: T("Oq biznes"), href: "/app/oq", primary: true }] });
  const g = Object.keys(GLOSSARY).find(k => t.includes(k) || RU_TERMS[k]?.test(t));
  if (g) return R({ text: T(GLOSSARY[g]), actions: [{ label: T("Darslar"), href: "/app/learn", primary: true }] }, "learn");
  return R({ text: T("Buni hali tushunmadim. Men biznesingiz puli boʻyicha yordam beraman: savdo, xarajat, nasiya, kredit, soliq, narx."), fallback: true, sug: [T("qancha foyda qildim?"), T("20 mln kredit olsam?"), T("soliq qachon?")] });
}

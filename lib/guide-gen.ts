// Заглушка ИИ-генератора гайдов. Когда подключим бэкенд, api.generateGuide пойдёт
// в POST /api/assistant/generate-guide и вернёт тот же формат UserGuide.
import type { Locale } from "./types";

export type GuideBlock =
  | { type: "md"; md: string }
  | { type: "checklist"; title: string; items: string[] }
  | { type: "quiz"; question: string; options: { text: string; correct: boolean; explain: string }[] }
  | { type: "whatif"; kind: "debt" | "profit" | "cash" | "price" }
  | { type: "tool"; tool: "credit" | "tax-regime" | "markup" }
  | { type: "ask"; question: string };

export type UserGuide = {
  id: string;
  createdAt: string;
  locale: Locale;
  problem: string;
  topic: Topic;
  title: string;
  description: string;
  tag: string;
  readMinutes: number;
  blocks: GuideBlock[];
};

export type Topic = "debt" | "credit" | "tax" | "cash" | "price";

const KEYWORDS: Record<Topic, string[]> = {
  debt: ["долг", "должн", "qarz", "вернут", "qaytar", "нася", "в долг"],
  credit: ["кредит", "kredit", "займ", "заём", "банк", "bank", "рассроч"],
  tax: ["налог", "soliq", "ндс", "qqs", "режим", "rejim", "ип ", "yatt"],
  price: ["цен", "narx", "наценк", "ustama", "марж", "дешев", "дорог"],
  cash: ["денег", "pul", "касс", "kassa", "потрат", "sarfla", "остат", "зарплат", "аренд"],
};

export function detectTopic(text: string): Topic {
  const n = text.toLowerCase();
  let best: Topic = "cash";
  let score = 0;
  (Object.keys(KEYWORDS) as Topic[]).forEach((k) => {
    const s = KEYWORDS[k].filter((w) => n.includes(w)).length;
    if (s > score) { score = s; best = k; }
  });
  return best;
}

type Tpl = { title: string; description: string; tag: string; blocks: GuideBlock[] };
type TplFn = (problem: string) => Tpl;

const RU: Record<Topic, TplFn> = {
  debt: (p) => ({
    title: "Как вернуть долги покупателей и не потерять клиентов",
    description: "Почему долги съедают деньги, хотя продажи растут, и что делать уже на этой неделе.",
    tag: "Долги",
    blocks: [
      { type: "md", md: `## Что происходит\n\nВы написали: «${p}». Это частая история: товар отдан, выручка записана, а **денег в кассе нет**. Долг покупателя — это ваш беспроцентный кредит ему.\n\n## Почему это опасно\n\n- Аренда и зарплата приходят по расписанию, а долги — когда захочет покупатель.\n- Чем дольше долг, тем меньше шанс его вернуть.\n- Пока деньги у покупателя, вы закупаете товар на свои — или берёте кредит.` },
      { type: "whatif", kind: "debt" },
      { type: "md", md: "## Что делать\n\n1. Составьте список: кто, сколько, с какого числа.\n2. Установите правило: в долг — не больше одной недельной закупки клиента.\n3. Напоминайте в один и тот же день недели, спокойно и коротко.\n4. Самым надёжным дайте скидку 1–2% за оплату сразу." },
      { type: "checklist", title: "На этой неделе", items: ["Записать всех должников с суммами и датами", "Позвонить трём самым крупным", "Ввести лимит долга на одного клиента", "Внести долги в Consul — «Мне должны»"] },
      { type: "quiz", question: "Покупатель должен 2 600 000 уже 3 недели. Что сделать в первую очередь?", options: [
        { text: "Дать ещё товар в долг, чтобы не обиделся", correct: false, explain: "Долг вырастет, а деньги так и не вернутся. Сначала — погашение." },
        { text: "Договориться о дате и сумме первого платежа", correct: true, explain: "Да. Конкретная дата и сумма работают лучше, чем «когда сможешь»." },
        { text: "Ничего, он всегда возвращал", correct: false, explain: "Возможно, но пока ждёте — платите аренду из своих денег." },
      ] },
      { type: "ask", question: "Как вежливо напомнить покупателю о долге?" },
    ],
  }),
  credit: (p) => ({
    title: "Брать ли кредит на развитие: проверка за 10 минут",
    description: "Как понять, потянет ли бизнес платёж, и что будет в плохой месяц.",
    tag: "Кредит",
    blocks: [
      { type: "md", md: `## Ваш вопрос\n\n«${p}». Кредит платится **из прибыли, а не из выручки**. Поэтому начинаем с прибыли за обычный месяц.\n\n## Правило 30%\n\n- Платёж до 30% прибыли — комфортно.\n- 30–50% — тяжело: любой спад станет проблемой.\n- Больше 50% — опасно.` },
      { type: "tool", tool: "credit" },
      { type: "md", md: "## Проверьте плохой месяц\n\nПредставьте, что продажи упали на 20%. Хватит ли на платёж, аренду и зарплату? Если нет — уменьшите сумму или увеличьте срок." },
      { type: "checklist", title: "Перед походом в банк", items: ["Посчитать среднюю прибыль за 3 месяца", "Проверить нагрузку в калькуляторе", "Проверить пессимистичный сценарий", "Посчитать, на сколько вырастет прибыль от вложения"] },
      { type: "quiz", question: "Прибыль 6 млн в месяц. Какой платёж ещё комфортный?", options: [
        { text: "До 1 800 000", correct: true, explain: "Верно: 30% от 6 млн — 1,8 млн." },
        { text: "До 3 000 000", correct: false, explain: "Это 50% — уже тяжело, любой спад станет проблемой." },
        { text: "До 6 000 000", correct: false, explain: "Тогда на жизнь бизнеса не останется ничего." },
      ] },
      { type: "ask", question: "Какая сумма кредита безопасна для моего бизнеса?" },
    ],
  }),
  tax: (p) => ({
    title: "Какой налоговый режим выбрать именно вам",
    description: "Сравниваем налог с оборота, НДС 6% и общий режим на ваших цифрах.",
    tag: "Налоги",
    blocks: [
      { type: "md", md: `## Ваш вопрос\n\n«${p}». Правильный режим — тот, после которого **у бизнеса остаётся больше денег**, а не тот, где ставка меньше.\n\n## Коротко о режимах\n\n- **Налог с оборота:** 1% для ИП с оборотом до 1 млрд сум.\n- **Упрощённый НДС 6%:** для торговли, общепита и услуг.\n- **НДС 12% + 15%:** общий режим, обязателен после 12 000 БРВ.` },
      { type: "tool", tool: "tax-regime" },
      { type: "checklist", title: "Что подготовить", items: ["Выручку за год", "Закупки за год отдельно", "Прочие расходы", "Вопрос бухгалтеру о вашем районе"] },
      { type: "quiz", question: "У кого НДС-режим может быть выгоднее налога с оборота?", options: [
        { text: "У того, у кого большие закупки и маленькая наценка", correct: true, explain: "Да: входящий НДС по закупкам идёт в зачёт." },
        { text: "У того, у кого почти нет расходов", correct: false, explain: "Наоборот — тогда налог с оборота обычно дешевле." },
      ] },
      { type: "ask", question: "Почему этот режим выгоднее?" },
    ],
  }),
  cash: (p) => ({
    title: "Почему к концу месяца нет денег — и как это исправить",
    description: "Разбираем, куда уходят деньги, и считаем, сколько можно тратить безопасно.",
    tag: "Деньги",
    blocks: [
      { type: "md", md: `## Что происходит\n\nВы написали: «${p}». Обычно деньги «пропадают» не из-за маленькой выручки, а потому что **платежи и траты не видны заранее**.\n\n## Три цифры вместо одной\n\n- **Деньги сейчас** — в кассе и на карте.\n- **Обязательные платежи** — аренда, зарплата, налог за 30 дней.\n- **Резерв** — 10% месячных расходов на непредвиденное.` },
      { type: "whatif", kind: "cash" },
      { type: "checklist", title: "Сделать сегодня", items: ["Записать остаток денег", "Выписать все платежи на месяц с датами", "Отложить резерв", "Разделить личные и деньги бизнеса"] },
      { type: "quiz", question: "Личное изъятие владельца — это расход бизнеса?", options: [
        { text: "Да, это тоже траты", correct: false, explain: "Деньги уходят из кассы, но это не расход бизнеса. Записывайте отдельно." },
        { text: "Нет, это отдельная категория", correct: true, explain: "Верно. Иначе прибыль выглядит меньше, а картина — запутаннее." },
      ] },
      { type: "ask", question: "Сколько я могу потратить?" },
    ],
  }),
  price: (p) => ({
    title: "Как поставить цену, чтобы зарабатывать",
    description: "Наценка, маржа и сколько нужно продать, чтобы покрыть расходы.",
    tag: "Цена",
    blocks: [
      { type: "md", md: `## Ваш вопрос\n\n«${p}». Цена — это не «как у соседа». В ней должны поместиться **закупка, аренда, зарплата и прибыль**.\n\n## Наценка ≠ маржа\n\n- Наценка считается от закупки: 25% наценки.\n- Маржа — от цены продажи: те же деньги — это 20% маржи.` },
      { type: "whatif", kind: "price" },
      { type: "tool", tool: "markup" },
      { type: "checklist", title: "Проверьте свои цены", items: ["Выписать закупочную цену 5 главных товаров", "Посчитать маржу каждого", "Посчитать, сколько штук нужно продать за месяц", "Найти товар с самой низкой маржой"] },
      { type: "quiz", question: "Закупка 100, продажа 125. Какая маржа?", options: [
        { text: "25%", correct: false, explain: "Это наценка — она считается от закупки." },
        { text: "20%", correct: true, explain: "Верно: 25 из 125 — это 20%." },
      ] },
      { type: "ask", question: "Как поднять маржу без потери покупателей?" },
    ],
  }),
};

const UZ: Record<Topic, TplFn> = {
  debt: (p) => ({
    title: "Xaridorlar qarzini qanday qaytarish va mijozni yoʻqotmaslik",
    description: "Nega savdo oʻsayotgan boʻlsa ham qarzlar pulni yeydi va shu haftada nima qilish kerak.",
    tag: "Qarzlar",
    blocks: [
      { type: "md", md: `## Nima boʻlyapti\n\nSiz yozdingiz: «${p}». Bu koʻp uchraydi: tovar berilgan, tushum yozilgan, lekin **kassada pul yoʻq**. Xaridor qarzi — bu siz unga bergan foizsiz kredit.\n\n## Nega bu xavfli\n\n- Ijara va maosh jadval boʻyicha keladi, qarzlar esa xaridor xohlaganda.\n- Qarz qancha uzoq tursa, qaytish ehtimoli shuncha kam.\n- Pul xaridorda turganda, tovarni oʻz pulingizga olasiz.` },
      { type: "whatif", kind: "debt" },
      { type: "md", md: "## Nima qilish kerak\n\n1. Roʻyxat tuzing: kim, qancha, qaysi sanadan.\n2. Qoida kiriting: qarzga — mijozning bir haftalik xaridigacha.\n3. Haftaning bir kunida, xotirjam va qisqa eslating.\n4. Ishonchlilarga darhol toʻlov uchun 1–2% chegirma bering." },
      { type: "checklist", title: "Shu hafta", items: ["Barcha qarzdorlarni summa va sana bilan yozish", "Eng katta uchtasiga qoʻngʻiroq qilish", "Bir mijozga qarz limitini kiritish", "Qarzlarni Consulga kiritish — «Menga qarz»"] },
      { type: "quiz", question: "Xaridor 3 haftadan beri 2 600 000 qarz. Avval nima qilish kerak?", options: [
        { text: "Xafa boʻlmasin deb yana qarzga berish", correct: false, explain: "Qarz oʻsadi, pul qaytmaydi. Avval — toʻlov." },
        { text: "Birinchi toʻlov sanasi va summasini kelishish", correct: true, explain: "Ha. Aniq sana va summa «qachon qoʻlingdan kelsa»dan yaxshiroq ishlaydi." },
        { text: "Hech narsa, u doim qaytargan", correct: false, explain: "Balki, lekin kutayotganda ijarani oʻz pulingizdan toʻlaysiz." },
      ] },
      { type: "ask", question: "Xaridorga qarzni qanday odob bilan eslatish mumkin?" },
    ],
  }),
  credit: (p) => ({
    title: "Rivojlanish uchun kredit olishmi: 10 daqiqalik tekshiruv",
    description: "Biznes toʻlovni koʻtara olishini va yomon oyda nima boʻlishini qanday bilish mumkin.",
    tag: "Kredit",
    blocks: [
      { type: "md", md: `## Savolingiz\n\n«${p}». Kredit **tushumdan emas, foydadan** toʻlanadi. Shuning uchun oddiy oydagi foydadan boshlaymiz.\n\n## 30% qoidasi\n\n- Toʻlov foydaning 30% igacha — qulay.\n- 30–50% — ogʻir.\n- 50% dan ortiq — xavfli.` },
      { type: "tool", tool: "credit" },
      { type: "md", md: "## Yomon oyni tekshiring\n\nSavdo 20% kamaydi deb tasavvur qiling. Toʻlov, ijara va maoshga yetadimi? Yetmasa — summani kamaytiring yoki muddatni uzaytiring." },
      { type: "checklist", title: "Bankka borishdan oldin", items: ["3 oylik oʻrtacha foydani hisoblash", "Kalkulyatorda yuklamani tekshirish", "Pessimistik stsenariyni tekshirish", "Sarmoyadan foyda qancha oshishini hisoblash"] },
      { type: "quiz", question: "Oylik foyda 6 mln. Qaysi toʻlov hali qulay?", options: [
        { text: "1 800 000 gacha", correct: true, explain: "Toʻgʻri: 6 mln ning 30% — 1,8 mln." },
        { text: "3 000 000 gacha", correct: false, explain: "Bu 50% — allaqachon ogʻir." },
        { text: "6 000 000 gacha", correct: false, explain: "Unda biznesga hech narsa qolmaydi." },
      ] },
      { type: "ask", question: "Biznesim uchun qaysi kredit summasi xavfsiz?" },
    ],
  }),
  tax: (p) => ({
    title: "Aynan sizga qaysi soliq rejimi mos",
    description: "Aylanma soligʻi, QQS 6% va umumiy rejimni raqamlaringizda solishtiramiz.",
    tag: "Soliqlar",
    blocks: [
      { type: "md", md: `## Savolingiz\n\n«${p}». Toʻgʻri rejim — stavkasi kichigi emas, balki **biznesda koʻproq pul qoladigani**.\n\n## Rejimlar haqida qisqacha\n\n- **Aylanma soligʻi:** aylanmasi 1 mlrd gacha YaTT uchun 1%.\n- **Soddalashtirilgan QQS 6%:** savdo, ovqatlanish va xizmatlar uchun.\n- **QQS 12% + 15%:** umumiy rejim, 12 000 BHM dan keyin majburiy.` },
      { type: "tool", tool: "tax-regime" },
      { type: "checklist", title: "Nima tayyorlash kerak", items: ["Yillik tushum", "Yillik xaridlar alohida", "Boshqa xarajatlar", "Tumaningiz boʻyicha buxgalterga savol"] },
      { type: "quiz", question: "Kimga QQS rejimi aylanma soligʻidan foydaliroq boʻlishi mumkin?", options: [
        { text: "Xaridlari katta va ustamasi kichik boʻlganga", correct: true, explain: "Ha: xaridlar boʻyicha kirish QQS hisobga olinadi." },
        { text: "Deyarli xarajati yoʻq boʻlganga", correct: false, explain: "Aksincha — unda aylanma soligʻi odatda arzonroq." },
      ] },
      { type: "ask", question: "Nega bu rejim foydaliroq?" },
    ],
  }),
  cash: (p) => ({
    title: "Nega oy oxirida pul yoʻq — va buni qanday tuzatish mumkin",
    description: "Pul qayerga ketishini tahlil qilamiz va qancha xavfsiz sarflash mumkinligini hisoblaymiz.",
    tag: "Pul",
    blocks: [
      { type: "md", md: `## Nima boʻlyapti\n\nSiz yozdingiz: «${p}». Odatda pul kam tushumdan emas, balki **toʻlov va xarajatlar oldindan koʻrinmagani** uchun «yoʻqoladi».\n\n## Bitta emas, uchta raqam\n\n- **Hozirgi pul** — kassa va kartada.\n- **Majburiy toʻlovlar** — 30 kunlik ijara, maosh, soliq.\n- **Zaxira** — oylik xarajatlarning 10%.` },
      { type: "whatif", kind: "cash" },
      { type: "checklist", title: "Bugun qilish kerak", items: ["Pul qoldigʻini yozish", "Oylik barcha toʻlovlarni sanalari bilan yozish", "Zaxira ajratish", "Shaxsiy va biznes pulini ajratish"] },
      { type: "quiz", question: "Egasining shaxsiy olishi — biznes xarajatimi?", options: [
        { text: "Ha, bu ham xarajat", correct: false, explain: "Pul kassadan chiqadi, lekin bu biznes xarajati emas. Alohida yozing." },
        { text: "Yoʻq, bu alohida toifa", correct: true, explain: "Toʻgʻri. Aks holda foyda kichikroq koʻrinadi." },
      ] },
      { type: "ask", question: "Qancha sarflashim mumkin?" },
    ],
  }),
  price: (p) => ({
    title: "Daromad qilish uchun narxni qanday qoʻyish kerak",
    description: "Ustama, marja va xarajatlarni qoplash uchun qancha sotish kerak.",
    tag: "Narx",
    blocks: [
      { type: "md", md: `## Savolingiz\n\n«${p}». Narx — «qoʻshnidagidek» emas. Unga **xarid, ijara, maosh va foyda** sigʻishi kerak.\n\n## Ustama ≠ marja\n\n- Ustama xariddan hisoblanadi: 25% ustama.\n- Marja sotuv narxidan: oʻsha pul — 20% marja.` },
      { type: "whatif", kind: "price" },
      { type: "tool", tool: "markup" },
      { type: "checklist", title: "Narxlaringizni tekshiring", items: ["5 ta asosiy tovarning xarid narxini yozish", "Har birining marjasini hisoblash", "Oyiga nechta sotish kerakligini hisoblash", "Eng past marjali tovarni topish"] },
      { type: "quiz", question: "Xarid 100, sotuv 125. Marja qancha?", options: [
        { text: "25%", correct: false, explain: "Bu ustama — u xariddan hisoblanadi." },
        { text: "20%", correct: true, explain: "Toʻgʻri: 125 dan 25 — bu 20%." },
      ] },
      { type: "ask", question: "Xaridorlarni yoʻqotmasdan marjani qanday oshirish mumkin?" },
    ],
  }),
};

export function buildGuide(problem: string, locale: Locale): UserGuide {
  const topic = detectTopic(problem);
  const tpl = (locale === "uz" ? UZ : RU)[topic](problem.trim().replace(/\s+/g, " ").slice(0, 180));
  const words = tpl.blocks.reduce((s, b) => s + (b.type === "md" ? b.md.split(/\s+/).length : 25), 0);
  return {
    id: "ug" + Math.random().toString(36).slice(2, 9),
    createdAt: new Date().toISOString(),
    locale,
    problem,
    topic,
    readMinutes: Math.max(3, Math.round(words / 120)),
    ...tpl,
  };
}

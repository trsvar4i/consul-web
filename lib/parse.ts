/** Turns a short Uzbek (or Russian) phrase into an intent. Deterministic; the LLM backend replaces it later. */
import type { Debtor, Method, OpKind } from "./ledger";

export const norm = (t: string) => t.toLowerCase().replace(/[ʻʼ'’`]/g, "ʻ").replace(/\s+/g, " ").trim();

/** Picks the money amount: numbers with a unit (mln, ming…) win; kg, months, dates are skipped. */
export function amount(t: string): number {
  const re = /(\d[\d ]*(?:[.,]\d+)?)\s*(mlrd|milliard|млрд|mln|million|millon|миллион\S*|млн|ming|минг|тыс\S*|k\b)?(\s*(kg|кг|dona|шт|ta\b|oy|kun|мес|дн|ден|%|-?san|-?chi|-?dek|-?noy|-?го|числ|дек|ноя))?/g;
  let m: RegExpExecArray | null, best: { n: number; sc: number } | null = null;
  while ((m = re.exec(t))) {
    if (m[3]) continue;
    let n = parseFloat(m[1].replace(/ /g, "").replace(",", "."));
    const u = m[2] || "";
    if (/mlrd|milliard|млрд/.test(u)) n *= 1e9;
    else if (/mln|mill|млн|миллион/.test(u)) n *= 1e6;
    else if (/ming|минг|тыс|^k/.test(u)) n *= 1e3;
    const sc = (u ? 2 : 0) + (n >= 1000 ? 1 : 0);
    if (!best || sc > best.sc || (sc === best.sc && n > best.n)) best = { n, sc };
  }
  return best && best.n >= 100 ? Math.round(best.n) : 0;
}

export const isQuestion = (t: string) =>
  /\?$|qancha|qachon|qanday|nima|nega|boʻladimi|olsam|qilsam|boʻlsa|kerakmi|qayerda|mumkinmi|сколько|когда|как |что |можно|почему|стоит ли|нужен ли|нужно ли|правильн|если /.test(t);

export const method = (t: string): Method => (/karta|click|payme|uzcard|humo|terminal|perevod|o.tkazma|карт/.test(t) ? "karta" : "naqd");

/** "karimga" -> "karim", "shoira opaga" -> "shoira opa". */
export const personTo = (t: string): string | null => {
  const m = t.match(/([a-zʻ]+(?: (?:aka|opa))?)ga\b/i) || t.match(/([а-яё]+?)(?:у|е|ю)(?= |$)(?=.*(?:в долг|насия))/);
  return m ? m[1] : null;
};
const CYR: Record<string, string> = { а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "x", ц: "s", ч: "ch", ш: "sh", щ: "sh", ъ: "", ы: "i", ь: "", э: "e", ю: "yu", я: "ya" };
/** Cyrillic to Uzbek Latin, enough to match a debtor's name typed in Russian. */
export const latin = (t: string) => t.replace(/[а-яё]/g, c => CYR[c] ?? c);
export const findDebtor = (t: string, ds: Debtor[]) => { const l = latin(t); return ds.findIndex(d => l.includes(norm(d.name).split(" ")[0])); };

const EXP = /svet|elektr\w*|gaz|suv|kommunal|ijara|maosh|oylik|transport|taksi|benzin|telefon|internet|свет|электр\S*|газ|вода|воду|коммунал\S*|аренд\S*|зарплат\S*|такси|бензин|интернет|телефон/;

const RU_EXP: [RegExp, string][] = [[/^свет|^электр/, "svet"], [/^газ/, "gaz"], [/^вод/, "suv"], [/^коммунал/, "kommunal"], [/^аренд/, "ijara"], [/^зарплат/, "maosh"], [/^такси/, "taksi"], [/^бензин/, "benzin"], [/^интернет/, "internet"], [/^телефон/, "telefon"]];
/** Russian expense words map to the Uzbek label so titles translate and rent logic still works. */
const expLabel = (w: string) => RU_EXP.find(([re]) => re.test(w))?.[1] ?? w;

export type Intent =
  | { type: "op"; kind: OpKind; amount: number; method: Method; label?: string; who?: string }
  | { type: "fix"; field: Method; amount: number }
  | { type: "rent"; amount: number; day: string }
  | { type: "question" }
  | { type: "report" }
  | { type: "need-amount" }
  | { type: "need-kind"; amount: number }
  | { type: "unknown" };

export function intent(raw: string, debtors: Debtor[]): Intent {
  const t = norm(raw), a = amount(t);
  if (/pdf|hisobot|отчёт|отчет/.test(t)) return { type: "report" };
  if (isQuestion(t)) return { type: "question" };
  if (/(naqd|kassa|kartada|kartamda|наличн\S*|касс\S*|на карте)\D{0,12}\d/.test(t) && /(qoldi|bor|^naqd|^kassa|tuzat|осталось|есть|^наличн|^касс|исправ)/.test(t) && !/sot|xarid|продал|закуп/.test(t))
    return a ? { type: "fix", field: /karta|карт/.test(t) ? "karta" : "naqd", amount: a } : { type: "need-amount" };
  if (/(ijara\b|аренд).*\d+\s*-?\s*(san|числ|го )/.test(t) && !/toʻladim|berdim|заплатил|оплатил/.test(t))
    return { type: "rent", amount: a, day: (t.match(/(\d+)\s*-?\s*(?:san|числ|го )/) || [])[1] || "5" };
  const di = findDebtor(t, debtors);
  if (di >= 0 && /toʻladi|qaytardi|berdi|вернул|отдал/.test(t)) return { type: "op", kind: "repaid", amount: a, method: "naqd", who: debtors[di].name };
  let kind: OpKind | null = null, label: string | undefined, who: string | undefined;
  if (/nasiya|qarzga ber|в долг|насия/.test(t)) { kind = "nas"; who = personTo(t) || undefined; }
  else if (/(akmal|taʼminotchi|поставщик)/.test(t) && /toʻladim|berdim|qaytardim|отдал|заплатил|вернул/.test(t)) kind = "sup";
  else if (/sot(dim|ildi|uv|di)|savdo|tushum|kassa|продал|продаж|выручк/.test(t)) kind = "sale";
  else if (/xarid|sotib ol|oldim|tovar|закуп|купил/.test(t)) { kind = "buy"; const w = t.match(/xarid\s*(?:·|-)?\s*([a-zʻ ,]{3,20}?)(?=\s*\d|$)/); label = w?.[1]?.trim() || undefined; }
  else if (EXP.test(t) || /xarajat|расход|soliq toʻladim|заплатил налог/.test(t)) { kind = "exp"; label = expLabel((t.match(EXP) || ["xarajat"])[0]); }
  if (kind && a) return { type: "op", kind, amount: a, method: method(t), label, who };
  if (kind) return { type: "need-amount" };
  if (a) return { type: "need-kind", amount: a };
  return { type: "unknown" };
}

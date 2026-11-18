"use client";
import { useRef, useState, type FormEvent } from "react";
import { tk, useT } from "@/components/I18n";
import { fmt } from "@/lib/format";
import type { OperationInput } from "@/lib/operations";
import { useStore } from "./Store";

const KINDS = [["sale", tk("Sotuv")], ["buy", tk("Xarid")], ["exp", tk("Xarajat")], ["sup", tk("Taʼminotchiga toʻlov")], ["nas", tk("Nasiya")]] as const;

export function AddOperation() {
  const t = useT(), s = useStore();
  const [kind, setKind] = useState<OperationInput["kind"]>("sale");
  const [method, setMethod] = useState<OperationInput["method"]>("naqd");
  const [amount, setAmount] = useState(""), [note, setNote] = useState(""), [who, setWho] = useState("");
  const [category, setCategory] = useState<NonNullable<OperationInput["category"]>>("xarajat");
  const [error, setError] = useState("");
  const submitted = useRef(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (submitted.current) return;
    try {
      s.addOperation({ kind, amount: Number(amount.replace(/\s/g, "")), method, note, who, category });
      submitted.current = true;
      s.closeSheet();
    } catch { setError(t("Summani va majburiy maydonlarni tekshiring.")); }
  };
  return <form className="op-form" onSubmit={submit}>
    <div className="op-heading"><div><p className="eyebrow">{t("Yangi yozuv")}</p><h4>{t("Operatsiya qoʻshish")}</h4></div><button type="button" className="close-btn" onClick={s.closeSheet} aria-label={t("Yopish")}>×</button></div>
    <p className="op-intro">{t("Balans va hisobotlar avtomatik yangilanadi.")}</p>
    <label>{t("Operatsiya turi")}<select value={kind} onChange={e => setKind(e.target.value as OperationInput["kind"])}>{KINDS.map(([k, label]) => <option key={k} value={k}>{t(label)}</option>)}</select></label>
    <label>{t("Summa")}<div className="amount-field"><input autoFocus required inputMode="numeric" autoComplete="off" placeholder="0" value={amount} onChange={e => { if (/^[\d\s]*$/.test(e.target.value) && e.target.value.replace(/\s/g, "").length <= 12) { setAmount(e.target.value); setError(""); } }} /><span>{t("soʻm")}</span></div></label>
    {kind === "exp" && <label>{t("Kategoriya")}<select value={category} onChange={e => setCategory(e.target.value as typeof category)}><option value="xarajat">{t("Boshqa xarajatlar")}</option><option value="ijara">{t("Ijara")}</option><option value="svet">{t("Kommunal toʻlovlar")}</option><option value="ish haqi">{t("Ish haqi")}</option></select></label>}
    {kind === "nas" ? <><label>{t("Mijoz ismi")}<input required maxLength={60} value={who} onChange={e => setWho(e.target.value)} /></label><p className="op-hint">{t("Savdo qayd etiladi, pul esa qarz qaytarilganda balansga tushadi.")}</p></> : <fieldset><legend>{t("Toʻlov usuli")}</legend><div className="method-options">{(["naqd", "karta"] as const).map(m => <label key={m}><input type="radio" name="method" checked={method === m} onChange={() => setMethod(m)} /><span>{t(m === "naqd" ? "Naqd" : "Karta / bank")}</span></label>)}</div></fieldset>}
    <label>{t("Izoh")}<span className="optional">{t("ixtiyoriy")}</span><input maxLength={160} value={note} onChange={e => setNote(e.target.value)} placeholder={t("Masalan, mahsulot yoki toʻlov maqsadi")} /></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="op-summary"><span>{t("Jami")}</span><b>{fmt(Number(amount.replace(/\s/g, "")) || 0)} {t("soʻm")}</b></div>
    <button className="btn w" type="submit" disabled={!Number(amount.replace(/\s/g, "")) || (kind === "nas" && !who.trim())}>{t("Saqlash")}</button>
    <p className="op-hint">{t("Sinov versiyasi: yozuvlar shu brauzerda saqlanadi.")}</p>
  </form>;
}

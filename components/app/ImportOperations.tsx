"use client";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Papa from "papaparse";
import { Camera, CheckCircle2, Download, FileSpreadsheet, FileText, Image as ImageIcon, Loader2, UploadCloud } from "lucide-react";
import { extractTransactions, importTransactions, LOCAL_PARSE, MAX_UPLOAD_MB, type ImportResult } from "@/lib/api";
import type { Transaction, TxCategory, TxMethod, TxType } from "@/lib/types";
import { Banner } from "../brand/blocks";
import { Button, ButtonLink, Card, cn, Select } from "../ui/primitives";
import { useApp } from "./AppShell";

const ACCEPT = [
  ".csv", ".txt", ".xls", ".xlsx", ".ods", ".pdf", ".doc", ".docx", ".odt", ".rtf",
  "image/*", ".jpg", ".jpeg", ".png", ".heic", ".heif", ".webp", ".gif", ".bmp", ".tif", ".tiff",
].join(",");

type Field = "date" | "amount" | "description" | "type";
const FIELDS: Field[] = ["date", "amount", "description", "type"];

function guess(headers: string[], f: Field) {
  const h = headers.map((x) => x.toLowerCase());
  const keys: Record<Field, string[]> = {
    date: ["date", "дата", "sana"],
    amount: ["amount", "сумма", "summa", "sum"],
    description: ["description", "описание", "tavsif", "comment"],
    type: ["type", "тип", "turi"],
  };
  const i = h.findIndex((x) => keys[f].some((k) => x.includes(k)));
  return i >= 0 ? headers[i] : "";
}

export function ImportOperations() {
  const t = useTranslations("import");
  const { refresh } = useApp();
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [map, setMap] = useState<Record<Field, string>>({ date: "", amount: "", description: "", type: "" });
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [parseErr, setParseErr] = useState<null | "parse" | "extract" | "big">(null);
  const [extracting, setExtracting] = useState<string | null>(null);
  const camera = useRef<HTMLInputElement>(null);

  const load = (text: string, name: string) => {
    const r = Papa.parse<Record<string, string>>(text.trim(), { header: true, skipEmptyLines: true });
    if (!r.meta.fields?.length || !r.data.length) {
      setParseErr("parse");
      return;
    }
    setParseErr(null);
    applyRows(r.data, r.meta.fields, name);
  };

  const applyRows = (data: Record<string, string>[], fields: string[], name: string) => {
    setFileName(name);
    setHeaders(fields);
    setRows(data);
    setMap({ date: guess(fields, "date"), amount: guess(fields, "amount"), description: guess(fields, "description"), type: guess(fields, "type") });
    setResult(null);
  };
  const onFile = async (f?: File) => {
    if (!f) return;
    if (f.size > MAX_UPLOAD_MB * 1024 * 1024) return setParseErr("big");
    setParseErr(null);
    if (LOCAL_PARSE.test(f.name) || f.type === "text/csv") {
      const reader = new FileReader();
      reader.onload = () => load(String(reader.result ?? ""), f.name);
      reader.onerror = () => setParseErr("parse");
      reader.readAsText(f);
      return;
    }
    // PDF, Word, Excel, фото — отправляем в API распознавания
    setExtracting(f.name);
    try {
      const data = await extractTransactions(f);
      if (!data.length) throw new Error("empty");
      applyRows(data, Object.keys(data[0]), f.name);
    } catch {
      setParseErr("extract");
    } finally {
      setExtracting(null);
    }
  };

  const trySample = async () => {
    const res = await fetch("/sample-operations.csv");
    load(await res.text(), "sample-operations.csv");
  };

  const run = async () => {
    setBusy(true);
    const mapped: Omit<Transaction, "id">[] = rows.map((r) => {
      const amount = Number(String(r[map.amount] ?? "").replace(/\s/g, "").replace(",", "."));
      const rawType = (r[map.type] ?? "").toLowerCase();
      const type: TxType = rawType.includes("exp") || rawType.includes("расх") || amount < 0 ? "expense" : "income";
      const cat = (r["category"] as TxCategory) || (type === "income" ? "sale" : "other");
      const method = (["cash", "card", "transfer"].includes(r["method"]) ? r["method"] : "transfer") as TxMethod;
      return {
        date: String(r[map.date] ?? "").trim(),
        amount: type === "expense" ? -Math.abs(amount) : Math.abs(amount),
        type,
        category: cat,
        method,
        description: map.description ? r[map.description] : undefined,
      };
    });
    const res = await importTransactions(mapped);
    setResult(res);
    setBusy(false);
    refresh();
  };

  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight lg:text-[28px]">{t("h1")}</h1>
        <p className="mt-1 text-gray-700">{t("intro")}</p>
      </div>

      {result ? (
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 shrink-0 text-success" aria-hidden />
            <div>
              <p className="text-lg font-semibold" role="status">{t("result", { imported: result.imported, skipped: result.skipped.length })}</p>
              {result.skipped.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium">{t("errors")}</p>
                  <ul className="mt-1 space-y-0.5 text-sm text-error">
                    {result.skipped.map((s) => <li key={s.row}>{t("rowError", { row: s.row, reason: t(`reason_${s.reason}`) })}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <ButtonLink href="/app">{t("openPanel")}</ButtonLink>
            <Button variant="secondary" onClick={() => { setRows([]); setResult(null); }}>{t("another")}</Button>
          </div>
        </Card>
      ) : rows.length === 0 ? (
        <>
          {extracting ? (
            <div role="status" className="flex flex-col items-center rounded-block border-2 border-dashed border-gray-200 bg-white px-6 py-14 text-center">
              <Loader2 size={40} className="animate-spin text-graphite-900" aria-hidden />
              <p className="mt-3 text-lg font-semibold">{t("extracting")}</p>
              <p className="mt-1 text-sm text-gray-700">{extracting}</p>
            </div>
          ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); void onFile(e.dataTransfer.files[0]); }}
            className={cn("flex flex-col items-center rounded-block border-2 border-dashed bg-white px-6 py-12 text-center transition-colors", drag ? "border-brand-500 bg-brand-50" : "border-gray-200")}
          >
            <UploadCloud size={40} className="text-gray-500" aria-hidden />
            <div className="mt-3 flex items-center gap-2 text-gray-500" aria-hidden>
              <FileSpreadsheet size={18} /><FileText size={18} /><ImageIcon size={18} />
            </div>
            <p className="mt-3 text-lg font-semibold">{t("drop")}</p>
            <p className="mt-1 text-sm text-gray-700">{t("formats")}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Button onClick={() => input.current?.click()}>{t("choose")}</Button>
              <Button variant="secondary" onClick={() => camera.current?.click()} className="sm:hidden"><Camera size={18} aria-hidden /> {t("takePhoto")}</Button>
              <Button variant="secondary" onClick={trySample}><FileSpreadsheet size={18} aria-hidden /> {t("trySample")}</Button>
            </div>
            <input ref={input} type="file" accept={ACCEPT} className="sr-only" onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ""; }} aria-label={t("choose")} />
            <input ref={camera} type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ""; }} aria-label={t("takePhoto")} />
          </div>
          )}
          {parseErr && <Banner level="error">{t(parseErr === "big" ? "tooBig" : parseErr === "extract" ? "extractError" : "parseError", { mb: MAX_UPLOAD_MB })}</Banner>}
          <a href="/sample-operations.csv" download className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-brand-500 hover:underline">
            <Download size={16} aria-hidden /> {t("sample")}
          </a>
        </>
      ) : (
        <>
          <Card className="p-5">
            <p className="font-semibold">{fileName}</p>
            <h2 className="mt-4 text-sm font-semibold">{t("mapping")}</h2>
            <div className="mt-2 grid gap-3 sm:grid-cols-4">
              {FIELDS.map((f) => (
                <div key={f}>
                  <label htmlFor={`map-${f}`} className="mb-1 block text-sm text-gray-700">{t(`f_${f}`)}</label>
                  <Select id={`map-${f}`} value={map[f]} onChange={(e) => setMap((m) => ({ ...m, [f]: e.target.value }))}>
                    <option value="">{t("none")}</option>
                    {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                  </Select>
                </div>
              ))}
            </div>
          </Card>
          <Card className="overflow-hidden">
            <p className="border-b border-gray-200 px-4 py-3 text-sm font-semibold">{t("preview")}</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm num">
                <thead className="bg-mist text-left text-gray-700">
                  <tr>{headers.map((h) => <th key={h} className="whitespace-nowrap px-3 py-2 font-medium">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {rows.slice(0, 10).map((r, i) => (
                    <tr key={i} className="border-t border-gray-200">{headers.map((h) => <td key={h} className="whitespace-nowrap px-3 py-2">{r[h]}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <div className="flex flex-wrap gap-2">
            <Button size="lg" onClick={run} disabled={busy || !map.date || !map.amount}>
              {busy ? t("importing") : t("importN", { n: rows.length })}
            </Button>
            <Button size="lg" variant="ghost" onClick={() => setRows([])}>{t("another")}</Button>
          </div>
          {busy && <div className="h-1.5 overflow-hidden rounded-full bg-gray-200"><div className="h-full w-1/2 animate-pulse rounded-full bg-graphite-900" /></div>}
        </>
      )}
    </div>
  );
}

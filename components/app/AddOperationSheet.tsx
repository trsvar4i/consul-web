"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { addTransaction, deleteTransaction, searchPrices, updateTransaction } from "@/lib/api";
import type { Locale, PricePoint, Transaction, TxCategory, TxMethod, TxType } from "@/lib/types";
import { formatSom } from "@/lib/format";
import { MoneyInput } from "../brand/MoneyInput";
import { Sheet } from "../ui/sheet";
import { Segmented } from "../ui/segmented";
import { Button, Input, Label, Select } from "../ui/primitives";
import { useToast } from "../ui/toast";

const CATS: Record<TxType, TxCategory[]> = {
  income: ["sale", "loan", "other"],
  expense: ["purchase", "rent", "salary", "tax", "loan", "owner_draw", "other"],
  receivable: ["sale", "other"],
  payable: ["purchase", "loan", "other"],
};
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function AddOperationSheet({ open, tx, onClose, onSaved }: { open: boolean; tx?: Transaction; onClose: () => void; onSaved: () => void }) {
  const t = useTranslations("operations");
  const c = useTranslations("common");
  const locale = useLocale() as Locale;
  const toast = useToast();

  const [type, setType] = useState<TxType>("income");
  const [amount, setAmount] = useState<number | undefined>();
  const [category, setCategory] = useState<TxCategory>("sale");
  const [date, setDate] = useState(today());
  const [method, setMethod] = useState<TxMethod>("cash");
  const [product, setProduct] = useState("");
  const [qty, setQty] = useState<string>("");
  const [unit, setUnit] = useState<"kg" | "dona" | "litr">("kg");
  const [comment, setComment] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [products, setProducts] = useState<PricePoint[]>([]);

  // reset when opened
  useEffect(() => {
    if (!open) return;
    /* eslint-disable react-hooks/set-state-in-effect -- form reset on open */
    setType(tx?.type ?? "income");
    setAmount(tx ? Math.abs(tx.amount) : undefined);
    setCategory(tx?.category ?? "sale");
    setDate(tx?.date ?? today());
    setMethod(tx?.method ?? "cash");
    setProduct(tx?.item?.product ?? "");
    setQty(tx?.item ? String(tx.item.qty) : "");
    setUnit(tx?.item?.unit ?? "kg");
    setComment(tx?.description ?? "");
    setErr(null);
    setConfirmDel(false);
    /* eslint-enable react-hooks/set-state-in-effect */
    void searchPrices("", "chorsu").then(setProducts);
  }, [open, tx]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- keep category valid for the type
    if (!CATS[type].includes(category)) setCategory(CATS[type][0]);
  }, [type, category]);


  const q = Number(qty.replace(",", "."));
  const unitPrice = amount && q > 0 ? amount / q : undefined;

  const save = async () => {
    if (!amount) return setErr(t("amountError"));
    setBusy(true);
    const signed = type === "expense" || type === "payable" ? -amount : amount;
    const base: Omit<Transaction, "id"> = {
      date, amount: signed, type, category, method,
      description: comment || undefined,
      item: category === "purchase" && product && q > 0 ? { product, qty: q, unit } : undefined,
    };
    try {
      if (tx) await updateTransaction({ ...base, id: tx.id, matched: tx.matched });
      else await addTransaction(base);
      toast(t("saved"));
      onSaved();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!tx) return;
    setBusy(true);
    await deleteTransaction(tx.id);
    setBusy(false);
    toast(t("deleted"));
    onSaved();
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={tx ? t("editTitle") : t("addTitle")}
      footer={
        confirmDel ? (
          <div className="space-y-3">
            <p className="text-sm">{t("confirmDelete")}</p>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setConfirmDel(false)}>{c("cancel")}</Button>
              <Button variant="danger" className="flex-1" onClick={remove} disabled={busy}>{c("delete")}</Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            {tx && <Button variant="danger" onClick={() => setConfirmDel(true)}>{c("delete")}</Button>}
            <Button className="flex-1" size="lg" onClick={save} disabled={busy}>{c("save")}</Button>
          </div>
        )
      }
    >
      <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); void save(); }}>
        <div>
          <p className="mb-1.5 text-sm font-medium">{t("type")}</p>
          <Segmented wrap label={t("type")} value={type} onChange={setType} className="grid grid-cols-2"
            options={(["income", "expense", "receivable", "payable"] as TxType[]).map((x) => ({ value: x, label: t(`t_${x}`) }))} />
        </div>
        <div data-autofocus>
          <MoneyInput autoFocus label={t("amount")} value={amount} onChange={(n) => { setAmount(n); setErr(null); }} error={err ?? undefined} />
        </div>
        <div>
          <Label htmlFor="op-cat">{t("category")}</Label>
          <Select id="op-cat" value={category} onChange={(e) => setCategory(e.target.value as TxCategory)}>
            {CATS[type].map((x) => <option key={x} value={x}>{t(`c_${x}`)}</option>)}
          </Select>
          {category === "owner_draw" && <p className="mt-1 text-sm text-gray-700">{t("ownerDrawHint")}</p>}
        </div>
        {category === "purchase" && (
          <div className="grid gap-3 rounded-card bg-mist p-3 sm:grid-cols-[1fr_1fr]">
            <div>
              <Label htmlFor="op-prod">{t("product")} <span className="font-normal text-gray-700">({t("optional")})</span></Label>
              <Select id="op-prod" value={product} onChange={(e) => setProduct(e.target.value)}>
                <option value="">—</option>
                {products.map((p) => <option key={p.product} value={p.product}>{p.productName[locale]}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="op-qty">{t("qty")}</Label>
              <div className="flex gap-2">
                <Input id="op-qty" inputMode="decimal" value={qty} onChange={(e) => setQty(e.target.value)} className="num" />
                <Select aria-label="unit" value={unit} onChange={(e) => setUnit(e.target.value as typeof unit)} className="w-24">
                  <option value="kg">{c("kg")}</option><option value="dona">{c("dona")}</option><option value="litr">{c("litr")}</option>
                </Select>
              </div>
            </div>
            {unitPrice !== undefined && (
              <div className="sm:col-span-2">
                <p className="text-sm">{t("unitPrice", { price: formatSom(unitPrice, locale) })}</p>
              </div>
            )}
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="op-date">{t("date")}</Label>
            <Input id="op-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <p className="mb-1.5 text-sm font-medium">{t("method")}</p>
            <Segmented label={t("method")} value={method} onChange={setMethod}
              options={(["cash", "card", "transfer"] as TxMethod[]).map((m) => ({ value: m, label: t(`m_${m}`) }))} />
          </div>
        </div>
        <div>
          <Label htmlFor="op-comment">{t("comment")} <span className="font-normal text-gray-700">({t("optional")})</span></Label>
          <Input id="op-comment" value={comment} onChange={(e) => setComment(e.target.value)} />
        </div>
        <button type="submit" hidden />
      </form>
    </Sheet>
  );
}

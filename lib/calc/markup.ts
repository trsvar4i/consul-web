export function priceFromMarkup(cost: number, markupPct: number) {
  return cost * (1 + markupPct / 100);
}
export function markupFromPrice(cost: number, price: number) {
  return cost > 0 ? ((price - cost) / cost) * 100 : 0;
}
export function marginPct(cost: number, price: number) {
  return price > 0 ? ((price - cost) / price) * 100 : 0;
}
export function unitsToCover(monthlyExpenses: number, cost: number, price: number) {
  const perUnit = price - cost;
  return perUnit > 0 ? Math.ceil(monthlyExpenses / perUnit) : Infinity;
}

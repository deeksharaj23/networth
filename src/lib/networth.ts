import type { Investment, InvestmentCategory } from "@/types/app-data";

export function netWorthFromInvestments(investments: Investment[]): number {
  let assets = 0;
  let liabilities = 0;
  for (const inv of investments) {
    const v = Number(inv.currentValue);
    if (inv.category === "Liability") liabilities += v;
    else assets += v;
  }
  return assets - liabilities;
}

export function categoryTotalsFromInvestments(
  investments: Investment[],
): Record<InvestmentCategory | string, number> {
  const totals: Record<string, number> = {
    Cash: 0,
    Equity: 0,
    Gold: 0,
    Retirement: 0,
    Liability: 0,
  };
  for (const inv of investments) {
    const v = Number(inv.currentValue);
    totals[inv.category] = (totals[inv.category] ?? 0) + v;
  }
  return totals;
}

export function assetBreakdownFromInvestments(
  investments: Investment[],
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const inv of investments) {
    out[inv.id] = Number(inv.currentValue);
  }
  return out;
}

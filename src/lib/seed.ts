import type { AppData, Investment } from "@/types/app-data";
import {
  assetBreakdownFromInvestments,
  categoryTotalsFromInvestments,
  netWorthFromInvestments,
} from "@/lib/networth";
import { formatMonth, addMonths, startOfMonth } from "@/lib/utils";

function id() {
  return crypto.randomUUID();
}

const now = new Date();
const seedInvestments: Omit<Investment, "id" | "createdAt">[] = [
  {
    name: "Kotak Savings",
    category: "Cash",
    subtype: "Savings",
    currentValue: 240_000,
    monthlyContribution: 20_000,
    status: "active",
  },
  {
    name: "HDFC FD Ladder",
    category: "Cash",
    subtype: "FD",
    currentValue: 500_000,
    monthlyContribution: 0,
    status: "active",
  },
  {
    name: "Index MF Core",
    category: "Equity",
    subtype: "Mutual Fund",
    currentValue: 890_000,
    monthlyContribution: 25_000,
    status: "active",
  },
  {
    name: "NIFTY ETF",
    category: "Equity",
    subtype: "ETF",
    currentValue: 320_000,
    monthlyContribution: 15_000,
    status: "active",
  },
  {
    name: "SGB 2024",
    category: "Gold",
    subtype: "SGB",
    currentValue: 180_000,
    monthlyContribution: 0,
    status: "active",
  },
  {
    name: "EPF",
    category: "Retirement",
    subtype: "PF",
    currentValue: 1_200_000,
    monthlyContribution: 18_000,
    status: "active",
  },
  {
    name: "NPS Tier 1",
    category: "Retirement",
    subtype: "NPS",
    currentValue: 640_000,
    monthlyContribution: 12_000,
    status: "active",
  },
  {
    name: "Primary Credit Card",
    category: "Liability",
    subtype: "Credit Card",
    currentValue: 82_000,
    monthlyContribution: 0,
    status: "active",
  },
];

export function createSeedAppData(): AppData {
  const createdAt = now.toISOString();
  const investments: Investment[] = seedInvestments.map((r) => ({
    ...r,
    id: id(),
    createdAt,
  }));

  const baseMonth = startOfMonth(addMonths(now, -5));
  const historyNw = [3_200_000, 3_350_000, 3_510_000, 3_680_000, 3_820_000, 3_958_000];

  const snapshots: AppData["snapshots"] = [];
  let prevNw: number | null = null;

  for (let i = 0; i < historyNw.length; i++) {
    const m = formatMonth(addMonths(baseMonth, i));
    const nw = historyNw[i]!;
    const scale = nw / netWorthFromInvestments(investments);
    const scaledInv: Investment[] = investments.map((inv) => ({
      ...inv,
      currentValue: inv.currentValue * scale,
    }));
    const changeAbsolute = prevNw != null ? nw - prevNw : 0;
    const changePercent =
      prevNw != null && prevNw !== 0 ? (changeAbsolute / Math.abs(prevNw)) * 100 : 0;
    const contribAmount = 55_000 + i * 2000;

    snapshots.push({
      id: id(),
      month: m,
      netWorth: nw,
      changePercent,
      changeAbsolute,
      categoryTotals: categoryTotalsFromInvestments(scaledInv) as Record<string, number>,
      assetBreakdown: assetBreakdownFromInvestments(scaledInv),
      totalContributions: contribAmount,
    });
    prevNw = nw;
  }

  const mf = investments.find((i) => i.name === "Index MF Core");
  const savings = investments.find((i) => i.name === "Kotak Savings");
  const fd = investments.find((i) => i.name === "HDFC FD Ladder");
  const epf = investments.find((i) => i.name === "EPF");
  const nps = investments.find((i) => i.name === "NPS Tier 1");

  const contributions: AppData["contributions"] = [];
  if (mf) {
    for (let i = 0; i < historyNw.length; i++) {
      const m = formatMonth(addMonths(baseMonth, i));
      contributions.push({
        id: id(),
        investmentId: mf.id,
        amount: 25_000,
        month: m,
      });
    }
  }

  const goals: AppData["goals"] = [];
  if (savings && fd) {
    goals.push({
      id: id(),
      name: "₹50L liquid corpus",
      targetAmount: 5_000_000,
      linkedInvestmentIds: [savings.id, fd.id],
    });
  }
  if (epf && nps) {
    goals.push({
      id: id(),
      name: "Retirement runway",
      targetAmount: 2_000_000,
      linkedInvestmentIds: [epf.id, nps.id],
    });
  }

  return {
    investments,
    snapshots,
    goals,
    contributions,
  };
}

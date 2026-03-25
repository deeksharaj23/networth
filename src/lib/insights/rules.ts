import { format, parse } from "date-fns";
import type { Investment, MonthlySnapshot } from "@/types/app-data";

export type Insight = {
  id: string;
  tone: "positive" | "neutral" | "watch";
  title: string;
  detail?: string;
};

export function generateInsights(input: {
  snapshot: MonthlySnapshot | null;
  prevSnapshot: MonthlySnapshot | null;
  investments: Investment[];
  contributionsLogged: number;
  monthKey: string;
  /** Current holdings allocation (used for cash/equity hints). */
  categoryTotals: Record<string, number>;
}): Insight[] {
  const out: Insight[] = [];
  const {
    snapshot,
    prevSnapshot,
    investments,
    contributionsLogged,
    monthKey,
    categoryTotals,
  } = input;

  let monthLabel = monthKey;
  try {
    monthLabel = format(parse(`${monthKey}-01`, "yyyy-MM-dd", new Date()), "MMMM yyyy");
  } catch {
    /* keep key */
  }

  if (!snapshot) {
    out.push({
      id: "no-snapshot",
      tone: "neutral",
      title: "No snapshot for this month yet",
      detail: "Add investments or change month once data exists.",
    });
    return out;
  }

  const mom = snapshot.changePercent;
  const momAbs = snapshot.changeAbsolute;

  if (momAbs !== 0 || mom !== 0) {
    if (momAbs > 0) {
      out.push({
        id: "nw-up",
        tone: "positive",
        title: `Net worth increased in ${monthLabel}`,
        detail: `Up ${formatAbs(momAbs)} (${mom.toFixed(2)}% MoM).`,
      });
    } else if (momAbs < 0) {
      out.push({
        id: "nw-down",
        tone: "watch",
        title: `Net worth dipped in ${monthLabel}`,
        detail: `Down ${formatAbs(Math.abs(momAbs))} (${mom.toFixed(2)}% MoM).`,
      });
    }
  }

  const snapTotals = snapshot.categoryTotals ?? categoryTotals;
  const assetTotal = Object.entries(snapTotals)
    .filter(([k]) => k !== "Liability")
    .reduce((s, [, v]) => s + Number(v), 0);
  const cash = Number(snapTotals["Cash"] ?? 0);
  if (assetTotal > 0 && cash / assetTotal > 0.3) {
    out.push({
      id: "cash-high",
      tone: "watch",
      title: "Cash allocation is above 30%",
      detail: "Consider whether idle cash matches your near-term plans.",
    });
  }

  const equity = Number(snapTotals["Equity"] ?? 0);
  if (
    prevSnapshot?.categoryTotals &&
    snapshot.categoryTotals &&
    momAbs > 0
  ) {
    const pe = Number(prevSnapshot.categoryTotals["Equity"] ?? 0);
    const growthEq = equity - pe;
    const others = Object.entries(snapTotals)
      .filter(([k]) => k !== "Equity" && k !== "Liability")
      .reduce((s, [, v]) => s + Number(v), 0);
    const pOthers = Object.entries(prevSnapshot.categoryTotals)
      .filter(([k]) => k !== "Equity" && k !== "Liability")
      .reduce((s, [, v]) => s + Number(v), 0);
    const growthOthers = others - pOthers;
    if (growthEq >= growthOthers && growthEq > 0) {
      out.push({
        id: "equity-mover",
        tone: "positive",
        title: "Equity led portfolio growth",
        detail: "Equity increased more than other asset buckets this month.",
      });
    }
  }

  const [yy, mm] = monthKey.split("-").map(Number);
  const createdInMonth = investments.filter((i) => {
    const d = new Date(i.createdAt);
    return d.getFullYear() === yy && d.getMonth() + 1 === mm;
  }).length;

  if (createdInMonth === 0 && contributionsLogged === 0) {
    out.push({
      id: "no-activity",
      tone: "neutral",
      title: "No new investments or contributions logged this month",
      detail: "Recording contributions helps separate savings from market moves.",
    });
  }

  if (contributionsLogged > 0) {
    out.push({
      id: "contrib",
      tone: "positive",
      title: `You invested ${formatAbs(contributionsLogged)} this month`,
      detail: "Compare contributions to market growth on the dashboard.",
    });
  }

  return out.slice(0, 6);
}

function formatAbs(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

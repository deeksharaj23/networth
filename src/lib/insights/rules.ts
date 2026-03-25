import { format, parse } from "date-fns";
import type { Investment, MonthlySnapshot } from "@/types/database";

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
  /** Sum of rows in `contributions` for the month */
  contributionsLogged: number;
  monthKey: string;
}): Insight[] {
  const out: Insight[] = [];
  const { snapshot, prevSnapshot, investments, contributionsLogged, monthKey } = input;

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
      detail: "Add investments or sync the current month to build history.",
    });
    return out;
  }

  const mom = snapshot.mom_change_pct;
  const momAbs = snapshot.mom_change_abs;

  if (momAbs != null && mom != null) {
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

  const totals = snapshot.category_totals ?? {};
  const assetTotal = Object.entries(totals)
    .filter(([k]) => k !== "Liability")
    .reduce((s, [, v]) => s + Number(v), 0);
  const cash = Number(totals["Cash"] ?? 0);
  if (assetTotal > 0 && cash / assetTotal > 0.3) {
    out.push({
      id: "cash-high",
      tone: "watch",
      title: "Cash allocation is above 30%",
      detail: "Consider whether idle cash matches your near-term plans.",
    });
  }

  const equity = Number(totals["Equity"] ?? 0);
  if (
    prevSnapshot?.category_totals &&
    snapshot.category_totals &&
    momAbs != null &&
    momAbs > 0
  ) {
    const pe = Number(prevSnapshot.category_totals["Equity"] ?? 0);
    const growthEq = equity - pe;
    const others = Object.entries(totals)
      .filter(([k]) => k !== "Equity" && k !== "Liability")
      .reduce((s, [, v]) => s + Number(v), 0);
    const pOthers = Object.entries(prevSnapshot.category_totals)
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
    const d = new Date(i.created_at);
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

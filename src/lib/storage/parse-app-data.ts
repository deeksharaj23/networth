import type { AppData } from "@/types/app-data";
import { emptyAppData } from "@/types/app-data";

function isInvestment(x: unknown): x is AppData["investments"][number] {
  if (!x || typeof x !== "object") return false;
  const r = x as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    typeof r.name === "string" &&
    typeof r.category === "string" &&
    typeof r.subtype === "string" &&
    typeof r.currentValue === "number" &&
    typeof r.status === "string" &&
    typeof r.createdAt === "string"
  );
}

function isSnapshot(x: unknown): x is AppData["snapshots"][number] {
  if (!x || typeof x !== "object") return false;
  const r = x as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    typeof r.month === "string" &&
    typeof r.netWorth === "number" &&
    typeof r.changePercent === "number" &&
    typeof r.changeAbsolute === "number"
  );
}

function isGoal(x: unknown): x is AppData["goals"][number] {
  if (!x || typeof x !== "object") return false;
  const r = x as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    typeof r.name === "string" &&
    typeof r.targetAmount === "number" &&
    Array.isArray(r.linkedInvestmentIds) &&
    (r.linkedInvestmentIds as unknown[]).every((id) => typeof id === "string")
  );
}

function isContribution(x: unknown): x is AppData["contributions"][number] {
  if (!x || typeof x !== "object") return false;
  const r = x as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    typeof r.investmentId === "string" &&
    typeof r.amount === "number" &&
    typeof r.month === "string"
  );
}

/** Normalizes arbitrary JSON into `AppData` (drops invalid rows). */
export function parseAppData(raw: unknown): AppData {
  const base = emptyAppData();
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;

  const investments = Array.isArray(o.investments) ? o.investments : [];
  const snapshots = Array.isArray(o.snapshots) ? o.snapshots : [];
  const goals = Array.isArray(o.goals) ? o.goals : [];
  const contributions = Array.isArray(o.contributions) ? o.contributions : [];

  return {
    investments: investments.filter(isInvestment),
    snapshots: snapshots.filter(isSnapshot),
    goals: goals.filter(isGoal),
    contributions: contributions.filter(isContribution),
  };
}

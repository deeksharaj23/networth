export type InvestmentCategory =
  | "Cash"
  | "Equity"
  | "Gold"
  | "Retirement"
  | "Liability";

export type InvestmentStatus = "active" | "paused" | "closed";

/** Core portfolio row — local-first model */
export type Investment = {
  id: string;
  name: string;
  category: InvestmentCategory;
  subtype: string;
  currentValue: number;
  monthlyContribution?: number;
  status: InvestmentStatus;
  createdAt: string;
};

export type MonthlySnapshot = {
  id: string;
  month: string;
  netWorth: number;
  changePercent: number;
  changeAbsolute: number;
  /** Filled by sync for charts/insights/movers; optional on imported data. */
  categoryTotals?: Record<string, number>;
  assetBreakdown?: Record<string, number>;
  totalContributions?: number;
};

export type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  linkedInvestmentIds: string[];
};

/** Logged cash additions per month (not part of the core snapshot shape). */
export type Contribution = {
  id: string;
  investmentId: string;
  amount: number;
  month: string;
};

/**
 * Full app payload. `contributions` supports contribution tracking alongside
 * the snapshot list (same pattern as before, kept serializable).
 */
export type AppData = {
  investments: Investment[];
  snapshots: MonthlySnapshot[];
  goals: Goal[];
  contributions: Contribution[];
};

export const emptyAppData = (): AppData => ({
  investments: [],
  snapshots: [],
  goals: [],
  contributions: [],
});

export type InvestmentCategory =
  | "Cash"
  | "Equity"
  | "Gold"
  | "Retirement"
  | "Liability";

export type InvestmentSubtype =
  | "Savings"
  | "FD"
  | "Mutual Fund"
  | "ETF"
  | "Stocks"
  | "SGB"
  | "PF"
  | "NPS"
  | "Credit Card";

export type InvestmentStatus = "active" | "paused" | "closed";

export type Investment = {
  id: string;
  user_id: string;
  name: string;
  category: InvestmentCategory;
  subtype: InvestmentSubtype;
  platform: string | null;
  current_value: number;
  monthly_contribution: number | null;
  status: InvestmentStatus;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type MonthlySnapshot = {
  id: string;
  user_id: string;
  month: string;
  net_worth: number;
  mom_change_pct: number | null;
  mom_change_abs: number | null;
  total_contributions: number | null;
  category_totals: Record<string, number> | null;
  asset_breakdown: Record<string, number> | null;
  created_at: string;
};

export type Contribution = {
  id: string;
  user_id: string;
  investment_id: string;
  amount: number;
  contribution_month: string;
  created_at: string;
};

export type Goal = {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  target_date: string | null;
  created_at: string;
};

export type GoalMapping = {
  goal_id: string;
  investment_id: string;
};

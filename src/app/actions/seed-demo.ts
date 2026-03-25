"use server";

import { createClient } from "@/lib/supabase/server";
import { syncCurrentMonthSnapshot } from "@/app/actions/snapshots";
import { startOfMonth, addMonths } from "@/lib/utils";

const DEMO_INVESTMENTS = [
  {
    name: "Kotak Savings",
    category: "Cash" as const,
    subtype: "Savings" as const,
    platform: "Kotak",
    current_value: 240000,
    monthly_contribution: 20000,
    status: "active" as const,
  },
  {
    name: "HDFC FD Ladder",
    category: "Cash" as const,
    subtype: "FD" as const,
    platform: "HDFC",
    current_value: 500000,
    monthly_contribution: 0,
    status: "active" as const,
  },
  {
    name: "Index MF Core",
    category: "Equity" as const,
    subtype: "Mutual Fund" as const,
    platform: "Groww",
    current_value: 890000,
    monthly_contribution: 25000,
    status: "active" as const,
  },
  {
    name: "NIFTY ETF",
    category: "Equity" as const,
    subtype: "ETF" as const,
    platform: "Zerodha",
    current_value: 320000,
    monthly_contribution: 15000,
    status: "active" as const,
  },
  {
    name: "Direct Stocks",
    category: "Equity" as const,
    subtype: "Stocks" as const,
    platform: "Zerodha",
    current_value: 410000,
    monthly_contribution: 10000,
    status: "paused" as const,
  },
  {
    name: "SGB 2024",
    category: "Gold" as const,
    subtype: "SGB" as const,
    platform: "RBI",
    current_value: 180000,
    monthly_contribution: 0,
    status: "active" as const,
  },
  {
    name: "EPF",
    category: "Retirement" as const,
    subtype: "PF" as const,
    platform: "EPFO",
    current_value: 1200000,
    monthly_contribution: 18000,
    status: "active" as const,
  },
  {
    name: "NPS Tier 1",
    category: "Retirement" as const,
    subtype: "NPS" as const,
    platform: "NPS",
    current_value: 640000,
    monthly_contribution: 12000,
    status: "active" as const,
  },
  {
    name: "Primary Credit Card",
    category: "Liability" as const,
    subtype: "Credit Card" as const,
    platform: "Amex",
    current_value: 82000,
    monthly_contribution: 0,
    status: "active" as const,
  },
];

/** Inserts demo portfolio, historical snapshots, contributions, and goals for the signed-in user. */
export async function seedDemoData(): Promise<{ error?: string; ok?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: existing } = await supabase
    .from("investments")
    .select("id")
    .eq("user_id", user.id)
    .limit(1);

  if (existing && existing.length > 0) {
    return { error: "You already have investments. Clear them first to re-seed." };
  }

  const rows = DEMO_INVESTMENTS.map((r) => ({
    user_id: user.id,
    ...r,
  }));

  const { data: inserted, error: invErr } = await supabase
    .from("investments")
    .insert(rows)
    .select("id, name, category, current_value");

  if (invErr) return { error: invErr.message };
  const invs = inserted ?? [];
  const byName = Object.fromEntries(invs.map((i) => [i.name as string, i]));

  const mfId = (byName["Index MF Core"]?.id as string) ?? invs[0]?.id;
  const epfId = byName["EPF"]?.id as string;
  const npsId = byName["NPS Tier 1"]?.id as string;

  const now = new Date();
  const baseMonth = startOfMonth(addMonths(now, -5));
  const historyNw = [3_200_000, 3_350_000, 3_510_000, 3_680_000, 3_820_000, 3_958_000];

  let prevNw: number | null = null;
  for (let i = 0; i < historyNw.length; i++) {
    const m = addMonths(baseMonth, i);
    const monthStr = m.toISOString().slice(0, 10);
    const nw = historyNw[i]!;
    const mom_abs = prevNw != null ? nw - prevNw : null;
    const mom_pct =
      prevNw != null && prevNw !== 0 && mom_abs != null
        ? (mom_abs / Math.abs(prevNw)) * 100
        : null;

    const scale = nw / historyNw[historyNw.length - 1]!;
    const breakdown: Record<string, number> = {};
    for (const inv of invs) {
      breakdown[inv.id as string] = Number(inv.current_value) * scale;
    }

    const category_totals: Record<string, number> = {};
    for (const inv of invs) {
      const c = inv.category as string;
      category_totals[c] =
        (category_totals[c] ?? 0) + Number(inv.current_value) * scale;
    }

    const contribAmount = 55000 + i * 2000;
    await supabase.from("monthly_snapshots").upsert(
      {
        user_id: user.id,
        month: monthStr,
        net_worth: nw,
        mom_change_pct: mom_pct,
        mom_change_abs: mom_abs,
        total_contributions: contribAmount,
        category_totals,
        asset_breakdown: breakdown,
      },
      { onConflict: "user_id,month" },
    );

    if (mfId) {
      await supabase.from("contributions").insert({
        user_id: user.id,
        investment_id: mfId,
        amount: 25000,
        contribution_month: monthStr,
      });
    }
    prevNw = nw;
  }

  const { data: goal1, error: g1e } = await supabase
    .from("goals")
    .insert({
      user_id: user.id,
      name: "₹50L liquid corpus",
      target_amount: 5_000_000,
      target_date: null,
    })
    .select("id")
    .single();
  if (g1e) return { error: g1e.message };

  const savingsId = byName["Kotak Savings"]?.id as string;
  const fdId = byName["HDFC FD Ladder"]?.id as string;
  if (goal1?.id && savingsId && fdId) {
    await supabase.from("goal_mappings").insert([
      { goal_id: goal1.id, investment_id: savingsId },
      { goal_id: goal1.id, investment_id: fdId },
    ]);
  }

  const { data: goal2, error: g2e } = await supabase
    .from("goals")
    .insert({
      user_id: user.id,
      name: "Retirement runway",
      target_amount: 2_000_000,
      target_date: null,
    })
    .select("id")
    .single();
  if (g2e) return { error: g2e.message };

  if (goal2?.id && epfId && npsId) {
    await supabase.from("goal_mappings").insert([
      { goal_id: goal2.id, investment_id: epfId },
      { goal_id: goal2.id, investment_id: npsId },
    ]);
  }

  await syncCurrentMonthSnapshot();

  return { ok: true };
}

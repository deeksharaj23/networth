"use server";

import { createClient } from "@/lib/supabase/server";
import {
  assetBreakdownFromInvestments,
  categoryTotalsFromInvestments,
  netWorthFromInvestments,
} from "@/lib/networth";
import { startOfMonth } from "@/lib/utils";
import type { Investment, MonthlySnapshot } from "@/types/database";

function monthKeyToDate(monthKey: string): string {
  return `${monthKey}-01`;
}

export async function syncCurrentMonthSnapshot(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const month = startOfMonth(new Date());
  const monthStr = month.toISOString().slice(0, 10);

  const { data: investments, error: invErr } = await supabase
    .from("investments")
    .select("*")
    .eq("user_id", user.id);

  if (invErr) return { error: invErr.message };

  const list = (investments ?? []) as Investment[];
  const net = netWorthFromInvestments(list);
  const category_totals = categoryTotalsFromInvestments(list);
  const asset_breakdown = assetBreakdownFromInvestments(list);

  const { data: prevSnap } = await supabase
    .from("monthly_snapshots")
    .select("net_worth, month")
    .eq("user_id", user.id)
    .lt("month", monthStr)
    .order("month", { ascending: false })
    .limit(1)
    .maybeSingle();

  const prevNw = prevSnap?.net_worth != null ? Number(prevSnap.net_worth) : null;
  const mom_abs = prevNw != null ? net - prevNw : null;
  const mom_pct =
    prevNw != null && prevNw !== 0 && mom_abs != null
      ? (mom_abs / Math.abs(prevNw)) * 100
      : null;

  const { data: contribs } = await supabase
    .from("contributions")
    .select("amount")
    .eq("user_id", user.id)
    .eq("contribution_month", monthStr);

  const total_contributions = (contribs ?? []).reduce(
    (s, r) => s + Number((r as { amount: string }).amount),
    0,
  );

  const { error } = await supabase.from("monthly_snapshots").upsert(
    {
      user_id: user.id,
      month: monthStr,
      net_worth: net,
      mom_change_pct: mom_pct,
      mom_change_abs: mom_abs,
      total_contributions,
      category_totals,
      asset_breakdown,
    },
    { onConflict: "user_id,month" },
  );

  if (error) return { error: error.message };
  return {};
}

export async function getSnapshotsSeries(): Promise<{
  data: { month: string; net_worth: number }[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Unauthorized" };

  const { data, error } = await supabase
    .from("monthly_snapshots")
    .select("month, net_worth")
    .eq("user_id", user.id)
    .order("month", { ascending: true });

  if (error) return { data: [], error: error.message };
  return {
    data: (data ?? []).map((r) => ({
      month: r.month as string,
      net_worth: Number(r.net_worth),
    })),
  };
}

export async function getSnapshotForMonth(monthKey: string): Promise<{
  snapshot: MonthlySnapshot | null;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { snapshot: null, error: "Unauthorized" };

  const monthStr = monthKeyToDate(monthKey);
  const { data, error } = await supabase
    .from("monthly_snapshots")
    .select("*")
    .eq("user_id", user.id)
    .eq("month", monthStr)
    .maybeSingle();

  if (error) return { snapshot: null, error: error.message };
  if (!data) return { snapshot: null };

  return {
    snapshot: {
      ...data,
      net_worth: Number(data.net_worth),
      mom_change_pct: data.mom_change_pct != null ? Number(data.mom_change_pct) : null,
      mom_change_abs: data.mom_change_abs != null ? Number(data.mom_change_abs) : null,
      total_contributions:
        data.total_contributions != null ? Number(data.total_contributions) : null,
      category_totals: (data.category_totals as Record<string, number>) ?? null,
      asset_breakdown: (data.asset_breakdown as Record<string, number>) ?? null,
    } as MonthlySnapshot,
  };
}

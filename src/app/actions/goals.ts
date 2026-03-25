"use server";

import { createClient } from "@/lib/supabase/server";

export async function listGoalsWithProgress(): Promise<{
  data: {
    id: string;
    name: string;
    target_amount: number;
    target_date: string | null;
    progress_value: number;
    progress_pct: number;
    eta_months: number | null;
  }[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Unauthorized" };

  const { data: goals, error: gErr } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (gErr) return { data: [], error: gErr.message };

  const { data: snaps, error: sErr } = await supabase
    .from("monthly_snapshots")
    .select("mom_change_abs, month")
    .eq("user_id", user.id)
    .order("month", { ascending: false })
    .limit(3);

  if (sErr) return { data: [], error: sErr.message };

  const avgGrowth =
    snaps && snaps.length > 0
      ? snaps.reduce((s, r) => s + Number(r.mom_change_abs ?? 0), 0) /
        snaps.length
      : 0;

  const results = [];
  for (const g of goals ?? []) {
    const { data: maps } = await supabase
      .from("goal_mappings")
      .select("investment_id")
      .eq("goal_id", g.id);

    const ids = (maps ?? []).map((m) => m.investment_id as string);
    let progress_value = 0;
    if (ids.length > 0) {
      const { data: invs } = await supabase
        .from("investments")
        .select("current_value")
        .in("id", ids)
        .eq("user_id", user.id);
      progress_value = (invs ?? []).reduce(
        (s, i) => s + Number(i.current_value),
        0,
      );
    }

    const target = Number(g.target_amount);
    const progress_pct = target > 0 ? Math.min(100, (progress_value / target) * 100) : 0;
    const remaining = Math.max(0, target - progress_value);
    const eta_months =
      avgGrowth > 0 ? Math.ceil(remaining / avgGrowth) : remaining > 0 ? null : 0;

    results.push({
      id: g.id as string,
      name: g.name as string,
      target_amount: target,
      target_date: (g.target_date as string | null) ?? null,
      progress_value,
      progress_pct,
      eta_months,
    });
  }

  return { data: results };
}

export async function createGoal(input: {
  name: string;
  target_amount: number;
  target_date?: string | null;
  investment_ids: string[];
}): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: goal, error: gErr } = await supabase
    .from("goals")
    .insert({
      user_id: user.id,
      name: input.name,
      target_amount: input.target_amount,
      target_date: input.target_date ?? null,
    })
    .select("id")
    .single();

  if (gErr) return { error: gErr.message };
  const gid = goal?.id as string;

  if (input.investment_ids.length > 0) {
    const rows = input.investment_ids.map((investment_id) => ({
      goal_id: gid,
      investment_id,
    }));
    const { error: mErr } = await supabase.from("goal_mappings").insert(rows);
    if (mErr) return { error: mErr.message };
  }

  return { id: gid };
}

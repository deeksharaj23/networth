"use server";

import { createClient } from "@/lib/supabase/server";
import { syncCurrentMonthSnapshot } from "@/app/actions/snapshots";
import { startOfMonth } from "@/lib/utils";

export async function recordContribution(input: {
  investment_id: string;
  amount: number;
  monthKey?: string;
}): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const d = input.monthKey
    ? new Date(input.monthKey + "-01")
    : startOfMonth(new Date());
  const contribution_month = d.toISOString().slice(0, 10);

  const { error } = await supabase.from("contributions").insert({
    user_id: user.id,
    investment_id: input.investment_id,
    amount: input.amount,
    contribution_month,
  });

  if (error) return { error: error.message };
  await syncCurrentMonthSnapshot();
  return {};
}

export async function listContributionsForMonth(monthKey: string): Promise<{
  data: { id: string; investment_id: string; amount: number }[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Unauthorized" };

  const contribution_month = `${monthKey}-01`;
  const { data, error } = await supabase
    .from("contributions")
    .select("id, investment_id, amount")
    .eq("user_id", user.id)
    .eq("contribution_month", contribution_month);

  if (error) return { data: [], error: error.message };
  return {
    data: (data ?? []).map((r) => ({
      id: r.id as string,
      investment_id: r.investment_id as string,
      amount: Number(r.amount),
    })),
  };
}

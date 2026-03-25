"use server";

import { createClient } from "@/lib/supabase/server";
import { syncCurrentMonthSnapshot } from "@/app/actions/snapshots";
import type {
  InvestmentCategory,
  InvestmentStatus,
  InvestmentSubtype,
} from "@/types/database";

export type InvestmentInput = {
  name: string;
  category: InvestmentCategory;
  subtype: InvestmentSubtype;
  platform?: string | null;
  current_value: number;
  monthly_contribution?: number | null;
  status: InvestmentStatus;
};

export async function createInvestment(
  input: InvestmentInput,
): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("investments")
    .insert({
      user_id: user.id,
      name: input.name,
      category: input.category,
      subtype: input.subtype,
      platform: input.platform ?? null,
      current_value: input.current_value,
      monthly_contribution: input.monthly_contribution ?? 0,
      status: input.status,
      closed_at: input.status === "closed" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  await syncCurrentMonthSnapshot();
  return { id: data?.id };
}

export async function updateInvestment(
  id: string,
  input: Partial<InvestmentInput>,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  (["name", "category", "subtype", "platform", "current_value", "monthly_contribution", "status"] as const).forEach(
    (key) => {
      if (input[key] !== undefined) patch[key] = input[key];
    },
  );
  if (input.status === "closed") patch.closed_at = new Date().toISOString();
  if (input.status === "active" || input.status === "paused")
    patch.closed_at = null;

  const { error } = await supabase
    .from("investments")
    .update(patch)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  await syncCurrentMonthSnapshot();
  return {};
}

export async function listInvestments(): Promise<{
  data: import("@/types/database").Investment[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Unauthorized" };

  const { data, error } = await supabase
    .from("investments")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as import("@/types/database").Investment[] };
}

export async function getInvestment(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Unauthorized" };

  const { data, error } = await supabase
    .from("investments")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  return { data };
}

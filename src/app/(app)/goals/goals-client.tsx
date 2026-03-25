"use client";

import { formatCurrency } from "@/lib/utils";
import { useWealthStore } from "@/stores/wealth-store";
import Link from "next/link";
import { useMemo } from "react";

export function GoalsClient() {
  const hydrated = useWealthStore((s) => s.hydrated);
  const goals = useWealthStore((s) => s.goals);
  const investments = useWealthStore((s) => s.investments);
  const snapshots = useWealthStore((s) => s.snapshots);
  const deleteGoal = useWealthStore((s) => s.deleteGoal);

  const rows = useMemo(() => {
    const recent = [...snapshots]
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 3);
    const avgGrowth =
      recent.length > 0
        ? recent.reduce((s, x) => s + x.changeAbsolute, 0) / recent.length
        : 0;

    return goals.map((g) => {
      let progress = 0;
      for (const id of g.linkedInvestmentIds) {
        const inv = investments.find((i) => i.id === id);
        if (inv) progress += inv.currentValue;
      }
      const pct = g.targetAmount > 0 ? Math.min(100, (progress / g.targetAmount) * 100) : 0;
      const remaining = Math.max(0, g.targetAmount - progress);
      const eta =
        avgGrowth > 0 ? Math.ceil(remaining / avgGrowth) : remaining > 0 ? null : 0;
      return { ...g, progress, pct, eta };
    });
  }, [goals, investments, snapshots]);

  if (!hydrated) {
    return <p className="text-sm text-[var(--nw-muted)]">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--nw-fg)]">Goals</h1>
          <p className="mt-1 text-sm text-[var(--nw-muted)]">
            Progress from linked balances; ETA from recent net-worth momentum.
          </p>
        </div>
        <Link href="/goals/new" className="nw-btn-primary px-5">
          New goal
        </Link>
      </div>
      {rows.length === 0 ? (
        <div className="nw-card text-sm text-[var(--nw-muted)]">
          No goals yet.{" "}
          <Link href="/goals/new" className="text-[var(--nw-accent)] hover:underline">
            Create one
          </Link>
          .
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {rows.map((g) => (
            <li key={g.id} className="nw-card">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-[var(--nw-fg)]">{g.name}</p>
                <button
                  type="button"
                  className="shrink-0 text-xs text-rose-600 dark:text-rose-400 hover:underline"
                  onClick={() => {
                    if (confirm("Remove this goal?")) deleteGoal(g.id);
                  }}
                >
                  Delete
                </button>
              </div>
              <p className="mt-1 text-sm text-[var(--nw-muted)]">
                {formatCurrency(g.progress)} of {formatCurrency(g.targetAmount)}
              </p>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[var(--nw-elevated)]">
                <div
                  className="h-full rounded-full bg-[var(--nw-accent)]"
                  style={{ width: `${Math.min(100, g.pct)}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-[var(--nw-muted)]">
                {g.pct.toFixed(1)}% complete ·{" "}
                {g.eta == null
                  ? "ETA needs more history"
                  : g.eta === 0
                    ? "Within reach"
                    : `~${g.eta} months at recent pace`}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

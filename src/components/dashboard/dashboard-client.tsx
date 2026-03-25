"use client";

import { CategoryPie } from "@/components/dashboard/category-pie";
import { ContributionSplit } from "@/components/dashboard/contribution-split";
import { InsightsPanel } from "@/components/dashboard/insights-panel";
import { MonthNav } from "@/components/dashboard/month-nav";
import { NetWorthChart } from "@/components/dashboard/net-worth-chart";
import { NetWorthHero } from "@/components/dashboard/net-worth-hero";
import { TopMovers, type Mover } from "@/components/dashboard/top-movers";
import { generateInsights } from "@/lib/insights/rules";
import { categoryTotalsFromInvestments } from "@/lib/networth";
import { useWealthStore } from "@/stores/wealth-store";
import { formatMonth, shiftMonthKey, startOfMonth } from "@/lib/utils";
import type { MonthlySnapshot } from "@/types/app-data";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

function snapshotForMonth(
  snapshots: MonthlySnapshot[],
  monthKey: string,
): MonthlySnapshot | null {
  return snapshots.find((s) => s.month === monthKey) ?? null;
}

export function DashboardClient() {
  const searchParams = useSearchParams();
  const hydrated = useWealthStore((s) => s.hydrated);
  const investments = useWealthStore((s) => s.investments);
  const snapshots = useWealthStore((s) => s.snapshots);
  const contributions = useWealthStore((s) => s.contributions);
  const goals = useWealthStore((s) => s.goals);
  const syncSnapshotForCurrentMonth = useWealthStore((s) => s.syncSnapshotForCurrentMonth);

  const currentKey = formatMonth(startOfMonth(new Date()));
  const m = searchParams.get("m");
  const monthKey =
    m && /^\d{4}-\d{2}$/.test(m) ? m : currentKey;

  const series = useMemo(
    () =>
      [...snapshots]
        .sort((a, b) => a.month.localeCompare(b.month))
        .map((s) => ({ month: s.month, netWorth: s.netWorth })),
    [snapshots],
  );

  const availableMonths = useMemo(
    () => [...new Set(snapshots.map((s) => s.month))].sort(),
    [snapshots],
  );

  const snapshot = useMemo(
    () => snapshotForMonth(snapshots, monthKey),
    [snapshots, monthKey],
  );
  const prevSnapshot = useMemo(
    () => snapshotForMonth(snapshots, shiftMonthKey(monthKey, -1)),
    [snapshots, monthKey],
  );

  const contributionsLogged = useMemo(
    () =>
      contributions.filter((c) => c.month === monthKey).reduce((s, c) => s + c.amount, 0),
    [contributions, monthKey],
  );

  const contributionsThisMonth =
    snapshot?.totalContributions != null && snapshot.totalContributions > 0
      ? snapshot.totalContributions
      : contributionsLogged;

  const nameById = useMemo(
    () => Object.fromEntries(investments.map((i) => [i.id, i.name])),
    [investments],
  );

  const movers: Mover[] = useMemo(() => {
    const cur = snapshot?.assetBreakdown ?? {};
    const prev = prevSnapshot?.assetBreakdown ?? {};
    if (!Object.keys(cur).length || !Object.keys(prev).length) return [];
    const ids = new Set([...Object.keys(cur), ...Object.keys(prev)]);
    return [...ids]
      .map((id) => ({
        name: nameById[id] ?? "Unknown",
        delta: Number(cur[id] ?? 0) - Number(prev[id] ?? 0),
      }))
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
      .slice(0, 5);
  }, [snapshot, prevSnapshot, nameById]);

  const categoryTotalsLive = useMemo(
    () => categoryTotalsFromInvestments(investments) as Record<string, number>,
    [investments],
  );

  const categoryTotals =
    snapshot?.categoryTotals ?? categoryTotalsLive;

  const insights = generateInsights({
    snapshot,
    prevSnapshot,
    investments,
    contributionsLogged,
    monthKey,
    categoryTotals: categoryTotalsLive,
  });

  const momPct = snapshot?.changePercent ?? null;
  const momAbs = snapshot?.changeAbsolute ?? null;
  const netWorth = snapshot?.netWorth ?? 0;

  const marketGrowth =
    momAbs != null ? momAbs - contributionsThisMonth : null;

  useEffect(() => {
    if (!hydrated) return;
    if (monthKey === currentKey) syncSnapshotForCurrentMonth();
  }, [hydrated, monthKey, currentKey, syncSnapshotForCurrentMonth]);

  const goalsWithProgress = useMemo(() => {
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
      return { ...g, progress_pct: pct, eta_months: eta };
    });
  }, [goals, investments, snapshots]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-[var(--nw-muted)]">
        Loading your ledger…
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <MonthNav monthKey={monthKey} availableMonths={availableMonths} />
        <div className="flex flex-wrap gap-2">
          <Link
            href="/investments/new"
            className="nw-btn-primary inline-flex items-center justify-center px-5"
          >
            Add investment
          </Link>
          <Link href="/investments" className="nw-btn-ghost">
            View all
          </Link>
        </div>
      </div>

      {investments.length === 0 ? (
        <div className="nw-card">
          <p className="font-medium text-[var(--nw-fg)]">No investments yet</p>
          <p className="mt-1 max-w-xl text-sm text-[var(--nw-muted)]">
            Refresh the page to load sample data, or add an investment to start tracking.
          </p>
          <Link href="/investments/new" className="nw-btn-primary mt-4 inline-block px-5">
            Add investment
          </Link>
        </div>
      ) : null}

      <NetWorthHero netWorth={netWorth} momPct={momPct} momAbs={momAbs} />

      <div className="grid gap-6 lg:grid-cols-2">
        <NetWorthChart data={series} />
        <CategoryPie totals={categoryTotals} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ContributionSplit
          contributions={contributionsThisMonth}
          marketGrowth={marketGrowth}
        />
        <TopMovers movers={movers} />
      </div>

      <InsightsPanel insights={insights} />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--nw-fg)]">Goals</h2>
          <Link href="/goals/new" className="text-sm text-[var(--nw-accent)] hover:underline">
            New goal
          </Link>
        </div>
        {goalsWithProgress.length === 0 ? (
          <p className="text-sm text-[var(--nw-muted)]">No goals yet.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {goalsWithProgress.map((g) => (
              <li key={g.id} className="nw-card">
                <p className="font-medium text-[var(--nw-fg)]">{g.name}</p>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--nw-elevated)]">
                  <div
                    className="h-full rounded-full bg-[var(--nw-accent)] transition-all"
                    style={{ width: `${Math.min(100, g.progress_pct)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-[var(--nw-muted)]">
                  {g.progress_pct.toFixed(1)}% of target ·{" "}
                  {g.eta_months == null
                    ? "ETA needs more trend data"
                    : g.eta_months === 0
                      ? "On track or complete"
                      : `~${g.eta_months} mo at recent pace`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

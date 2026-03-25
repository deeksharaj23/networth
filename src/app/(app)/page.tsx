import { listContributionsForMonth } from "@/app/actions/contributions";
import { listInvestments } from "@/app/actions/investments";
import { listGoalsWithProgress } from "@/app/actions/goals";
import {
  getSnapshotForMonth,
  getSnapshotsSeries,
  syncCurrentMonthSnapshot,
} from "@/app/actions/snapshots";
import { CategoryPie } from "@/components/dashboard/category-pie";
import { ContributionSplit } from "@/components/dashboard/contribution-split";
import { InsightsPanel } from "@/components/dashboard/insights-panel";
import { MonthNav } from "@/components/dashboard/month-nav";
import { NetWorthChart } from "@/components/dashboard/net-worth-chart";
import { NetWorthHero } from "@/components/dashboard/net-worth-hero";
import { TopMovers, type Mover } from "@/components/dashboard/top-movers";
import { DemoSeedButton } from "@/components/dashboard/demo-seed-button";
import { generateInsights } from "@/lib/insights/rules";
import { formatMonth, shiftMonthKey, startOfMonth } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const sp = await searchParams;
  const currentKey = formatMonth(startOfMonth(new Date()));
  const monthKey =
    sp.m && /^\d{4}-\d{2}$/.test(sp.m) ? sp.m : currentKey;

  if (monthKey === currentKey) {
    await syncCurrentMonthSnapshot();
  }

  const [
    invRes,
    snapRes,
    prevRes,
    seriesRes,
    contribRes,
    goalsRes,
  ] = await Promise.all([
    listInvestments(),
    getSnapshotForMonth(monthKey),
    getSnapshotForMonth(shiftMonthKey(monthKey, -1)),
    getSnapshotsSeries(),
    listContributionsForMonth(monthKey),
    listGoalsWithProgress(),
  ]);

  const investments = invRes.data;
  const snapshot = snapRes.snapshot;
  const prevSnapshot = prevRes.snapshot;
  const series = seriesRes.data;
  const contributionsLogged = contribRes.data.reduce((s, c) => s + c.amount, 0);
  const contributionsThisMonth =
    snapshot?.total_contributions != null && snapshot.total_contributions > 0
      ? Number(snapshot.total_contributions)
      : contributionsLogged;

  const availableMonths = [...new Set(series.map((s) => s.month.slice(0, 7)))].sort();

  const nameById = Object.fromEntries(investments.map((i) => [i.id, i.name]));
  const movers: Mover[] = (() => {
    const cur = snapshot?.asset_breakdown ?? {};
    const prev = prevSnapshot?.asset_breakdown ?? {};
    if (!Object.keys(cur).length || !Object.keys(prev).length) return [];
    const ids = new Set([...Object.keys(cur), ...Object.keys(prev)]);
    return [...ids]
      .map((id) => ({
        name: nameById[id] ?? "Unknown",
        delta: Number(cur[id] ?? 0) - Number(prev[id] ?? 0),
      }))
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
      .slice(0, 5);
  })();

  const insights = generateInsights({
    snapshot,
    prevSnapshot,
    investments,
    contributionsLogged,
    monthKey,
  });

  const momPct = snapshot?.mom_change_pct ?? null;
  const momAbs = snapshot?.mom_change_abs ?? null;
  const netWorth = snapshot?.net_worth ?? 0;
  const categoryTotals =
    snapshot?.category_totals ??
    ({} as Record<string, number>);

  const marketGrowth =
    momAbs != null ? momAbs - contributionsThisMonth : null;

  const goals = goalsRes.data;

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
        <div className="nw-card flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-[var(--nw-fg)]">Start your ledger</p>
            <p className="mt-1 max-w-xl text-sm text-[var(--nw-muted)]">
              Add an investment or load demo data to explore the dashboard, charts, and
              insights.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <DemoSeedButton />
            <Link href="/investments/new" className="nw-btn-primary px-5">
              Add manually
            </Link>
          </div>
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
        {goals.length === 0 ? (
          <p className="text-sm text-[var(--nw-muted)]">No goals yet.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {goals.map((g) => (
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

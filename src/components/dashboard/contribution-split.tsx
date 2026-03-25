"use client";

import { formatCurrency } from "@/lib/utils";

type Props = {
  contributions: number;
  marketGrowth: number | null;
};

export function ContributionSplit({ contributions, marketGrowth }: Props) {
  const total =
    marketGrowth != null ? Math.abs(contributions) + Math.abs(marketGrowth) : null;
  const cPct = total && total > 0 ? (Math.abs(contributions) / total) * 100 : 50;
  const mPct = total && total > 0 && marketGrowth != null ? 100 - cPct : 50;

  return (
    <div className="nw-card">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--nw-muted)]">
        Contributions vs market
      </p>
      <p className="mt-2 text-sm text-[var(--nw-muted)]">
        Approximate split of this month&apos;s net worth change.
      </p>
      <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-[var(--nw-elevated)]">
        <div
          className="h-full rounded-full bg-[var(--nw-accent)] transition-all duration-500"
          style={{ width: `${cPct}%` }}
        />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-[var(--nw-muted)]">Contributions</p>
          <p className="text-lg font-semibold text-[var(--nw-fg)]">
            {formatCurrency(contributions)}
          </p>
          <p className="text-xs text-[var(--nw-muted)]">{cPct.toFixed(0)}% of change</p>
        </div>
        <div>
          <p className="text-xs text-[var(--nw-muted)]">Market &amp; other</p>
          <p className="text-lg font-semibold text-[var(--nw-fg)]">
            {marketGrowth == null ? "—" : formatCurrency(marketGrowth)}
          </p>
          <p className="text-xs text-[var(--nw-muted)]">
            {marketGrowth == null ? "Need prior month" : `${mPct.toFixed(0)}% of change`}
          </p>
        </div>
      </div>
    </div>
  );
}

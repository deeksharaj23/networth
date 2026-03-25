"use client";

import { formatCompact, formatCurrency, formatPct } from "@/lib/utils";

type NetWorthHeroProps = {
  netWorth: number;
  momPct: number | null;
  momAbs: number | null;
};

export function NetWorthHero({ netWorth, momPct, momAbs }: NetWorthHeroProps) {
  const positive = momAbs != null && momAbs >= 0;

  return (
    <div className="nw-card relative overflow-hidden transition-opacity duration-500">
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[var(--nw-accent-soft)] blur-3xl" />
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--nw-muted)]">
        Net worth
      </p>
      <p className="mt-2 text-4xl font-semibold tracking-tight text-[var(--nw-fg)] sm:text-5xl">
        {formatCurrency(netWorth)}
      </p>
      <p className="mt-1 text-sm text-[var(--nw-muted)]">{formatCompact(netWorth)}</p>
      <div className="mt-6 flex flex-wrap gap-6 border-t border-[var(--nw-border)]/60 pt-5">
        <div>
          <p className="text-xs text-[var(--nw-muted)]">Month on month</p>
          <p
            className={`text-lg font-medium ${
              momPct == null
                ? "text-[var(--nw-muted)]"
                : positive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {formatPct(momPct)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--nw-muted)]">Absolute change</p>
          <p className="text-lg font-medium text-[var(--nw-fg)]">
            {momAbs == null
              ? "—"
              : `${momAbs >= 0 ? "+" : "−"}${formatCurrency(Math.abs(momAbs))}`}
          </p>
        </div>
      </div>
    </div>
  );
}

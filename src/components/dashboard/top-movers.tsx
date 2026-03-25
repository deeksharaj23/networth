"use client";

import { formatCurrency } from "@/lib/utils";

export type Mover = { name: string; delta: number };

export function TopMovers({ movers }: { movers: Mover[] }) {
  if (movers.length === 0) {
    return (
      <div className="nw-card text-sm text-[var(--nw-muted)]">
        Top movers appear when two consecutive monthly snapshots include per-asset
        breakdowns.
      </div>
    );
  }

  return (
    <div className="nw-card">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--nw-muted)]">
        Top movers
      </p>
      <ul className="mt-4 space-y-3">
        {movers.map((m) => (
          <li
            key={m.name}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="truncate text-[var(--nw-fg)]">{m.name}</span>
            <span
              className={
                m.delta >= 0
                  ? "shrink-0 font-medium text-emerald-600 dark:text-emerald-400"
                  : "shrink-0 font-medium text-rose-600 dark:text-rose-400"
              }
            >
              {m.delta >= 0 ? "+" : "−"}
              {formatCurrency(Math.abs(m.delta))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

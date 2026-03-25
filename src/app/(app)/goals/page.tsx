import { listGoalsWithProgress } from "@/app/actions/goals";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default async function GoalsPage() {
  const { data: goals, error } = await listGoalsWithProgress();

  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--nw-fg)]">Goals</h1>
          <p className="mt-1 text-sm text-[var(--nw-muted)]">
            Progress uses linked investment balances; ETA uses recent net-worth momentum.
          </p>
        </div>
        <Link href="/goals/new" className="nw-btn-primary px-5">
          New goal
        </Link>
      </div>
      {goals.length === 0 ? (
        <div className="nw-card text-sm text-[var(--nw-muted)]">
          No goals yet.{" "}
          <Link href="/goals/new" className="text-[var(--nw-accent)] hover:underline">
            Create one
          </Link>
          .
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {goals.map((g) => (
            <li key={g.id} className="nw-card">
              <p className="font-medium text-[var(--nw-fg)]">{g.name}</p>
              <p className="mt-1 text-sm text-[var(--nw-muted)]">
                {formatCurrency(g.progress_value)} of {formatCurrency(g.target_amount)}
              </p>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[var(--nw-elevated)]">
                <div
                  className="h-full rounded-full bg-[var(--nw-accent)]"
                  style={{ width: `${Math.min(100, g.progress_pct)}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-[var(--nw-muted)]">
                {g.progress_pct.toFixed(1)}% complete ·{" "}
                {g.eta_months == null
                  ? "ETA needs more history"
                  : g.eta_months === 0
                    ? "Within reach"
                    : `~${g.eta_months} months at recent pace`}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

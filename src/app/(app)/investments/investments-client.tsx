"use client";

import { formatCurrency } from "@/lib/utils";
import { useWealthStore } from "@/stores/wealth-store";
import Link from "next/link";

const statusStyle: Record<string, string> = {
  active: "text-emerald-700 dark:text-emerald-400",
  paused: "text-amber-700 dark:text-amber-400",
  closed: "text-[var(--nw-muted)]",
};

export function InvestmentsClient() {
  const hydrated = useWealthStore((s) => s.hydrated);
  const rows = useWealthStore((s) => s.investments);

  if (!hydrated) {
    return <p className="text-sm text-[var(--nw-muted)]">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--nw-fg)]">
            Investments
          </h1>
          <p className="mt-1 text-sm text-[var(--nw-muted)]">
            Local-only ledger — closed rows keep history.
          </p>
        </div>
        <Link href="/investments/new" className="nw-btn-primary px-5">
          Add investment
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="nw-card text-sm text-[var(--nw-muted)]">
          No investments yet.{" "}
          <Link href="/investments/new" className="text-[var(--nw-accent)] hover:underline">
            Add your first
          </Link>{" "}
          or refresh to load sample data.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--nw-border)] bg-[var(--nw-surface)]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--nw-border)] bg-[var(--nw-elevated)]/50 text-xs uppercase tracking-wide text-[var(--nw-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Category</th>
                <th className="px-4 py-3 text-right font-medium">Value</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-[var(--nw-border)]/60 last:border-0 hover:bg-[var(--nw-elevated)]/30"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/investments/${r.id}`}
                      className="font-medium text-[var(--nw-fg)] hover:underline"
                    >
                      {r.name}
                    </Link>
                    <p className="text-xs text-[var(--nw-muted)] sm:hidden">
                      {r.category} · {r.subtype}
                    </p>
                  </td>
                  <td className="hidden px-4 py-3 text-[var(--nw-muted)] sm:table-cell">
                    {r.category}
                    <span className="block text-xs">{r.subtype}</span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-[var(--nw-fg)]">
                    {formatCurrency(r.currentValue)}
                  </td>
                  <td className={`px-4 py-3 capitalize ${statusStyle[r.status] ?? ""}`}>
                    {r.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

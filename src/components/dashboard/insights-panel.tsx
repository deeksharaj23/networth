"use client";

import type { Insight } from "@/lib/insights/rules";

const toneRing: Record<Insight["tone"], string> = {
  positive: "border-emerald-500/30 bg-emerald-500/5",
  neutral: "border-[var(--nw-border)] bg-[var(--nw-elevated)]/40",
  watch: "border-amber-500/30 bg-amber-500/5",
};

export function InsightsPanel({ insights }: { insights: Insight[] }) {
  return (
    <div className="nw-card">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--nw-muted)]">
        Insights
      </p>
      <ul className="mt-4 space-y-3">
        {insights.map((i) => (
          <li
            key={i.id}
            className={`rounded-xl border px-4 py-3 text-sm transition hover:opacity-95 ${toneRing[i.tone]}`}
          >
            <p className="font-medium text-[var(--nw-fg)]">{i.title}</p>
            {i.detail ? (
              <p className="mt-1 text-xs leading-relaxed text-[var(--nw-muted)]">
                {i.detail}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

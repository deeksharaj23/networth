"use client";

import type { InvestmentCategory } from "@/types/database";
import { formatCompact } from "@/lib/utils";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS: Record<string, string> = {
  Cash: "var(--nw-chart-2)",
  Equity: "var(--nw-chart-1)",
  Gold: "var(--nw-chart-3)",
  Retirement: "var(--nw-chart-4)",
  Liability: "var(--nw-chart-5)",
};

type Row = { name: InvestmentCategory | string; value: number };

export function CategoryPie({ totals }: { totals: Record<string, number> }) {
  const data: Row[] = Object.entries(totals)
    .map(([name, value]) => ({ name, value: Math.max(0, Number(value)) }))
    .filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="nw-card flex h-72 items-center justify-center text-sm text-[var(--nw-muted)]">
        No allocation data for this month.
      </div>
    );
  }

  return (
    <div className="nw-card">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--nw-muted)]">
        Category mix
      </p>
      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={56}
              outerRadius={88}
              paddingAngle={2}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[entry.name] ?? "var(--nw-chart-2)"}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid var(--nw-border)",
                background: "var(--nw-surface)",
                fontSize: 12,
              }}
              formatter={(value) =>
                formatCompact(Number(value ?? 0))
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--nw-muted)]">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: COLORS[d.name] ?? "#999" }}
            />
            {d.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

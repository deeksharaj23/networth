"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parse } from "date-fns";
import { formatCompact } from "@/lib/utils";

type Point = { month: string; net_worth: number };

export function NetWorthChart({ data }: { data: Point[] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: (() => {
      try {
        return format(parse(d.month, "yyyy-MM-dd", new Date()), "MMM yy");
      } catch {
        return d.month;
      }
    })(),
  }));

  if (chartData.length === 0) {
    return (
      <div className="nw-card flex h-72 items-center justify-center text-sm text-[var(--nw-muted)]">
        Add investments and snapshots to see your curve.
      </div>
    );
  }

  return (
    <div className="nw-card">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--nw-muted)]">
        Net worth over time
      </p>
      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--nw-muted)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => formatCompact(Number(v)).replace("₹", "")}
              tick={{ fill: "var(--nw-muted)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid var(--nw-border)",
                background: "var(--nw-surface)",
                fontSize: 12,
              }}
              formatter={(value) => [
                formatCompact(Number(value ?? 0)),
                "Net worth",
              ]}
            />
            <Line
              type="monotone"
              dataKey="net_worth"
              stroke="var(--nw-accent)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

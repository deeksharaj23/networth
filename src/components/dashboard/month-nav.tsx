"use client";

import { shiftMonthKey } from "@/lib/utils";
import Link from "next/link";
import { format, parse } from "date-fns";

type MonthNavProps = {
  monthKey: string;
  availableMonths: string[];
};

export function MonthNav({ monthKey, availableMonths }: MonthNavProps) {
  const label = (() => {
    try {
      return format(parse(`${monthKey}-01`, "yyyy-MM-dd", new Date()), "MMMM yyyy");
    } catch {
      return monthKey;
    }
  })();

  const prev = shiftMonthKey(monthKey, -1);
  const next = shiftMonthKey(monthKey, 1);
  const nextMonthStart = parse(`${next}-01`, "yyyy-MM-dd", new Date());
  const cap = new Date();
  cap.setDate(1);
  cap.setHours(0, 0, 0, 0);
  const canGoFuture = nextMonthStart <= cap;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--nw-muted)]">
          Timeline
        </p>
        <p className="text-lg font-semibold tracking-tight text-[var(--nw-fg)]">{label}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/?m=${prev}`} className="nw-btn-ghost" prefetch>
          ← Prev
        </Link>
        {canGoFuture ? (
          <Link href={`/?m=${next}`} className="nw-btn-ghost" prefetch>
            Next →
          </Link>
        ) : (
          <span className="rounded-full px-3 py-1.5 text-sm text-[var(--nw-muted)]/40">
            Next →
          </span>
        )}
      </div>
      {availableMonths.length > 0 ? (
        <div className="flex w-full gap-1 overflow-x-auto pb-1 sm:max-w-xl sm:justify-end">
          {availableMonths.slice(-18).map((m) => (
            <Link
              key={m}
              href={`/?m=${m.slice(0, 7)}`}
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs transition ${
                m.slice(0, 7) === monthKey
                  ? "bg-[var(--nw-accent-soft)] font-medium text-[var(--nw-accent)]"
                  : "text-[var(--nw-muted)] hover:bg-[var(--nw-elevated)]"
              }`}
            >
              {m.slice(0, 7)}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

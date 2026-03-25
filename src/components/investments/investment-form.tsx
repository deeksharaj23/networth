"use client";

import type { Investment, InvestmentCategory } from "@/types/app-data";
import { useWealthStore } from "@/stores/wealth-store";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const CATEGORIES: InvestmentCategory[] = [
  "Cash",
  "Equity",
  "Gold",
  "Retirement",
  "Liability",
];

const SUBTYPES = [
  "Savings",
  "FD",
  "Mutual Fund",
  "ETF",
  "Stocks",
  "SGB",
  "PF",
  "NPS",
  "Credit Card",
] as const;

const SUGGESTED: Partial<Record<InvestmentCategory, string[]>> = {
  Cash: ["Savings", "FD"],
  Equity: ["Mutual Fund", "ETF", "Stocks"],
  Gold: ["SGB"],
  Retirement: ["PF", "NPS"],
  Liability: ["Credit Card"],
};

type Props = {
  initial?: Investment | null;
};

export function InvestmentForm({ initial }: Props) {
  const router = useRouter();
  const addInvestment = useWealthStore((s) => s.addInvestment);
  const updateInvestment = useWealthStore((s) => s.updateInvestment);

  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState<InvestmentCategory>(
    initial?.category ?? "Equity",
  );
  const [subtype, setSubtype] = useState(initial?.subtype ?? "Mutual Fund");
  const [currentValue, setCurrentValue] = useState(String(initial?.currentValue ?? ""));
  const [monthlyContribution, setMonthlyContribution] = useState(
    String(initial?.monthlyContribution ?? ""),
  );
  const [status, setStatus] = useState<Investment["status"]>(initial?.status ?? "active");

  const subtypeOptions = useMemo(() => {
    const sug = SUGGESTED[category];
    if (!sug) return [...SUBTYPES];
    return [...new Set([...sug, ...SUBTYPES])];
  }, [category]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: name.trim(),
      category,
      subtype,
      currentValue: Number(currentValue) || 0,
      monthlyContribution:
        monthlyContribution === "" ? undefined : Number(monthlyContribution),
      status,
    };
    if (initial) updateInvestment(initial.id, payload);
    else addInvestment(payload);
    router.push("/investments");
  }

  return (
    <form onSubmit={onSubmit} className="nw-card mx-auto max-w-lg space-y-5">
      <div className="space-y-2">
        <label className="text-sm text-[var(--nw-muted)]" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="nw-input"
          placeholder="e.g. Index fund core"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-[var(--nw-muted)]" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => {
              const c = e.target.value as InvestmentCategory;
              setCategory(c);
              const sug = SUGGESTED[c]?.[0];
              if (sug) setSubtype(sug);
            }}
            className="nw-input"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-[var(--nw-muted)]" htmlFor="subtype">
            Subtype
          </label>
          <select
            id="subtype"
            value={subtype}
            onChange={(e) => setSubtype(e.target.value)}
            className="nw-input"
          >
            {subtypeOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-[var(--nw-muted)]" htmlFor="cv">
            Current value
          </label>
          <input
            id="cv"
            inputMode="decimal"
            required
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            className="nw-input"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-[var(--nw-muted)]" htmlFor="mc">
            Monthly contribution
          </label>
          <input
            id="mc"
            inputMode="decimal"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(e.target.value)}
            className="nw-input"
            placeholder="Optional"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm text-[var(--nw-muted)]" htmlFor="status">
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as Investment["status"])}
          className="nw-input"
        >
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="closed">Closed</option>
        </select>
      </div>
      <div className="flex flex-wrap gap-2 pt-2">
        <button type="submit" className="nw-btn-primary px-6">
          {initial ? "Save changes" : "Add investment"}
        </button>
        <button type="button" className="nw-btn-ghost" onClick={() => router.back()}>
          Cancel
        </button>
      </div>
    </form>
  );
}

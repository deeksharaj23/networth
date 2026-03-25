"use client";

import { useWealthStore } from "@/stores/wealth-store";
import { formatMonth, startOfMonth } from "@/lib/utils";
import { useState } from "react";

export function ContributionForm({ investmentId }: { investmentId: string }) {
  const addContribution = useWealthStore((s) => s.addContribution);
  const [amount, setAmount] = useState("");
  const [monthKey, setMonthKey] = useState(formatMonth(startOfMonth(new Date())));
  const [msg, setMsg] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    addContribution({
      investmentId,
      amount: Number(amount) || 0,
      month: monthKey,
    });
    setAmount("");
    setMsg("Saved.");
  }

  return (
    <form onSubmit={onSubmit} className="nw-card space-y-4">
      <p className="text-sm font-medium text-[var(--nw-fg)]">Log contribution</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs text-[var(--nw-muted)]" htmlFor="amt">
            Amount
          </label>
          <input
            id="amt"
            inputMode="decimal"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="nw-input"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-[var(--nw-muted)]" htmlFor="mk">
            Month
          </label>
          <input
            id="mk"
            type="month"
            value={monthKey}
            onChange={(e) => setMonthKey(e.target.value)}
            className="nw-input"
          />
        </div>
      </div>
      {msg ? <p className="text-xs text-[var(--nw-muted)]">{msg}</p> : null}
      <button type="submit" className="nw-btn-primary text-sm">
        Record
      </button>
    </form>
  );
}

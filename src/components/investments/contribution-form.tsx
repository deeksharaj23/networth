"use client";

import { recordContribution } from "@/app/actions/contributions";
import { formatMonth, startOfMonth } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ContributionForm({ investmentId }: { investmentId: string }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [monthKey, setMonthKey] = useState(formatMonth(startOfMonth(new Date())));
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await recordContribution({
      investment_id: investmentId,
      amount: Number(amount) || 0,
      monthKey,
    });
    setPending(false);
    if (res.error) setError(res.error);
    else {
      setAmount("");
      router.refresh();
    }
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
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <button type="submit" disabled={pending} className="nw-btn-primary text-sm disabled:opacity-50">
        {pending ? "Saving…" : "Record"}
      </button>
    </form>
  );
}

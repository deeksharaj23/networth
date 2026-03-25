"use client";

import { ContributionForm } from "@/components/investments/contribution-form";
import { InvestmentForm } from "@/components/investments/investment-form";
import { useWealthStore } from "@/stores/wealth-store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export function InvestmentDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const hydrated = useWealthStore((s) => s.hydrated);
  const investments = useWealthStore((s) => s.investments);
  const deleteInvestment = useWealthStore((s) => s.deleteInvestment);

  const inv = useMemo(() => investments.find((i) => i.id === id), [investments, id]);

  if (!hydrated) {
    return <p className="text-sm text-[var(--nw-muted)]">Loading…</p>;
  }

  if (!inv) {
    return (
      <div className="nw-card">
        <p className="text-[var(--nw-fg)]">Investment not found.</p>
        <Link href="/investments" className="mt-2 inline-block text-sm text-[var(--nw-accent)]">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/investments"
            className="text-xs font-medium text-[var(--nw-muted)] hover:text-[var(--nw-accent)]"
          >
            ← All investments
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--nw-fg)]">
            {inv.name}
          </h1>
          <p className="mt-1 text-sm text-[var(--nw-muted)]">
            {inv.category} · {inv.subtype}
          </p>
        </div>
        <button
          type="button"
          className="nw-btn-ghost text-sm text-rose-600 dark:text-rose-400"
          onClick={() => {
            if (!confirm("Delete this investment? Linked goals lose this link.")) return;
            deleteInvestment(id);
            router.push("/investments");
          }}
        >
          Delete
        </button>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <InvestmentForm initial={inv} />
        <ContributionForm investmentId={inv.id} />
      </div>
    </div>
  );
}

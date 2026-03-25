import { getInvestment } from "@/app/actions/investments";
import { ContributionForm } from "@/components/investments/contribution-form";
import { InvestmentForm } from "@/components/investments/investment-form";
import type { Investment } from "@/types/database";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function InvestmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data, error } = await getInvestment(id);
  if (error || !data) notFound();

  const inv = data as Investment;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
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
            {inv.platform ? ` · ${inv.platform}` : ""}
          </p>
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <InvestmentForm initial={inv} />
        <ContributionForm investmentId={inv.id} />
      </div>
    </div>
  );
}

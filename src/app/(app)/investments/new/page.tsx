import { InvestmentForm } from "@/components/investments/investment-form";

export default function NewInvestmentPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--nw-fg)]">
          New investment
        </h1>
        <p className="mt-1 text-sm text-[var(--nw-muted)]">
          Fast capture — you can refine values anytime.
        </p>
      </div>
      <InvestmentForm />
    </div>
  );
}

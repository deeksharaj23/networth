import { GoalForm } from "@/components/goals/goal-form";

export default function NewGoalPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--nw-fg)]">New goal</h1>
        <p className="mt-1 text-sm text-[var(--nw-muted)]">
          Link investments you want to count toward this target.
        </p>
      </div>
      <GoalForm />
    </div>
  );
}

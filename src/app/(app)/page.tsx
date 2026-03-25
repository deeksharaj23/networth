import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="text-sm text-[var(--nw-muted)]">Loading…</div>}>
      <DashboardClient />
    </Suspense>
  );
}

"use client";

import { createGoal } from "@/app/actions/goals";
import type { Investment } from "@/types/database";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function GoalForm({ investments }: { investments: Investment[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function toggle(id: string) {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const ids = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => k);
    const res = await createGoal({
      name: name.trim(),
      target_amount: Number(target) || 0,
      investment_ids: ids,
    });
    setPending(false);
    if (res.error) setError(res.error);
    else {
      router.push("/goals");
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="nw-card mx-auto max-w-lg space-y-5">
      <div className="space-y-2">
        <label className="text-sm text-[var(--nw-muted)]" htmlFor="gname">
          Goal name
        </label>
        <input
          id="gname"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="nw-input"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-[var(--nw-muted)]" htmlFor="gt">
          Target amount
        </label>
        <input
          id="gt"
          inputMode="decimal"
          required
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="nw-input"
        />
      </div>
      <div className="space-y-2">
        <p className="text-sm text-[var(--nw-muted)]">Linked investments</p>
        <ul className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-[var(--nw-border)] p-3">
          {investments.length === 0 ? (
            <li className="text-sm text-[var(--nw-muted)]">Add investments first.</li>
          ) : (
            investments.map((i) => (
              <li key={i.id}>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!selected[i.id]}
                    onChange={() => toggle(i.id)}
                    className="rounded border-[var(--nw-border)]"
                  />
                  <span className="text-[var(--nw-fg)]">{i.name}</span>
                  <span className="text-xs text-[var(--nw-muted)]">{i.category}</span>
                </label>
              </li>
            ))
          )}
        </ul>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="nw-btn-primary px-6 disabled:opacity-50">
          {pending ? "Creating…" : "Create goal"}
        </button>
        <button type="button" className="nw-btn-ghost" onClick={() => router.back()}>
          Cancel
        </button>
      </div>
    </form>
  );
}

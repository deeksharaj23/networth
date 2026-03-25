"use client";

import { useWealthStore } from "@/stores/wealth-store";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function GoalForm() {
  const router = useRouter();
  const investments = useWealthStore((s) => s.investments);
  const addGoal = useWealthStore((s) => s.addGoal);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ids = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => k);
    addGoal({
      name: name.trim(),
      targetAmount: Number(target) || 0,
      linkedInvestmentIds: ids,
    });
    router.push("/goals");
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
      <div className="flex gap-2">
        <button type="submit" className="nw-btn-primary px-6">
          Create goal
        </button>
        <button type="button" className="nw-btn-ghost" onClick={() => router.back()}>
          Cancel
        </button>
      </div>
    </form>
  );
}

"use client";

import { seedDemoData } from "@/app/actions/seed-demo";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DemoSeedButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-stretch gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={async () => {
          setMsg(null);
          setPending(true);
          const r = await seedDemoData();
          setPending(false);
          if (r.error) setMsg(r.error);
          else router.refresh();
        }}
        className="nw-btn-ghost border border-[var(--nw-border)] px-5 py-2.5 text-[var(--nw-fg)] disabled:opacity-50"
      >
        {pending ? "Loading demo…" : "Load demo data"}
      </button>
      {msg ? <p className="text-xs text-rose-600 dark:text-rose-400">{msg}</p> : null}
    </div>
  );
}

"use client";

import { useWealthStore } from "@/stores/wealth-store";
import { useRef, useState } from "react";

export function DataToolbar() {
  const exportData = useWealthStore((s) => s.exportData);
  const importData = useWealthStore((s) => s.importData);
  const resetData = useWealthStore((s) => s.resetData);
  const inputRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  function onExport() {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wealth-app-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg(null);
  }

  async function onReset() {
    if (!confirm("Clear all local data? You can import a backup later.")) return;
    setMsg(null);
    await resetData();
    window.location.reload();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={onExport} className="nw-btn-ghost text-xs">
        Export data
      </button>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="nw-btn-ghost text-xs"
      >
        Import data
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          const reader = new FileReader();
          reader.onload = () => {
            const text = String(reader.result ?? "");
            const ok = importData(text);
            setMsg(ok ? "Import complete." : "Could not read that file.");
          };
          reader.readAsText(f);
        }}
      />
      <button type="button" onClick={() => void onReset()} className="nw-btn-ghost text-xs text-rose-600 dark:text-rose-400">
        Reset data
      </button>
      {msg ? <span className="text-xs text-[var(--nw-muted)]">{msg}</span> : null}
    </div>
  );
}

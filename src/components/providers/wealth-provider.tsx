"use client";

import { useWealthStore } from "@/stores/wealth-store";
import { useEffect } from "react";

export function WealthProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useWealthStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return <>{children}</>;
}

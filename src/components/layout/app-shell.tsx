import { DataToolbar } from "@/components/layout/data-toolbar";
import Link from "next/link";

const nav = [
  { href: "/", label: "Overview" },
  { href: "/investments", label: "Investments" },
  { href: "/goals", label: "Goals" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--nw-bg)]">
      <header className="sticky top-0 z-20 border-b border-[var(--nw-border)]/60 bg-[var(--nw-bg)]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6">
          <div className="flex h-10 items-center justify-between gap-3">
            <Link href="/" className="flex items-baseline gap-2 shrink-0">
              <span className="text-sm font-semibold tracking-tight text-[var(--nw-fg)]">
                Networth
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--nw-muted)]">
                OS
              </span>
            </Link>
            <nav className="hidden items-center gap-1 sm:flex">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="rounded-full px-3 py-1.5 text-sm text-[var(--nw-muted)] transition hover:bg-[var(--nw-elevated)] hover:text-[var(--nw-fg)]"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
            <div className="hidden lg:block">
              <DataToolbar />
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1 sm:hidden">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="shrink-0 rounded-full px-3 py-1.5 text-sm text-[var(--nw-muted)]"
              >
                {n.label}
              </Link>
            ))}
          </div>
          <div className="lg:hidden">
            <DataToolbar />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

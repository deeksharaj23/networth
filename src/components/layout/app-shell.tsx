import { signOut } from "@/app/actions/auth";
import Link from "next/link";

const nav = [
  { href: "/", label: "Overview" },
  { href: "/investments", label: "Investments" },
  { href: "/goals", label: "Goals" },
];

export function AppShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email?: string | null;
}) {
  return (
    <div className="min-h-screen bg-[var(--nw-bg)]">
      <header className="sticky top-0 z-20 border-b border-[var(--nw-border)]/60 bg-[var(--nw-bg)]/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-baseline gap-2">
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
          <div className="flex items-center gap-3">
            {email ? (
              <span className="hidden max-w-[160px] truncate text-xs text-[var(--nw-muted)] sm:inline">
                {email}
              </span>
            ) : null}
            <form action={signOut}>
              <button type="submit" className="nw-btn-ghost text-xs">
                Sign out
              </button>
            </form>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-[var(--nw-border)]/40 px-4 py-2 sm:hidden">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="shrink-0 rounded-full px-3 py-1.5 text-sm text-[var(--nw-muted)]"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

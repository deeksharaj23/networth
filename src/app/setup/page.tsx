import Link from "next/link";

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-[var(--nw-bg)] px-6 py-20 text-[var(--nw-fg)]">
      <div className="mx-auto max-w-lg space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Configure Supabase</h1>
        <p className="text-[var(--nw-muted)] leading-relaxed">
          Add your project URL and anon key to{" "}
          <code className="rounded bg-[var(--nw-elevated)] px-1.5 py-0.5 text-sm">
            .env.local
          </code>
          , then run the SQL in{" "}
          <code className="rounded bg-[var(--nw-elevated)] px-1.5 py-0.5 text-sm">
            supabase/schema.sql
          </code>{" "}
          in the Supabase SQL editor.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm text-[var(--nw-muted)]">
          <li>NEXT_PUBLIC_SUPABASE_URL</li>
          <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
        </ul>
        <Link
          href="/login"
          className="inline-flex rounded-full bg-[var(--nw-accent)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          Continue to sign in
        </Link>
      </div>
    </div>
  );
}

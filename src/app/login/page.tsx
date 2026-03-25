"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (err) {
        setError(err.message);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Could not reach Supabase. Check .env.local.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--nw-bg)] px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-1 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--nw-muted)]">
            Networth OS
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--nw-fg)]">
            Welcome back
          </h1>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-[var(--nw-muted)]" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="nw-input"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-[var(--nw-muted)]" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="nw-input"
            />
          </div>
          {error ? (
            <p className="text-sm text-red-600/90 dark:text-red-400/90">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="nw-btn-primary w-full disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="text-center text-sm text-[var(--nw-muted)]">
          No account?{" "}
          <Link href="/signup" className="text-[var(--nw-accent)] hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

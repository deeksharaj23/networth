# Networth OS

Personal finance web app: portfolio tracking, monthly snapshots, contributions vs market growth, rule-based insights, and goals — Next.js (App Router), Tailwind CSS, Supabase, Recharts, Zustand (see `src/stores/ui-store.ts`).

## Setup

1. Create a [Supabase](https://supabase.com) project and run `supabase/schema.sql` in the SQL editor (tables + RLS).

2. Copy `.env.local.example` to `.env.local` and set:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. In Supabase **Authentication**, enable **Email** and (optionally) confirm email off for local dev.

4. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up, then use **Load demo data** on the home screen (or add investments manually).

## Project layout

- `src/app/(app)/` — authenticated shell: dashboard, investments, goals
- `src/app/actions/` — server actions (CRUD, snapshots, seed demo)
- `src/components/dashboard/` — hero, charts, insights, month navigation
- `src/lib/insights/rules.ts` — rule-based insights
- `src/lib/integrations/price-feed.ts` — stub for future live prices
- `src/lib/insights/ai-layer.ts` — stub for future AI narratives

Without env vars, the app redirects to `/setup` with configuration hints.

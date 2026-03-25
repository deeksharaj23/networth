-- Networth OS — run in Supabase SQL Editor (new project)
-- Enable UUID if needed: create extension if not exists "uuid-ossp";

create table if not exists public.investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  category text not null check (category in ('Cash', 'Equity', 'Gold', 'Retirement', 'Liability')),
  subtype text not null check (subtype in (
    'Savings', 'FD', 'Mutual Fund', 'ETF', 'Stocks', 'SGB', 'PF', 'NPS', 'Credit Card'
  )),
  platform text,
  current_value numeric(14, 2) not null default 0,
  monthly_contribution numeric(14, 2) default 0,
  status text not null default 'active' check (status in ('active', 'paused', 'closed')),
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.monthly_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  month date not null,
  net_worth numeric(14, 2) not null,
  mom_change_pct numeric(10, 4),
  mom_change_abs numeric(14, 2),
  total_contributions numeric(14, 2) default 0,
  category_totals jsonb default '{}'::jsonb,
  asset_breakdown jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, month)
);

create table if not exists public.contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  investment_id uuid not null references public.investments (id) on delete cascade,
  amount numeric(14, 2) not null,
  contribution_month date not null,
  created_at timestamptz not null default now()
);

create index if not exists contributions_user_month_idx
  on public.contributions (user_id, contribution_month);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  target_amount numeric(14, 2) not null,
  target_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.goal_mappings (
  goal_id uuid not null references public.goals (id) on delete cascade,
  investment_id uuid not null references public.investments (id) on delete cascade,
  primary key (goal_id, investment_id)
);

create index if not exists investments_user_idx on public.investments (user_id);
create index if not exists snapshots_user_month_idx on public.monthly_snapshots (user_id, month);

alter table public.investments enable row level security;
alter table public.monthly_snapshots enable row level security;
alter table public.contributions enable row level security;
alter table public.goals enable row level security;
alter table public.goal_mappings enable row level security;

create policy "investments_own" on public.investments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "snapshots_own" on public.monthly_snapshots
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "contributions_own" on public.contributions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "goals_own" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "goal_mappings_own" on public.goal_mappings
  for all using (
    exists (select 1 from public.goals g where g.id = goal_id and g.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.goals g where g.id = goal_id and g.user_id = auth.uid())
  );

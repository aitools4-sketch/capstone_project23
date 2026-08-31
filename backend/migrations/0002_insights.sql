-- AI-generated insight cache, one row per scan. Generated on first request
-- (see backend/app/routers/scans.py's insights endpoint), never eagerly —
-- an Anthropic call per scan costs real money, so nothing calls the model
-- until a user actually asks to see the explanation.

create table if not exists public.insights (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.scans (id) on delete cascade,
  user_id uuid references auth.users (id) on delete cascade,
  content jsonb not null,
  generated_at timestamptz not null default now(),
  unique (scan_id)
);

create index if not exists insights_scan_id_idx on public.insights (scan_id);
create index if not exists insights_user_id_idx on public.insights (user_id);

alter table public.insights enable row level security;

-- Same posture as scans/notify_subscriptions in 0001_init.sql: the FastAPI
-- backend uses the service-role key (bypasses RLS) for every read and
-- write, and authorization is enforced in application code
-- (see backend/app/routers/scans.py). This policy is defense-in-depth for
-- if anything ever queries Supabase's REST API directly with a user's own
-- access token.
create policy "Users read their own insights"
  on public.insights for select
  using (auth.uid() = user_id);

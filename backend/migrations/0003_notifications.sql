-- Breach-alert history (blueprint Phase 3). One row per new breach found
-- for a user since their last scan, written by the notifier's periodic
-- re-scan (see backend/app/services/notifier.py), never by the client.

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  scan_id uuid not null references public.scans (id) on delete cascade,
  breach_names text[] not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_idx on public.notifications (user_id);

alter table public.notifications enable row level security;

-- Same posture as scans/insights: the FastAPI backend uses the
-- service-role key (bypasses RLS) for every read and write, and
-- authorization is enforced in application code (see
-- backend/app/routers/notifications.py). This policy is defense-in-depth
-- for if anything ever queries Supabase's REST API directly with a
-- user's own access token.
create policy "Users read their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

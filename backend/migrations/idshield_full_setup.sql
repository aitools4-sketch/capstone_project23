-- One-shot setup for the idshield project, which already had its own
-- unrelated notifications/scan_records tables (both confirmed empty) and
-- an already-correct monitored_emails table from an earlier attempt.
-- Safe to run once, and safe to re-run if it fails partway through.

-- notifications collides by name with an incompatible existing table
-- (different columns entirely) — confirmed empty, so nothing real is lost.
drop table if exists public.notifications;

-- === 0001_init.sql ===
create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  email text not null,
  breaches jsonb not null default '[]'::jsonb,
  risk_score integer,
  created_at timestamptz not null default now()
);

create index if not exists scans_email_idx on public.scans (email) where user_id is null;
create index if not exists scans_user_id_idx on public.scans (user_id);

create table if not exists public.notify_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

create index if not exists notify_subscriptions_email_idx on public.notify_subscriptions (email) where user_id is null;
create index if not exists notify_subscriptions_user_id_idx on public.notify_subscriptions (user_id);

alter table public.scans enable row level security;
alter table public.notify_subscriptions enable row level security;

drop policy if exists "Users read their own scans" on public.scans;
create policy "Users read their own scans"
  on public.scans for select
  using (auth.uid() = user_id);

drop policy if exists "Users read their own notify subscriptions" on public.notify_subscriptions;
create policy "Users read their own notify subscriptions"
  on public.notify_subscriptions for select
  using (auth.uid() = user_id);

-- === 0002_insights.sql ===
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

drop policy if exists "Users read their own insights" on public.insights;
create policy "Users read their own insights"
  on public.insights for select
  using (auth.uid() = user_id);

-- === 0003_notifications.sql ===
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

drop policy if exists "Users read their own notifications" on public.notifications;
create policy "Users read their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

drop policy if exists "Users update their own notifications" on public.notifications;
create policy "Users update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- === 0004_notification_preferences.sql ===
create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email_alerts_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.notification_preferences enable row level security;

drop policy if exists "Users read their own notification preferences" on public.notification_preferences;
create policy "Users read their own notification preferences"
  on public.notification_preferences for select
  using (auth.uid() = user_id);

-- === 0005_monitored_emails.sql (table already exists here, this is safe either way) ===
create table if not exists public.monitored_emails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  email text not null,
  verification_token uuid,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, email)
);

create index if not exists monitored_emails_user_id_idx on public.monitored_emails (user_id);
create index if not exists monitored_emails_verified_idx on public.monitored_emails (email) where verified_at is not null;
create index if not exists monitored_emails_token_idx on public.monitored_emails (verification_token) where verification_token is not null;

alter table public.monitored_emails enable row level security;

drop policy if exists "Users read their own monitored emails" on public.monitored_emails;
create policy "Users read their own monitored emails"
  on public.monitored_emails for select
  using (auth.uid() = user_id);

-- Trigger + function (0001's original trigger, 0005's extended function body)
create or replace function public.handle_new_user_link_guest_data()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.scans
    set user_id = new.id
    where email = new.email and user_id is null;

  update public.notify_subscriptions
    set user_id = new.id
    where email = new.email and user_id is null;

  insert into public.monitored_emails (user_id, email, verified_at)
    values (new.id, new.email, now())
    on conflict (user_id, email) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_link_guest_data on auth.users;
create trigger on_auth_user_created_link_guest_data
  after insert on auth.users
  for each row execute function public.handle_new_user_link_guest_data();

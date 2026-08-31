-- Guest-capturable data (pre-auth scans and "Get Notified" signups) that
-- gets linked to a real account the moment its email verifies for the
-- first time. See handle_new_user_link_guest_data() below.

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

-- Defense in depth: today, the FastAPI backend uses the service role key
-- (which bypasses RLS) for every read and write, and authorization is
-- enforced in application code (see backend/app/auth.py). These policies
-- mean the data still stays private even if anything ever queries
-- Supabase's REST API directly with a user's own access token — no insert
-- or anonymous-select policy exists, so the default is deny.
create policy "Users read their own scans"
  on public.scans for select
  using (auth.uid() = user_id);

create policy "Users read their own notify subscriptions"
  on public.notify_subscriptions for select
  using (auth.uid() = user_id);

-- Fires exactly once per email: auth.users only gets a new row the first
-- time that email verifies a magic link. At that moment, claim any guest
-- rows sitting under the same email.
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

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_link_guest_data on auth.users;
create trigger on_auth_user_created_link_guest_data
  after insert on auth.users
  for each row execute function public.handle_new_user_link_guest_data();

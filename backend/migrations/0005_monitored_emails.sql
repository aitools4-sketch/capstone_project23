-- Multiple monitored emails per account. A row here means "the notifier
-- should watch this email" (see backend/app/services/notifier.py) — but
-- only once verified_at is set, so an account can't silently start
-- monitoring (and seeing the breach exposure of) an email it doesn't own.

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
-- The notifier scans every verified row by email; the verify endpoint
-- looks a row up by token before it has a user_id in hand — both need to
-- be fast without going through the primary key.
create index if not exists monitored_emails_verified_idx on public.monitored_emails (email) where verified_at is not null;
create index if not exists monitored_emails_token_idx on public.monitored_emails (verification_token) where verification_token is not null;

alter table public.monitored_emails enable row level security;

-- Same posture as every other table here: the FastAPI backend uses the
-- service-role key (bypasses RLS) for every read and write, and
-- authorization is enforced in application code. This policy is
-- defense-in-depth for if anything ever queries Supabase's REST API
-- directly with a user's own access token.
create policy "Users read their own monitored emails"
  on public.monitored_emails for select
  using (auth.uid() = user_id);

-- Extends 0001_init.sql's handle_new_user_link_guest_data(): the moment an
-- email verifies for the first time (i.e. an account is created), also
-- register its own email as a pre-verified monitored email. Owning your
-- login email is already proven by Supabase auth itself — it shouldn't
-- need a second confirmation loop the way a secondary email does (see
-- monitored_emails.py's add_monitored_email). create or replace (not a
-- fresh trigger) since 0001's version of this function is already live.
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

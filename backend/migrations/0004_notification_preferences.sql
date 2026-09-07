-- Per-user control over breach-alert emails (the re-scan itself, and the
-- in-app notifications feed it populates, stay on for everyone regardless
-- — this only gates whether notifier.py's send_breach_alert_email fires).

create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email_alerts_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.notification_preferences enable row level security;

-- Same posture as every other table here: the FastAPI backend uses the
-- service-role key (bypasses RLS) for every read and write, and
-- authorization is enforced in application code. This policy is
-- defense-in-depth for if anything ever queries Supabase's REST API
-- directly with a user's own access token.
create policy "Users read their own notification preferences"
  on public.notification_preferences for select
  using (auth.uid() = user_id);

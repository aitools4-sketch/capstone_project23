-- Feedback submitted from inside the dashboard (see
-- frontend/src/components/dashboard/FeedbackWidget.tsx). The best-rated
-- entries that include a comment are shown on the homepage's testimonials
-- section via the public GET /api/feedback/featured endpoint (see
-- backend/app/routers/feedback.py) — no user identity is ever exposed
-- through that endpoint, only the rating and comment text.

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create index if not exists feedback_user_id_idx on public.feedback (user_id);
-- The featured-testimonials query orders by rating then recency — index
-- that order directly rather than the primary key.
create index if not exists feedback_rating_created_idx on public.feedback (rating desc, created_at desc);

alter table public.feedback enable row level security;

-- Same posture as every other table here: the FastAPI backend uses the
-- service-role key (bypasses RLS) for every read and write, and
-- authorization is enforced in application code. This policy is
-- defense-in-depth for if anything ever queries Supabase's REST API
-- directly with a user's own access token.
create policy "Users read their own feedback"
  on public.feedback for select
  using (auth.uid() = user_id);

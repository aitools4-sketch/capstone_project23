# Breached API

Minimal FastAPI service that owns two things: server-side verification of
Supabase sessions, and persistence for the two pieces of guest data that get
linked to an account on first sign-in (scans, notify subscriptions).

## Setup

```bash
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
copy .env.example .env        # then fill in your Supabase project values
```

Required env vars (see `.env.example`):

- `SUPABASE_URL` — your project URL
- `SUPABASE_SERVICE_ROLE_KEY` — Settings → API → service_role key (or the newer `sb_secret_...` key). Server-only, never ship this to the browser.
- `ALLOWED_ORIGINS` — comma-separated origins allowed to call this API (defaults to the Vite dev server).

Optional — breach lookup:

- `DEHASHED_API_KEY` / `HIBP_API_KEY` — at least one enables live scanning. With
  neither set, `POST /api/scans` returns `503` with a clear message instead
  of failing silently or making up a result; the frontend falls back to a
  clearly-labeled sample so the rest of the app stays demoable.

No JWT secret needed: `app/auth.py` verifies access tokens against the
project's public signing keys at `{SUPABASE_URL}/auth/v1/.well-known/jwks.json`.

Run the migration in `migrations/0001_init.sql` against your Supabase project
(SQL Editor, or `supabase db push` if you adopt the CLI) before starting the
API.

Train the risk-scoring model once before the first run (its output,
`models/risk_model.joblib`, is committed, so this is only needed after
changing the feature engineering in `app/services/risk_scoring.py`):

```bash
.venv\Scripts\python.exe scripts\train_risk_model.py
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

## Endpoints

- `POST /api/scans` — public; runs a live DeHashed + HIBP lookup and scores it server-side (see `app/services/`), records the result. The request body is `{ "email": "..." }` only — never a client-supplied score or breach list, see the trust-boundary note in `app/routers/scans.py`.
- `POST /api/notify` — public, records a "Get Notified" signup
- `GET /api/scans/me` — protected; the pattern to copy for every other dashboard data endpoint (`Depends(get_current_user)`, then scope the query to `current_user.id`)
- `GET /health` — liveness check

## Architecture

`app/services/` holds the breach-lookup, risk-scoring, and masking logic as
plain modules the routers call into — this is Phase 1 of the backend
architecture blueprint (trust boundary fix + real scoring); insights,
reporting, and notifications are Phase 2/3, not yet built.
`scripts/train_risk_model.py` trains `app/services/risk_scoring.py`'s model
on synthetic data (there's no real labeled dataset yet); swap in real
historical data there once it exists.

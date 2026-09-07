from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    supabase_url: str
    supabase_service_role_key: str
    allowed_origins: str = "http://localhost:5173"

    # Optional — breach lookup is disabled (returns 503) until these are set.
    dehashed_api_key: str | None = None
    hibp_api_key: str | None = None

    # Optional — AI insights are disabled (returns 503) until this is set.
    anthropic_api_key: str | None = None

    # Optional — breach-alert emails are skipped (logged, not sent) until
    # this is set. Sandbox default only delivers to the Resend account's
    # own verified address until a domain is verified (see deploy checklist
    # Phase D); safe to leave as-is until then.
    resend_api_key: str | None = None
    resend_from_email: str = "Breached <onboarding@resend.dev>"

    # How often the background re-scan worker checks for new breaches.
    notifier_interval_hours: float = 24

    # Optional — error tracking is off until this is set (see main.py).
    sentry_dsn: str | None = None

    # Thresholds for the daily paid-API usage warning (see usage.py).
    daily_search_warning_threshold: int = 200
    daily_insight_warning_threshold: int = 100

    # Path to the trained risk-scoring model, relative to backend/.
    risk_model_path: str = "models/risk_model.joblib"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()

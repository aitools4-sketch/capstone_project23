from functools import lru_cache

from supabase import Client, create_client

from .config import get_settings


@lru_cache
def get_service_client() -> Client:
    """Server-only Supabase client using the service role key.

    This bypasses Row Level Security, so it must never be shipped to the
    browser. Every caller of this client is responsible for its own
    authorization (see app.auth.get_current_user) rather than relying on RLS.
    """
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_service_role_key)

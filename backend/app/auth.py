import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

from .config import get_settings

bearer_scheme = HTTPBearer(auto_error=False)

_jwks_client: jwt.PyJWKClient | None = None


def _get_jwks_client() -> jwt.PyJWKClient:
    """Lazily built, then cached for the process lifetime — PyJWKClient
    caches the fetched keys itself and re-fetches only if a token shows up
    signed by a key id it hasn't seen (e.g. after key rotation)."""
    global _jwks_client
    if _jwks_client is None:
        settings = get_settings()
        jwks_url = f"{settings.supabase_url}/auth/v1/.well-known/jwks.json"
        _jwks_client = jwt.PyJWKClient(jwks_url, cache_keys=True)
    return _jwks_client


class CurrentUser(BaseModel):
    id: str
    email: str | None = None


def _verify_token(token: str) -> CurrentUser:
    """Verifies a Supabase-issued access token server-side against the
    project's public signing keys (JWKS).

    This is the ONLY thing that should ever gate a protected route or API
    response — never a client-supplied flag (header, body field, cookie
    the client can set itself). We verify the token's signature against
    Supabase's own public key here rather than trusting whatever the
    client claims.
    """
    try:
        signing_key = _get_jwks_client().get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256", "RS256"],
            audience="authenticated",
        )
    except jwt.PyJWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired session")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid session token")

    return CurrentUser(id=user_id, email=payload.get("email"))


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> CurrentUser:
    """Use on any route that must be signed in. Missing token -> 401."""
    if credentials is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing bearer token")
    return _verify_token(credentials.credentials)


def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> CurrentUser | None:
    """Use on routes that serve both guests and signed-in users (e.g. a
    scan that may or may not have been claimed yet). No token -> None,
    treated as "guest" by the route. A token that's present but invalid or
    expired still 401s — an unrecognized token is never silently treated
    as "no token"."""
    if credentials is None:
        return None
    return _verify_token(credentials.credentials)

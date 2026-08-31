from fastapi import APIRouter, HTTPException

from ..services.hibp_catalog import CatalogBreach, get_all_breaches, get_breach

router = APIRouter(tags=["breach-catalog"])


@router.get("/breach-catalog")
def list_breach_catalog() -> list[CatalogBreach]:
    """Public — the full breach catalog HIBP publishes. No API key needed for
    this one, per HIBP's own docs; only per-email search is authenticated."""
    return get_all_breaches()


@router.get("/breach-catalog/{name}")
def get_breach_catalog_entry(name: str) -> CatalogBreach:
    breach = get_breach(name)
    if breach is None:
        raise HTTPException(status_code=404, detail=f"No breach named '{name}' in the catalog.")
    return breach

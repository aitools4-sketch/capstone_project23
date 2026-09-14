import logging
from contextlib import asynccontextmanager

import sentry_sdk
from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded

from .config import get_settings
from .db import get_service_client
from .rate_limit import limiter
from .routers import account, breach_catalog, feedback, notifications, notify, reports, scans
from .services.notifier import check_for_new_breaches
from .services.report_pdf import shutdown_browser
from .services.risk_scoring import get_risk_scorer

logger = logging.getLogger(__name__)
settings = get_settings()
scheduler = BackgroundScheduler()

# Off by default — nothing is sent anywhere until a real Sentry project's
# DSN is set. Uncaught exceptions on any request, and any error raised
# inside a scheduled notifier run, both get captured once it is.
if settings.sentry_dsn:
    sentry_sdk.init(dsn=settings.sentry_dsn, send_default_pii=False)


def _run_notifier() -> None:
    try:
        notified = check_for_new_breaches(settings)
        logger.info("notifier: run complete, %d user(s) notified", notified)
    except Exception:
        # A bad run should never crash the scheduler thread — it just
        # tries again on the next scheduled interval. Still worth knowing
        # about, since this is background work with no request to fail loudly.
        logger.exception("notifier: run failed")
        if settings.sentry_dsn:
            sentry_sdk.capture_exception()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pay the joblib-load and DB-connection warmup cost once, here, instead
    # of on whichever user's request happens to be first — measured at
    # ~1.5s combined, which is a bad first impression on a random request.
    get_risk_scorer(settings.risk_model_path)
    get_service_client()

    # No immediate run on startup: this fires on every dev-server reload,
    # and each run spends real DeHashed/HIBP/Resend calls. First run is
    # one interval from now; see NOTIFIER_INTERVAL_HOURS.
    scheduler.add_job(_run_notifier, "interval", hours=settings.notifier_interval_hours, id="breach_rescan")
    scheduler.start()
    yield
    scheduler.shutdown(wait=False)
    shutdown_browser()


app = FastAPI(title="Breached API", lifespan=lifespan)
app.state.limiter = limiter

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    # Cooldown message only — never leak the limiter's internal state or a
    # stack trace to the client.
    return JSONResponse(status_code=429, content={"detail": "Too many requests. Try again in a moment."})


app.include_router(scans.router, prefix="/api")
app.include_router(notify.router, prefix="/api")
app.include_router(breach_catalog.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(account.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(feedback.router, prefix="/api")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

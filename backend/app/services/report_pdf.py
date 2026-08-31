"""Renders a scan into a downloadable PDF report.

Uses Playwright (a real Chromium, not a pure-Python HTML-to-PDF library)
because the report template uses modern CSS (flexbox) that libraries like
WeasyPrint or xhtml2pdf render inconsistently, and because Playwright was
already verified working in this environment. The tradeoff: production
hosting needs `playwright install --with-deps chromium` in its build step,
since minimal containers don't ship a browser.

The browser itself is launched once and reused across requests, not
relaunched per request — a cold Chromium launch measured at ~1-1.5s of the
~2s a PDF request used to take, and PDF downloads are frequent enough
(same trigger as a scan's results page) that repaying that cost on every
single one was the actual lag, not the render itself. The tradeoff moves
the other way: a Chromium process now sits resident in memory for the
life of the server. On a memory-constrained host that's a real cost to
watch (see the deploy checklist's noted risk for Phase E) — if it becomes
a problem there, reverting to launch-per-request is a small, isolated
change back to what this function looked like before.

Playwright's sync API is bound to the exact OS thread that started it —
using it from any other thread fails with "greenlet.error: Cannot switch
to a different thread" (confirmed directly: a plain threading.Lock around
shared browser access did NOT prevent this, since the problem isn't
concurrent access, it's ANY access from a thread other than the one that
launched it). FastAPI runs sync route handlers across a thread pool, so
every Playwright call here is routed through a single dedicated worker
thread instead, which also serializes access as a side effect.
"""

from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

from jinja2 import Environment, FileSystemLoader
from playwright.sync_api import Browser, sync_playwright

from .breach_lookup import BreachRecord
from .insights import InsightContent
from .risk_scoring import RiskResult

_TEMPLATE_DIR = Path(__file__).resolve().parent.parent / "templates"
_env = Environment(loader=FileSystemLoader(_TEMPLATE_DIR), autoescape=True)

_executor = ThreadPoolExecutor(max_workers=1)
_playwright = None
_browser: Browser | None = None


def _get_browser() -> Browser:
    global _playwright, _browser
    if _browser is None:
        _playwright = sync_playwright().start()
        _browser = _playwright.chromium.launch()
    return _browser


def _render_html_to_pdf(html: str) -> bytes:
    """Must only ever run inside _executor's single worker thread — see
    the module docstring for why."""
    page = _get_browser().new_page()
    try:
        page.set_content(html, wait_until="load")
        return page.pdf(format="A4", print_background=True)
    finally:
        page.close()


def _shutdown() -> None:
    global _playwright, _browser
    if _browser is not None:
        _browser.close()
        _browser = None
    if _playwright is not None:
        _playwright.stop()
        _playwright = None


def shutdown_browser() -> None:
    """Called from main.py's lifespan on app shutdown. A no-op if a PDF
    was never requested, since the browser is only launched lazily."""
    _executor.submit(_shutdown).result()
    _executor.shutdown(wait=True)


def render_report_pdf(
    email: str,
    scan_created_at: str,
    breaches: list[BreachRecord],
    risk: RiskResult,
    insight: InsightContent | None,
) -> bytes:
    template = _env.get_template("report.html")
    scan_date = datetime.fromisoformat(scan_created_at.replace("Z", "+00:00")).strftime("%B %d, %Y")
    generated_at = datetime.now(timezone.utc).strftime("%B %d, %Y")

    html = template.render(
        email=email,
        scan_date=scan_date,
        generated_at=generated_at,
        breaches=[b.model_dump() for b in breaches],
        risk=risk.model_dump(),
        insight=insight.model_dump() if insight else None,
    )

    return _executor.submit(_render_html_to_pdf, html).result()

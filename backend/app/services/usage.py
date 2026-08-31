"""Lightweight in-process usage tracking for paid external APIs (DeHashed/
HIBP search, Anthropic insight generation). Not a metrics service — just
enough to log a warning if daily volume looks like abuse rather than
normal traffic, since nothing else watches these quotas.

Counts reset when the process restarts; accepted for a single-instance
deployment, not something worth a database table over.
"""

import logging
import threading
from collections import defaultdict
from datetime import date

logger = logging.getLogger(__name__)

_lock = threading.Lock()
_counts: dict[tuple[str, date], int] = defaultdict(int)


def record_call(category: str, threshold: int) -> None:
    today = date.today()
    with _lock:
        _counts[(category, today)] += 1
        count = _counts[(category, today)]

    if count == threshold:
        logger.warning("usage: %s calls today (%d) crossed the alert threshold (%d)", category, count, threshold)

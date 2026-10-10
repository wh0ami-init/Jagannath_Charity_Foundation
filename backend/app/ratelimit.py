"""Small in-memory sliding-window rate limiter for login and public forms.

State lives in this process only. That is fine for a single API instance
(the default Railway setup). If you run several instances or workers, limits
apply per instance, so also enable a limiter at the proxy/WAF level.
"""

import math
import threading
import time
from collections import deque

from fastapi import HTTPException, Request, status

from app.config import settings


class SlidingWindowLimiter:
    def __init__(self, limit: int, window_seconds: int, max_keys: int = 50_000):
        self.limit = limit
        self.window = window_seconds
        self.max_keys = max_keys
        self._hits: dict[str, deque[float]] = {}
        self._lock = threading.Lock()

    def _live(self, key: str, now: float) -> deque[float] | None:
        q = self._hits.get(key)
        if q is None:
            return None
        cutoff = now - self.window
        while q and q[0] <= cutoff:
            q.popleft()
        if not q:
            del self._hits[key]
            return None
        return q

    def _wait(self, q: deque[float] | None, now: float) -> int:
        if q is not None and len(q) >= self.limit:
            return max(1, math.ceil(q[0] + self.window - now))
        return 0

    def _record(self, key: str, now: float) -> None:
        if key not in self._hits and len(self._hits) >= self.max_keys:
            for k in list(self._hits):  # drop expired keys first
                self._live(k, now)
            while len(self._hits) >= self.max_keys:  # still full: drop oldest key
                self._hits.pop(next(iter(self._hits)))
        self._hits.setdefault(key, deque()).append(now)

    def retry_after(self, key: str) -> int:
        """Seconds to wait if the key is over its limit, else 0. Records nothing."""
        with self._lock:
            now = time.monotonic()
            return self._wait(self._live(key, now), now)

    def check_and_hit(self, key: str) -> int:
        """Record one hit unless over the limit. Returns seconds to wait, or 0."""
        with self._lock:
            now = time.monotonic()
            wait = self._wait(self._live(key, now), now)
            if wait:
                return wait
            self._record(key, now)
            return 0

    def hit(self, key: str) -> None:
        with self._lock:
            self._record(key, time.monotonic())

    def reset(self, key: str) -> None:
        with self._lock:
            self._hits.pop(key, None)


# Every login attempt from one IP (bcrypt is CPU-heavy, so this also limits abuse of the CPU).
login_ip_limiter = SlidingWindowLimiter(settings.login_ip_limit, settings.login_window_seconds)
# Failed passwords per username, across all IPs (stops distributed guessing).
login_user_limiter = SlidingWindowLimiter(settings.login_user_failure_limit, settings.login_window_seconds)
# Public form submissions per IP.
form_ip_limiter = SlidingWindowLimiter(settings.form_ip_limit, settings.form_window_seconds)
# Payment order creation calls an external provider and writes a donation row.
# Limit it separately from forms so a public page cannot fill the database or
# consume provider resources with an unbounded burst of test orders.
payment_order_ip_limiter = SlidingWindowLimiter(limit=10, window_seconds=900)


def client_ip(request: Request) -> str:
    """Real client IP. Behind N trusted proxies, the client is the Nth entry from the
    right of X-Forwarded-For (earlier entries can be forged by the client)."""
    n = settings.trusted_proxies
    if n > 0:
        parts = [p.strip() for p in request.headers.get("x-forwarded-for", "").split(",") if p.strip()]
        if len(parts) >= n:
            return parts[-n]
    return request.client.host if request.client else "unknown"


def too_many_requests(wait_seconds: int, what: str) -> HTTPException:
    minutes = max(1, math.ceil(wait_seconds / 60))
    unit = "minute" if minutes == 1 else "minutes"
    return HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail=f"Too many {what}. Please try again in about {minutes} {unit}.",
        headers={"Retry-After": str(wait_seconds)},
    )


def limit_form_submissions(request: Request) -> None:
    """FastAPI dependency for public form endpoints."""
    wait = form_ip_limiter.check_and_hit(client_ip(request))
    if wait:
        raise too_many_requests(wait, "submissions")


def limit_payment_orders(request: Request) -> None:
    wait = payment_order_ip_limiter.check_and_hit(client_ip(request))
    if wait:
        raise too_many_requests(wait, "payment order requests")

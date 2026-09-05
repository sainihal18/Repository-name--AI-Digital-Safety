"""
Security middleware: CORS, rate limiting, security headers.

CORS origins are environment-driven — production must NEVER use "*".
Rate limiting here is a minimal in-memory sliding-window implementation
suitable for a single-process MVP; swap for Redis-backed limiting before
running multiple workers in production.
"""
from __future__ import annotations

import os
import time
from collections import defaultdict, deque
from typing import Callable, Deque, Dict

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
MAX_REQUEST_SIZE_BYTES = int(os.getenv("MAX_REQUEST_SIZE_BYTES", "20000"))


def get_cors_allowed_origins() -> list:
    env = os.getenv("CORS_ALLOWED_ORIGINS", "")
    if env:
        return [origin.strip() for origin in env.split(",") if origin.strip()]
    if os.getenv("APP_ENV", "development") == "production":
        # Fail closed in production if nothing is configured — never "*".
        return []
    return ["http://localhost:5173", "http://localhost:3000"]


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, requests_per_minute: int = RATE_LIMIT_PER_MINUTE):
        super().__init__(app)
        self.limit = requests_per_minute
        self._hits: Dict[str, Deque[float]] = defaultdict(deque)

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        client_id = request.client.host if request.client else "unknown"
        now = time.time()
        window = self._hits[client_id]
        while window and now - window[0] > 60:
            window.popleft()
        if len(window) >= self.limit:
            return JSONResponse(
                status_code=429,
                content={"error": "Rate limit exceeded. Please slow down."},
            )
        window.append(now)
        return await call_next(request)


class RequestSizeLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_bytes: int = MAX_REQUEST_SIZE_BYTES):
        super().__init__(app)
        self.max_bytes = max_bytes

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > self.max_bytes:
            return JSONResponse(
                status_code=413,
                content={"error": f"Request body exceeds {self.max_bytes} byte limit."},
            )
        return await call_next(request)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["X-Permitted-Cross-Domain-Policies"] = "none"
        return response

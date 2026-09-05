"""
FastAPI application entry point.

Run with:
    uvicorn backend.main:app --reload

Swagger UI: http://127.0.0.1:8000/docs
"""
from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.v1.endpoints import health
from backend.api.v1.router import api_router
from backend.database.session import init_db
from backend.logging_config.logger import configure_logging, log_event
from backend.security.middleware import (
    RateLimitMiddleware,
    RequestSizeLimitMiddleware,
    SecurityHeadersMiddleware,
    get_cors_allowed_origins,
)

logger = configure_logging(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup (and future shutdown) events.

    Using the modern lifespan handler instead of the deprecated
    @app.on_event("startup") decorator (FastAPI >= 0.93).
    """
    # --- Startup ---
    init_db()
    log_event(logger, "startup", environment=os.getenv("APP_ENV", "development"))
    yield
    # --- Shutdown (add cleanup here when needed) ---


app = FastAPI(
    title="AI Digital Safety",
    description=(
        "Analyze Before You Trust. — Defensive AI-powered SMS + URL scam detection API. "
        "Phase 2: full explainability, Scam DNA, attack chain, and structured security reports."
    ),
    version="2.0.0-phase2",
    lifespan=lifespan,
)

# --- Middleware (order matters: outermost registered = outermost applied) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_allowed_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestSizeLimitMiddleware)
app.add_middleware(RateLimitMiddleware)

# --- Routers ---
app.include_router(health.router)   # "/" and "/health", unprefixed
app.include_router(api_router)      # everything under /api/v1


@app.exception_handler(Exception)
async def unhandled_exception_handler(request, exc):
    # Never leak internal tracebacks to the client — log them, return a
    # generic, human-readable message instead.
    from fastapi.responses import JSONResponse
    logger.error("Unhandled exception on %s: %s", request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "An internal error occurred. This has been logged for review."},
    )

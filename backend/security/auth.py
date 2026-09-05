"""
Authentication scaffold (future-ready, not enforced in Phase 1).

Phase 1 ships with no auth requirement since it's a defensive analysis
API with no user accounts yet. This module defines the interface so
API-key or JWT auth can be added later without changing endpoint
signatures — endpoints already accept an optional dependency here.
"""
from __future__ import annotations

import os
from typing import Optional

from fastapi import Header, HTTPException


def auth_enabled() -> bool:
    return os.getenv("AUTH_ENABLED", "false").lower() == "true"


async def optional_api_key(x_api_key: Optional[str] = Header(default=None)) -> Optional[str]:
    """Dependency that only enforces an API key if AUTH_ENABLED=true.
    Wire this into api/v1/router.py's `dependencies=[...]` once real
    auth is needed."""
    if not auth_enabled():
        return None
    expected = os.getenv("API_KEY", "")
    if not expected or x_api_key != expected:
        raise HTTPException(status_code=401, detail="Invalid or missing API key.")
    return x_api_key

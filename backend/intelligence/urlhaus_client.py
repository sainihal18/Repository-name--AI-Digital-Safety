"""
URLhaus threat intelligence client.

Reads URLHAUS_ENABLED from environment (never hard-codes API access).
Any network/timeout/HTTP error results in query_status=UNAVAILABLE, never
a silent crash and never an implicit "safe" result.
"""
from __future__ import annotations

import os
from datetime import datetime, timezone

import requests

from backend.models.enums import ThreatIntelStatus
from backend.models.schemas import ThreatIntelResult

_ENDPOINT = "https://urlhaus-api.abuse.ch/v1/url/"
_TIMEOUT_SECONDS = 4


def query_urlhaus(url: str) -> ThreatIntelResult:
    if os.getenv("URLHAUS_ENABLED", "false").lower() != "true":
        return ThreatIntelResult(source="URLhaus", query_status=ThreatIntelStatus.DISABLED)

    try:
        response = requests.post(_ENDPOINT, data={"url": url}, timeout=_TIMEOUT_SECONDS)
        response.raise_for_status()
        payload = response.json()
        if payload.get("query_status") == "ok":
            return ThreatIntelResult(
                source="URLhaus",
                query_status=ThreatIntelStatus.OK,
                known_malicious=True,
                threat_type=payload.get("threat", "malware"),
                reputation="malicious",
                timestamp=datetime.now(timezone.utc).isoformat(),
            )
        return ThreatIntelResult(
            source="URLhaus",
            query_status=ThreatIntelStatus.OK,
            known_malicious=False,
            reputation="not_listed",
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
    except requests.RequestException as exc:
        return ThreatIntelResult(
            source="URLhaus",
            query_status=ThreatIntelStatus.UNAVAILABLE,
            error_status=str(exc)[:200],
        )

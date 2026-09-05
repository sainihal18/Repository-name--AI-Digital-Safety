"""
PhishTank threat intelligence client.

Reads PHISHTANK_ENABLED (and optionally PHISHTANK_API_KEY) from
environment. Same graceful-degradation contract as the other clients:
never raises, never implies "safe" just because a query failed.
"""
from __future__ import annotations

import os
from datetime import datetime, timezone

import requests

from backend.models.enums import ThreatIntelStatus
from backend.models.schemas import ThreatIntelResult

_ENDPOINT = "https://checkurl.phishtank.com/checkurl/"
_TIMEOUT_SECONDS = 4


def query_phishtank(url: str) -> ThreatIntelResult:
    if os.getenv("PHISHTANK_ENABLED", "false").lower() != "true":
        return ThreatIntelResult(source="PhishTank", query_status=ThreatIntelStatus.DISABLED)

    api_key = os.getenv("PHISHTANK_API_KEY", "").strip()
    data = {"url": url, "format": "json"}
    if api_key:
        data["app_key"] = api_key

    try:
        response = requests.post(_ENDPOINT, data=data, timeout=_TIMEOUT_SECONDS)
        response.raise_for_status()
        payload = response.json()
        results = payload.get("results", {})
        if results.get("in_database") and results.get("valid"):
            return ThreatIntelResult(
                source="PhishTank",
                query_status=ThreatIntelStatus.OK,
                known_malicious=True,
                threat_type="phishing",
                reputation="malicious",
                timestamp=datetime.now(timezone.utc).isoformat(),
            )
        return ThreatIntelResult(
            source="PhishTank",
            query_status=ThreatIntelStatus.OK,
            known_malicious=False,
            reputation="not_listed",
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
    except requests.RequestException as exc:
        return ThreatIntelResult(
            source="PhishTank",
            query_status=ThreatIntelStatus.UNAVAILABLE,
            error_status=str(exc)[:200],
        )

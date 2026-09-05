"""
Google Safe Browsing threat intelligence client.

Reads GOOGLE_SAFE_BROWSING_API_KEY from environment. Never hard-coded.
If the key is missing/blank, the source is treated as DISABLED, not as
an error — this is a normal, expected configuration state.
"""
from __future__ import annotations

import os
from datetime import datetime, timezone

import requests

from backend.models.enums import ThreatIntelStatus
from backend.models.schemas import ThreatIntelResult

_ENDPOINT = "https://safebrowsing.googleapis.com/v4/threatMatches:find"
_TIMEOUT_SECONDS = 4


def query_safe_browsing(url: str) -> ThreatIntelResult:
    api_key = os.getenv("GOOGLE_SAFE_BROWSING_API_KEY", "").strip()
    if not api_key:
        return ThreatIntelResult(source="GoogleSafeBrowsing", query_status=ThreatIntelStatus.DISABLED)

    body = {
        "client": {"clientId": "ai-digital-safety", "clientVersion": "1.0"},
        "threatInfo": {
            "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": url}],
        },
    }
    try:
        response = requests.post(
            _ENDPOINT, params={"key": api_key}, json=body, timeout=_TIMEOUT_SECONDS
        )
        response.raise_for_status()
        payload = response.json()
        matches = payload.get("matches", [])
        if matches:
            return ThreatIntelResult(
                source="GoogleSafeBrowsing",
                query_status=ThreatIntelStatus.OK,
                known_malicious=True,
                threat_type=matches[0].get("threatType", "unknown"),
                reputation="malicious",
                timestamp=datetime.now(timezone.utc).isoformat(),
            )
        return ThreatIntelResult(
            source="GoogleSafeBrowsing",
            query_status=ThreatIntelStatus.OK,
            known_malicious=False,
            reputation="not_listed",
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
    except requests.RequestException as exc:
        return ThreatIntelResult(
            source="GoogleSafeBrowsing",
            query_status=ThreatIntelStatus.UNAVAILABLE,
            error_status=str(exc)[:200],
        )

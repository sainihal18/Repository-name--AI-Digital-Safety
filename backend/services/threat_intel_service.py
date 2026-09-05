"""
Threat intelligence status service — powers GET /api/v1/threat-intelligence/status.
"""
from __future__ import annotations

import os

from backend.models.enums import ThreatIntelStatus
from backend.models.schemas import ThreatIntelResult, ThreatIntelStatusResponse


def get_status() -> ThreatIntelStatusResponse:
    sources = []
    sources.append(ThreatIntelResult(
        source="URLhaus",
        query_status=ThreatIntelStatus.OK if os.getenv("URLHAUS_ENABLED", "false").lower() == "true" else ThreatIntelStatus.DISABLED,
    ))
    sources.append(ThreatIntelResult(
        source="GoogleSafeBrowsing",
        query_status=ThreatIntelStatus.OK if os.getenv("GOOGLE_SAFE_BROWSING_API_KEY", "").strip() else ThreatIntelStatus.DISABLED,
    ))
    sources.append(ThreatIntelResult(
        source="PhishTank",
        query_status=ThreatIntelStatus.OK if os.getenv("PHISHTANK_ENABLED", "false").lower() == "true" else ThreatIntelStatus.DISABLED,
    ))
    return ThreatIntelStatusResponse(sources=sources)

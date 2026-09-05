"""
Aggregates all threat-intel sources for a single URL query.

Important: absence from every database is NEVER treated as confirmation
of safety. `overall_available` and `overall_known_malicious` are computed
conservatively — malicious if ANY source confirms it, "available" only if
at least one source actually returned a real (non-disabled, non-error)
result.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional

from backend.intelligence.phishtank_client import query_phishtank
from backend.intelligence.safe_browsing_client import query_safe_browsing
from backend.intelligence.urlhaus_client import query_urlhaus
from backend.models.enums import ThreatIntelStatus
from backend.models.schemas import ThreatIntelResult


@dataclass
class AggregatedThreatIntel:
    results: List[ThreatIntelResult]
    overall_available: bool
    overall_known_malicious: Optional[bool]


def query_all_sources(url: str) -> AggregatedThreatIntel:
    results = [query_urlhaus(url), query_safe_browsing(url), query_phishtank(url)]

    live_results = [r for r in results if r.query_status == ThreatIntelStatus.OK]
    overall_available = len(live_results) > 0
    overall_known_malicious: Optional[bool] = None
    if overall_available:
        overall_known_malicious = any(r.known_malicious for r in live_results)

    return AggregatedThreatIntel(
        results=results,
        overall_available=overall_available,
        overall_known_malicious=overall_known_malicious,
    )

"""
Rule engine facade.

Wraps sms_rules / url_rules, converts fired checks into Evidence items,
and computes a single 0-100 "rule_score" that the risk engine consumes
as one of its three weighted inputs (see backend/risk/risk_engine.py).
"""
from __future__ import annotations

from typing import Dict, List, Tuple

from backend.rules.sms_rules import run_sms_rules
from backend.rules.url_rules import run_url_rules


def _aggregate(results: List[Dict]) -> Tuple[List[Dict], int, List[str]]:
    fired = [r for r in results if r["fired"]]
    evidence = [
        {"type": r["type"], "severity": r["severity"], "description": r["description"]}
        for r in fired
        if r["description"]
    ]
    suspicious_terms = sorted({term for r in fired for term in r.get("matched_terms", [])})

    if not fired:
        return evidence, 0, suspicious_terms

    # Rule score: average strength of fired rules, nudged up slightly for
    # each additional distinct rule that fired (compounding evidence is
    # more convincing than one rule firing strongly in isolation).
    avg_strength = sum(r["strength"] for r in fired) / len(fired)
    compounding_bonus = min(20, (len(fired) - 1) * 4)
    rule_score = min(100, int(avg_strength + compounding_bonus))
    return evidence, rule_score, suspicious_terms


def evaluate_sms(text: str) -> Dict:
    results = run_sms_rules(text)
    evidence, rule_score, suspicious_terms = _aggregate(results)
    return {
        "raw_results": results,
        "evidence": evidence,
        "rule_score": rule_score,
        "suspicious_terms": suspicious_terms,
        "fired_count": len([r for r in results if r["fired"]]),
    }


def evaluate_url(url: str) -> Dict:
    results = run_url_rules(url)
    evidence, rule_score, suspicious_terms = _aggregate(results)
    return {
        "raw_results": results,
        "evidence": evidence,
        "rule_score": rule_score,
        "suspicious_terms": suspicious_terms,
        "fired_count": len([r for r in results if r["fired"]]),
    }

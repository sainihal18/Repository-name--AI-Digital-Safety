"""
SMS rule engine.

Each `check_*` function returns a dict describing whether it fired, its
severity, a human-readable description (used directly in the evidence
list), and a numeric strength (0-100) that feeds Scam DNA. No random
numbers anywhere — strength is a deterministic function of how many
matching terms/patterns were found.
"""
from __future__ import annotations

from typing import Dict, List

from backend.rules import patterns as p


def _count_hits(text: str, terms: List[str]) -> List[str]:
    lower = text.lower()
    return [t for t in terms if t in lower]


def _strength_from_hits(hit_count: int, cap: int = 4) -> int:
    """Deterministic 0-100 scaling: more distinct matches -> higher score,
    capped so a single message can't blow past 100 from repetition alone."""
    if hit_count <= 0:
        return 0
    return min(100, int(30 + (hit_count / cap) * 70))


def check_urgency(text: str) -> Dict:
    hits = _count_hits(text, p.URGENCY_TERMS)
    fired = len(hits) > 0
    return {
        "type": "urgency",
        "fired": fired,
        "severity": "HIGH" if len(hits) >= 2 else "MEDIUM",
        "description": "Message creates time pressure to force a fast, unconsidered decision.",
        "matched_terms": hits,
        "strength": _strength_from_hits(len(hits)),
    }


def check_fear_intimidation(text: str) -> Dict:
    hits = _count_hits(text, p.FEAR_INTIMIDATION_TERMS)
    return {
        "type": "fear_intimidation",
        "fired": len(hits) > 0,
        "severity": "HIGH" if len(hits) >= 2 else "MEDIUM",
        "description": "Message uses threatening language (suspension, legal action, penalties).",
        "matched_terms": hits,
        "strength": _strength_from_hits(len(hits)),
    }


def check_financial_pressure(text: str) -> Dict:
    hits = _count_hits(text, p.FINANCIAL_PRESSURE_TERMS)
    currency_hits = p.CURRENCY_REGEX.findall(text)
    fired = len(hits) > 0 or len(currency_hits) > 0
    return {
        "type": "financial_pressure",
        "fired": fired,
        "severity": "HIGH" if len(hits) >= 2 else "MEDIUM",
        "description": "Message pressures the recipient about money, fees, or payment.",
        "matched_terms": hits,
        "strength": _strength_from_hits(len(hits) + (1 if currency_hits else 0)),
    }


def check_credential_request(text: str) -> Dict:
    hits = _count_hits(text, p.CREDENTIAL_REQUEST_TERMS)
    return {
        "type": "credential_request",
        "fired": len(hits) > 0,
        "severity": "HIGH",  # credential harvesting is always treated as high severity
        "description": "Message asks the recipient to verify, confirm, or enter credentials.",
        "matched_terms": hits,
        "strength": _strength_from_hits(len(hits)),
    }


def check_otp_targeting(text: str) -> Dict:
    otp_mention = bool(p.OTP_REGEX.search(text))
    return {
        "type": "otp_targeting",
        "fired": otp_mention,
        "severity": "HIGH",
        "description": "Message references an OTP / one-time password / verification code.",
        "matched_terms": ["otp"] if otp_mention else [],
        "strength": 90 if otp_mention else 0,
    }


def check_reward_manipulation(text: str) -> Dict:
    hits = _count_hits(text, p.REWARD_TERMS)
    return {
        "type": "reward_manipulation",
        "fired": len(hits) > 0,
        "severity": "MEDIUM",
        "description": "Message dangles a prize, reward, or unexpected windfall.",
        "matched_terms": hits,
        "strength": _strength_from_hits(len(hits)),
    }


def check_impersonation(text: str) -> Dict:
    hits = _count_hits(text, p.IMPERSONATION_TERMS)
    return {
        "type": "impersonation",
        "fired": len(hits) > 0,
        "severity": "MEDIUM",
        "description": "Message references a well-known institution or brand, a common impersonation tactic.",
        "matched_terms": hits,
        "strength": _strength_from_hits(len(hits)),
    }


def check_kyc_banking(text: str) -> Dict:
    hits = _count_hits(text, p.KYC_BANKING_TERMS)
    return {
        "type": "kyc_banking",
        "fired": len(hits) > 0,
        "severity": "HIGH" if len(hits) >= 2 else "MEDIUM",
        "description": "Message references banking/KYC details, a common phishing target.",
        "matched_terms": hits,
        "strength": _strength_from_hits(len(hits)),
    }


def check_threat_punishment(text: str) -> Dict:
    hits = _count_hits(text, p.THREAT_PUNISHMENT_TERMS)
    return {
        "type": "threat_punishment",
        "fired": len(hits) > 0,
        "severity": "HIGH",
        "description": "Message threatens a consequence (closure, blacklisting, legal case) if no action is taken.",
        "matched_terms": hits,
        "strength": _strength_from_hits(len(hits)),
    }


def check_external_link(text: str) -> Dict:
    urls = [u for group in p.URL_REGEX.findall(text) for u in group if u]
    return {
        "type": "external_link_usage",
        "fired": len(urls) > 0,
        "severity": "MEDIUM",
        "description": "Message contains a link the recipient is urged to click.",
        "matched_terms": urls,
        "strength": 70 if urls else 0,
    }


ALL_CHECKS = [
    check_urgency,
    check_fear_intimidation,
    check_financial_pressure,
    check_credential_request,
    check_otp_targeting,
    check_reward_manipulation,
    check_impersonation,
    check_kyc_banking,
    check_threat_punishment,
    check_external_link,
]


def run_sms_rules(text: str) -> List[Dict]:
    """Run every SMS rule and return only the results (fired or not) so the
    caller can decide what becomes evidence vs. what feeds Scam DNA only."""
    return [check(text) for check in ALL_CHECKS]


def extract_entities(text: str) -> Dict:
    """Structural entity extraction: URLs, phone numbers, currency amounts."""
    urls = [u for group in p.URL_REGEX.findall(text) for u in group if u]
    phones = [m.group(0).strip() for m in p.PHONE_REGEX.finditer(text) if len(m.group(0).strip()) >= 7]
    currency = [m.group(0) for m in p.CURRENCY_REGEX.finditer(text)]
    return {
        "urls": list(dict.fromkeys(urls)),
        "phone_numbers": list(dict.fromkeys(phones)),
        "currency_mentions": list(dict.fromkeys(currency)),
    }

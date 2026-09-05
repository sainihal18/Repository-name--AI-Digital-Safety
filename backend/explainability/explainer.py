"""
Turns evidence + Scam DNA + category into plain-language recommendations.

No fake/invented explanations: every recommendation here is templated
directly off evidence types that actually fired, never generated freely.
"""
from __future__ import annotations

from typing import Dict, List

from backend.models.enums import ScamCategory
from backend.models.schemas import Evidence

_RECOMMENDATION_MAP: Dict[str, List[str]] = {
    "credential_request": ["Do not enter your password, PIN, or OTP anywhere linked from this message."],
    "otp_targeting": ["Never share an OTP with anyone, including someone claiming to be your bank."],
    "kyc_banking": ["Contact your bank directly using the number on your card or official app — not any number or link in this message."],
    "external_link_usage": ["Do not click the link. Type the organization's known website address manually if you need to check something."],
    "brand_impersonation": ["Check the domain spelling carefully — this closely resembles a known brand but is not an exact match."],
    "urgency": ["Treat any message pressuring you to act immediately as a red flag — legitimate organizations rarely demand instant action."],
    "fear_intimidation": ["Do not panic-respond. Verify independently before taking any action."],
    "reward_manipulation": ["Unexpected prizes or rewards you didn't enter for are a classic scam pattern."],
    "risky_download_extension": ["Do not download or open the file this URL points to."],
    "ip_address_host": ["Be cautious of links that use a raw IP address instead of a normal domain name."],
}

_GENERIC_LOW_RISK = ["No strong scam indicators were found, but always stay cautious with unexpected messages or links."]
_GENERIC_UNKNOWN = ["Evidence is insufficient for a confident verdict. When in doubt, verify independently through an official channel before acting."]


def build_recommendations(evidence: List[Evidence]) -> List[str]:
    recs: List[str] = []
    seen = set()
    for item in evidence:
        for rec in _RECOMMENDATION_MAP.get(item.type, []):
            if rec not in seen:
                recs.append(rec)
                seen.add(rec)
    if not recs:
        recs = _GENERIC_LOW_RISK
    recs.append("Verify through an official channel — never one provided by the message/URL itself.")
    return recs


def classify_category(fired_types: List[str]) -> ScamCategory:
    """Deterministic category classification off which rule types fired.
    Priority order matters: more specific categories are checked first."""
    types = set(fired_types)
    if "otp_targeting" in types or "credential_request" in types:
        return ScamCategory.OTP_CREDENTIAL_PHISHING
    if "kyc_banking" in types or "brand_impersonation" in types:
        return ScamCategory.BANKING_KYC_PHISHING
    if "reward_manipulation" in types:
        return ScamCategory.PRIZE_REWARD_SCAM
    if "threat_punishment" in types or "fear_intimidation" in types:
        return ScamCategory.ACCOUNT_SUSPENSION_SCAM
    if "impersonation" in types:
        return ScamCategory.IMPERSONATION
    if "financial_pressure" in types:
        return ScamCategory.PAYMENT_SCAM
    if types:
        return ScamCategory.GENERAL_SPAM
    return ScamCategory.UNKNOWN


def build_why_flagged(evidence: List[Evidence]) -> List[str]:
    """Short checklist strings for the 'WHY WAS THIS FLAGGED?' UI section."""
    label_map = {
        "urgency": "Urgency", "fear_intimidation": "Fear/intimidation",
        "financial_pressure": "Financial pressure", "credential_request": "Credential request",
        "otp_targeting": "OTP targeting", "reward_manipulation": "Reward manipulation",
        "impersonation": "Impersonation", "kyc_banking": "KYC/banking reference",
        "threat_punishment": "Threat of punishment", "external_link_usage": "Suspicious link",
        "brand_impersonation": "Brand impersonation", "suspicious_keywords": "Suspicious URL keywords",
        "ip_address_host": "Raw IP address host", "at_symbol_obfuscation": "URL obfuscation",
        "no_https": "No HTTPS", "url_shortener": "URL shortener",
        "risky_download_extension": "Risky download type", "excessive_subdomains": "Excessive subdomains",
    }
    return [label_map.get(e.type, e.type) for e in evidence]

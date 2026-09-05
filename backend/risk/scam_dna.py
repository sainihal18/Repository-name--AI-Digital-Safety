"""
Scam DNA scoring.

Converts raw rule-check results into the structured ScamDNA indicator set.
Every number here traces back to an actual rule strength computed in
backend/rules/sms_rules.py or url_rules.py — nothing here is random.
"""
from __future__ import annotations

from typing import Dict, List

from backend.models.schemas import ScamDNA

# Maps rule-check "type" -> ScamDNA field(s) it contributes to.
_SMS_RULE_TO_DNA = {
    "urgency": ["urgency", "call_to_action_pressure"],
    "fear_intimidation": ["fear_intimidation"],
    "financial_pressure": ["financial_pressure"],
    "credential_request": ["credential_harvesting"],
    "otp_targeting": ["otp_targeting", "credential_harvesting"],
    "reward_manipulation": ["reward_manipulation", "call_to_action_pressure"],
    "impersonation": ["impersonation", "authority_abuse"],
    "kyc_banking": ["credential_harvesting", "financial_pressure"],
    "threat_punishment": ["fear_intimidation", "authority_abuse"],
    "external_link_usage": ["external_link_usage"],
}

_URL_RULE_TO_DNA = {
    "brand_impersonation": ["brand_impersonation", "impersonation"],
    "suspicious_keywords": ["credential_harvesting"],
    "ip_address_host": ["social_engineering"],
    "at_symbol_obfuscation": ["social_engineering"],
    "no_https": ["social_engineering"],
    "url_shortener": ["social_engineering", "external_link_usage"],
    "risky_download_extension": ["social_engineering"],
    "excessive_subdomains": ["social_engineering"],
}


def _accumulate(raw_results: List[Dict], mapping: Dict[str, List[str]]) -> Dict[str, int]:
    scores: Dict[str, List[int]] = {}
    for result in raw_results:
        if not result["fired"]:
            continue
        for field in mapping.get(result["type"], []):
            scores.setdefault(field, []).append(result["strength"])

    # Social engineering is a composite — present if 2+ other DNA
    # dimensions are already active, scored as their average.
    return {field: max(vals) for field, vals in scores.items()}


def compute_sms_scam_dna(raw_results: List[Dict]) -> ScamDNA:
    scores = _accumulate(raw_results, _SMS_RULE_TO_DNA)
    active_dims = [v for k, v in scores.items() if k != "social_engineering" and v > 0]
    if len(active_dims) >= 2:
        scores["social_engineering"] = min(100, int(sum(active_dims) / len(active_dims)) + 10)
    return ScamDNA(**{k: scores.get(k, 0) for k in ScamDNA.model_fields.keys()})


def compute_url_scam_dna(raw_results: List[Dict]) -> ScamDNA:
    scores = _accumulate(raw_results, _URL_RULE_TO_DNA)
    active_dims = [v for k, v in scores.items() if k != "social_engineering" and v > 0]
    if len(active_dims) >= 2:
        scores["social_engineering"] = min(100, int(sum(active_dims) / len(active_dims)) + 10)
    return ScamDNA(**{k: scores.get(k, 0) for k in ScamDNA.model_fields.keys()})

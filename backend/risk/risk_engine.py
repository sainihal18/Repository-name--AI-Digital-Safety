"""
Risk engine — the heart of the "professional security report."

Combines up to three inputs with transparent, configurable weights:
  - ml_score            (0-100, from the active ML model's P(scam))
  - rule_score           (0-100, from the rule engine)
  - threat_intel_score    (0-100, derived from aggregator results)

Any input source that is genuinely unavailable (no trained ML model,
threat intel disabled/unreachable) is EXCLUDED from the weighted sum and
the remaining weights are renormalized — it is never treated as a silent
"0% scam" vote, which would wrongly drag the score toward safe. Absence
of evidence is not evidence of absence.

Then applies the UNKNOWN override: if there is no usable model confidence
AND rule evidence is weak AND threat intel was unavailable, the engine
refuses to force a verdict and returns UNKNOWN with a reason — this is a
first-class, intentional outcome, not a fallback/error case.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional

from backend.models.enums import Verdict
from backend.risk.risk_config import load_risk_config


@dataclass
class RiskResult:
    risk_score: int
    confidence: int
    verdict: Verdict
    reason: Optional[str]
    explanation: List[str]


def _clip(value: float, lo: int = 0, hi: int = 100) -> int:
    return max(lo, min(hi, int(round(value))))


def compute_risk(
    ml_confidence_scam: float,          # 0-100, model's P(scam) * 100 (ignored if ml_available=False)
    ml_confidence_raw: float,           # 0-100, model's confidence in its own prediction
    rule_score: int,                    # 0-100
    fired_rule_count: int,
    threat_intel_known_malicious: Optional[bool],
    threat_intel_available: bool,
    ml_available: bool = True,
) -> RiskResult:
    cfg = load_risk_config()
    weights = cfg["weights"]
    thresholds = cfg["thresholds"]
    unknown_cfg = cfg["unknown_logic"]
    ti_cfg = cfg["threat_intel_override"]

    explanation: List[str] = []

    threat_intel_score = 0
    if threat_intel_available and threat_intel_known_malicious is True:
        threat_intel_score = 100
    elif threat_intel_available and threat_intel_known_malicious is False:
        threat_intel_score = 0

    # --- Weighted fusion, excluding any genuinely unavailable source -------
    # rules are always available (the rule engine always runs), ml and
    # threat_intel are conditionally included.
    components = [(rule_score, weights["rules"])]
    if ml_available:
        components.append((ml_confidence_scam, weights["ml"]))
    else:
        explanation.append("No trained ML model available — score based on rules"
                            + (" + threat intelligence." if threat_intel_available else " only."))
    if threat_intel_available:
        components.append((threat_intel_score, weights["threat_intelligence"]))
    else:
        explanation.append("Threat intelligence unavailable — excluded from score, not counted as safe.")

    total_weight = sum(w for _, w in components)
    weighted = sum(v * w for v, w in components) / total_weight if total_weight > 0 else rule_score

    # Explicit, explained threat-intel override rather than a silent hard
    # override: known-malicious always pushes risk up, but the reasoning
    # is recorded, and other evidence isn't discarded.
    if threat_intel_available and threat_intel_known_malicious is True:
        weighted = min(ti_cfg["max_score"], weighted + ti_cfg["known_malicious_boost"])
        explanation.append(
            f"Threat intelligence confirmed known-malicious — risk score boosted by "
            f"{ti_cfg['known_malicious_boost']} points."
        )

    risk_score = _clip(weighted)
    # Confidence in the verdict: when a model is available, its own
    # confidence is the best signal; when it isn't, fall back to rule
    # strength as a deterministic, evidence-derived proxy (never a raw 0,
    # which would misleadingly imply "no confidence" even when several
    # rules fired strongly).
    confidence = _clip(ml_confidence_raw) if ml_available else _clip(rule_score)

    # --- UNKNOWN override ---------------------------------------------------
    # "Weak model evidence" covers both a genuinely low-confidence prediction
    # AND the absence of any model at all — either way we don't have a
    # trustworthy ML signal to lean on.
    weak_model = (not ml_available) or (ml_confidence_raw < unknown_cfg["min_model_confidence"])
    weak_rules = fired_rule_count < unknown_cfg["min_rule_evidence_count"]

    if weak_model and weak_rules and not threat_intel_available:
        explanation.append(
            "No usable ML confidence, rule evidence is weak, and threat intelligence "
            "is unavailable — insufficient evidence for a confident verdict."
        )
        return RiskResult(
            risk_score=risk_score,
            confidence=confidence,
            verdict=Verdict.UNKNOWN,
            reason="Insufficient evidence",
            explanation=explanation,
        )

    # --- Threshold-based verdict --------------------------------------------
    if risk_score <= thresholds["low_risk_max"]:
        verdict = Verdict.LOW_RISK
    elif risk_score <= thresholds["unknown_max"]:
        verdict = Verdict.UNKNOWN
        explanation.append("Risk score falls in the ambiguous band — evidence is inconclusive.")
    elif risk_score <= thresholds["suspicious_max"]:
        verdict = Verdict.SUSPICIOUS
    else:
        verdict = Verdict.HIGH_RISK

    reason = None if verdict != Verdict.UNKNOWN else "Ambiguous risk score band"
    return RiskResult(
        risk_score=risk_score,
        confidence=confidence,
        verdict=verdict,
        reason=reason,
        explanation=explanation,
    )

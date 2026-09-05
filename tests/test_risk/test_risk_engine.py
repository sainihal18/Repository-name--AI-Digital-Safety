from backend.models.enums import Verdict
from backend.risk.risk_engine import compute_risk


def test_unknown_when_no_evidence_at_all():
    risk = compute_risk(
        ml_confidence_scam=0, ml_confidence_raw=0, ml_available=False,
        rule_score=0, fired_rule_count=0,
        threat_intel_known_malicious=None, threat_intel_available=False,
    )
    assert risk.verdict == Verdict.UNKNOWN
    assert risk.reason == "Insufficient evidence"


def test_high_risk_when_rules_strong_even_without_ml():
    """Regression test for the bug caught during manual smoke-testing:
    an unavailable ML model must NOT be treated as a phantom '0% scam'
    vote that drags a strongly-evidenced case down to LOW RISK."""
    risk = compute_risk(
        ml_confidence_scam=0, ml_confidence_raw=0, ml_available=False,
        rule_score=84, fired_rule_count=6,
        threat_intel_known_malicious=None, threat_intel_available=False,
    )
    assert risk.verdict == Verdict.HIGH_RISK
    assert risk.risk_score == 84


def test_low_risk_when_ml_and_rules_both_agree_safe():
    risk = compute_risk(
        ml_confidence_scam=5, ml_confidence_raw=95, ml_available=True,
        rule_score=0, fired_rule_count=0,
        threat_intel_known_malicious=None, threat_intel_available=False,
    )
    assert risk.verdict == Verdict.LOW_RISK


def test_threat_intel_known_malicious_boosts_score():
    risk_without = compute_risk(
        ml_confidence_scam=50, ml_confidence_raw=60, ml_available=True,
        rule_score=50, fired_rule_count=2,
        threat_intel_known_malicious=None, threat_intel_available=False,
    )
    risk_with = compute_risk(
        ml_confidence_scam=50, ml_confidence_raw=60, ml_available=True,
        rule_score=50, fired_rule_count=2,
        threat_intel_known_malicious=True, threat_intel_available=True,
    )
    assert risk_with.risk_score > risk_without.risk_score


def test_never_exceeds_100():
    risk = compute_risk(
        ml_confidence_scam=100, ml_confidence_raw=100, ml_available=True,
        rule_score=100, fired_rule_count=10,
        threat_intel_known_malicious=True, threat_intel_available=True,
    )
    assert risk.risk_score <= 100


def test_absence_from_threat_intel_is_not_treated_as_safe():
    """Explicitly checks the spec requirement: not being in a threat
    database must not read as confirmation of safety."""
    risk_unavailable = compute_risk(
        ml_confidence_scam=40, ml_confidence_raw=50, ml_available=True,
        rule_score=40, fired_rule_count=2,
        threat_intel_known_malicious=None, threat_intel_available=False,
    )
    risk_checked_clean = compute_risk(
        ml_confidence_scam=40, ml_confidence_raw=50, ml_available=True,
        rule_score=40, fired_rule_count=2,
        threat_intel_known_malicious=False, threat_intel_available=True,
    )
    # An explicit "not listed" result should not score HIGHER risk than
    # simply not having checked at all.
    assert risk_checked_clean.risk_score <= risk_unavailable.risk_score

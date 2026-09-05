"""
NOTE: requires pydantic + fastapi installed (see requirements.txt) since
AnalysisReport is a pydantic model. Run via `pytest tests/` in a normal
environment with dependencies installed.
"""
from backend.analyzers.sms_analyzer import SMSAnalyzer
from backend.models.enums import Verdict


def test_scam_sms_produces_elevated_risk(sample_scam_sms):
    analyzer = SMSAnalyzer()
    report = analyzer.analyze(sample_scam_sms)
    assert report.risk_score > 30
    assert len(report.evidence) > 0
    assert report.verdict in (Verdict.SUSPICIOUS, Verdict.HIGH_RISK)


def test_safe_sms_produces_low_or_unknown_risk(sample_safe_sms):
    analyzer = SMSAnalyzer()
    report = analyzer.analyze(sample_safe_sms)
    assert report.verdict in (Verdict.LOW_RISK, Verdict.UNKNOWN)


def test_report_has_full_schema_populated(sample_scam_sms):
    analyzer = SMSAnalyzer()
    report = analyzer.analyze(sample_scam_sms)
    assert report.analysis_id
    assert report.timestamp
    assert report.model is not None
    assert report.feature_version
    assert report.risk_engine_version
    assert isinstance(report.limitations, list) and len(report.limitations) > 0


def test_empty_message_raises_validation_error():
    from backend.security.validators import ValidationError, validate_sms_input
    import pytest
    with pytest.raises(ValidationError):
        validate_sms_input("")


def test_never_claims_100_percent_safe(sample_safe_sms):
    analyzer = SMSAnalyzer()
    report = analyzer.analyze(sample_safe_sms)
    assert report.risk_score < 100 or report.verdict != Verdict.LOW_RISK
    for lim in report.limitations:
        assert "100% safe" not in lim.lower()

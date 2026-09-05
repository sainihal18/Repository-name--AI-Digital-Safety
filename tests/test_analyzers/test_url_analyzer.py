"""
NOTE: requires pydantic + fastapi installed (see requirements.txt).
"""
import os

from backend.analyzers.url_analyzer import URLAnalyzer
from backend.models.enums import Verdict


def test_phishing_url_produces_elevated_risk(sample_phishing_url, monkeypatch):
    monkeypatch.setenv("THREAT_INTEL_ENABLED", "false")  # no network in test env
    analyzer = URLAnalyzer()
    report = analyzer.analyze(sample_phishing_url)
    assert report.risk_score > 30
    assert len(report.evidence) > 0


def test_safe_url_produces_low_or_unknown_risk(sample_safe_url, monkeypatch):
    monkeypatch.setenv("THREAT_INTEL_ENABLED", "false")
    analyzer = URLAnalyzer()
    report = analyzer.analyze(sample_safe_url)
    assert report.verdict in (Verdict.LOW_RISK, Verdict.UNKNOWN)


def test_url_is_never_fetched_or_executed(sample_phishing_url, monkeypatch):
    """The analyzer must only ever inspect the URL string — never issue an
    HTTP request to the destination itself (threat-intel lookups are a
    separate, explicit, reputation-only API call, not visiting the page)."""
    monkeypatch.setenv("THREAT_INTEL_ENABLED", "false")
    analyzer = URLAnalyzer()
    report = analyzer.analyze(sample_phishing_url)
    assert any("never visited or executed" in lim for lim in report.limitations)


def test_missing_model_falls_back_to_rules_gracefully(sample_phishing_url, monkeypatch):
    monkeypatch.setenv("THREAT_INTEL_ENABLED", "false")
    analyzer = URLAnalyzer()
    analyzer._model = None  # simulate no trained model
    report = analyzer.analyze(sample_phishing_url)
    assert report.model.type == "rules_only"
    assert any("No trained ML model" in lim for lim in report.limitations)

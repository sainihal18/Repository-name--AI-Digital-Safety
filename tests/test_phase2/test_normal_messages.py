"""
Phase 2 tests: normal, suspicious, and malicious SMS/URL classification.
"""
from __future__ import annotations

import pytest
from backend.analyzers.sms_analyzer import SMSAnalyzer
from backend.analyzers.url_analyzer import URLAnalyzer
from backend.models.enums import Verdict

@pytest.fixture(scope="module")
def sms_analyzer():
    return SMSAnalyzer()

@pytest.fixture(scope="module")
def url_analyzer():
    return URLAnalyzer()

@pytest.mark.parametrize("message", [
    "Can we meet at 6pm?",
    "Hey are we still meeting for lunch tomorrow at noon?",
    "Thanks for the birthday wishes! Had a great day.",
    "Can you pick up milk on your way home?",
    "Meeting moved to 3pm in conference room B.",
    "Mom I landed safely, will call you in an hour.",
    "The movie starts at 7, want to grab dinner before?",
    "Don't forget we have the dentist appointment on Thursday.",
    "Great job on the presentation today, the client loved it.",
    "Traffic is bad on the highway, might be 15 minutes late.",
    "Let's catch up this weekend, it's been a while.",
    "Please review the attached document before our meeting.",
    "Flight lands at 9pm, see you at arrivals.",
    "Happy anniversary! Love you.",
    "Your electricity bill for this month has been paid successfully via autopay.",
])
def test_normal_sms_is_low_risk(message, sms_analyzer):
    report = sms_analyzer.analyze(message)
    assert report.verdict in (Verdict.LOW_RISK, Verdict.UNKNOWN), f"Failed for {message}"

@pytest.mark.parametrize("message", [
    "URGENT! Your bank account has been suspended. Verify your OTP now.",
    "Congratulations! You have won a $1000 gift card. Claim your prize now.",
    "Your account will be permanently closed unless you verify now at http://secure-bankverify.top",
    "Dear customer your KYC is incomplete. Update your Aadhaar details now.",
    "FINAL NOTICE: Your package delivery failed. Pay customs fee now.",
    "IRS Notice: legal action will be taken unless you pay immediately.",
    "Your net banking has been locked. Confirm your CVV at http://netbanking-confirm.top",
])
def test_suspicious_sms_is_not_low_risk(message, sms_analyzer):
    report = sms_analyzer.analyze(message)
    assert report.verdict != Verdict.LOW_RISK
    assert report.risk_score > 20

@pytest.mark.parametrize("message", [
    "URGENT! Your bank account has been suspended. Verify your OTP now or your account will be permanently closed. http://secure-bankverify.top/login",
    "Your debit card is blocked. Share your OTP with our representative. Account will be seized.",
    "Free gift waiting! You are our lucky winner today. Claim reward before midnight http://free-gift-claim.win",
])
def test_malicious_sms_has_elevated_risk(message, sms_analyzer):
    report = sms_analyzer.analyze(message)
    assert report.risk_score > 50
    assert len(report.evidence) > 0

@pytest.mark.parametrize("url", [
    "https://www.google.com",
    "https://www.wikipedia.org/wiki/Machine_learning",
    "https://github.com/pytorch/pytorch",
    "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    "https://stackoverflow.com/questions/tagged/python",
])
def test_normal_url_is_low_risk(url, url_analyzer, monkeypatch):
    monkeypatch.setenv("THREAT_INTEL_ENABLED", "false")
    report = url_analyzer.analyze(url)
    assert report.verdict in (Verdict.LOW_RISK, Verdict.UNKNOWN)

@pytest.mark.parametrize("url", [
    "http://paypa1-secure-login.top/signin/verify",
    "http://amaz0n-account-update.xyz/login",
    "http://192.168.44.19/bank/login.php",
    "http://secure-icici-kyc-verify.click/update",
    "http://microsoft0ffice-verify.top/account/login@confirm.com",
    "http://dropb0x-file-share.biz/download/invoice.exe",
])
def test_phishing_url_is_elevated_risk(url, url_analyzer, monkeypatch):
    monkeypatch.setenv("THREAT_INTEL_ENABLED", "false")
    report = url_analyzer.analyze(url)
    assert report.risk_score > 30
    assert report.verdict in (Verdict.SUSPICIOUS, Verdict.HIGH_RISK)

def test_sms_report_has_explainability_field(sms_analyzer):
    msg = "URGENT! Your bank account has been suspended. Verify OTP now."
    report = sms_analyzer.analyze(msg)
    assert report.explainability is not None
    assert isinstance(report.explainability.flagged_reasons, list)

def test_normal_sms_explainability_has_no_flagged_reasons(sms_analyzer):
    report = sms_analyzer.analyze("Can we meet at 6pm?")
    assert report.explainability is not None
    assert len(report.explainability.flagged_reasons) == 0

def test_url_report_has_explainability_field(url_analyzer, monkeypatch):
    monkeypatch.setenv("THREAT_INTEL_ENABLED", "false")
    report = url_analyzer.analyze("http://paypa1-secure-login.top/signin/verify")
    assert report.explainability is not None
    assert len(report.explainability.flagged_reasons) > 0

def test_sms_report_schema_complete(sms_analyzer):
    report = sms_analyzer.analyze("URGENT! Verify OTP or your account will be suspended.")
    fields = [
        "analysis_id", "input_type", "verdict", "risk_score", "confidence",
        "category", "evidence", "suspicious_terms", "extracted_urls",
        "extracted_entities", "scam_dna", "attack_chain", "recommended_actions",
        "explainability", "model", "feature_version", "risk_engine_version",
        "limitations",
    ]
    for field in fields:
        assert getattr(report, field, "__MISSING__") != "__MISSING__"

def test_url_report_schema_complete(url_analyzer, monkeypatch):
    monkeypatch.setenv("THREAT_INTEL_ENABLED", "false")
    report = url_analyzer.analyze("http://paypa1-secure-login.top/signin/verify")
    fields = [
        "analysis_id", "input_type", "verdict", "risk_score", "confidence",
        "category", "evidence", "suspicious_terms", "extracted_urls",
        "extracted_entities", "scam_dna", "attack_chain", "recommended_actions",
        "explainability", "model", "feature_version", "risk_engine_version",
        "limitations",
    ]
    for field in fields:
        assert getattr(report, field, "__MISSING__") != "__MISSING__"

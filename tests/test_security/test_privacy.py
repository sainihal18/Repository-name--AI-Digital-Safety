import os

from backend.security.privacy import hash_content, redact_sensitive, should_store_analysis


def test_hash_is_deterministic():
    assert hash_content("hello world") == hash_content("hello world")


def test_hash_is_case_and_whitespace_insensitive():
    assert hash_content("Hello World") == hash_content("  hello world  ")


def test_hash_is_one_way_and_short():
    h = hash_content("some sensitive SMS content")
    assert len(h) == 64  # sha256 hex digest length
    assert "some sensitive" not in h


def test_redact_removes_password_pattern():
    redacted = redact_sensitive("your password: hunter2 was used")
    assert "hunter2" not in redacted
    assert "[REDACTED]" in redacted


def test_redact_removes_otp_pattern():
    redacted = redact_sensitive("your otp is 483920")
    assert "483920" not in redacted


def test_store_analysis_defaults_to_false(monkeypatch):
    monkeypatch.delenv("STORE_ANALYSIS", raising=False)
    assert should_store_analysis() is False


def test_store_analysis_respects_env(monkeypatch):
    monkeypatch.setenv("STORE_ANALYSIS", "true")
    assert should_store_analysis() is True

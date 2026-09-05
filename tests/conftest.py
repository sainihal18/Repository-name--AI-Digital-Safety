"""Shared pytest fixtures."""
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


@pytest.fixture
def sample_scam_sms() -> str:
    return (
        "URGENT! Your bank account has been suspended. Verify your OTP and "
        "KYC details immediately at http://secure-bankverify.top/login or "
        "your account will be permanently closed."
    )


@pytest.fixture
def sample_safe_sms() -> str:
    return "Hey are we still meeting for lunch tomorrow at noon?"


@pytest.fixture
def sample_phishing_url() -> str:
    return "http://paypa1-secure-login.top/signin/verify"


@pytest.fixture
def sample_safe_url() -> str:
    return "https://www.google.com"

import pytest

from backend.security.validators import ValidationError, validate_sms_input, validate_url_input


def test_valid_sms_passes():
    assert validate_sms_input("Hello there") == "Hello there"


def test_empty_sms_rejected():
    with pytest.raises(ValidationError):
        validate_sms_input("")


def test_whitespace_only_sms_rejected():
    with pytest.raises(ValidationError):
        validate_sms_input("   ")


def test_oversized_sms_rejected():
    with pytest.raises(ValidationError):
        validate_sms_input("a" * 3000)


def test_valid_url_passes():
    assert validate_url_input("https://example.com") == "https://example.com"


def test_empty_url_rejected():
    with pytest.raises(ValidationError):
        validate_url_input("")


def test_url_without_hostname_rejected():
    with pytest.raises(ValidationError):
        validate_url_input("http://")


def test_oversized_url_rejected():
    with pytest.raises(ValidationError):
        validate_url_input("http://example.com/" + "a" * 3000)

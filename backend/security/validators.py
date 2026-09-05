"""
Input validation utilities: size limits, format checks, sanitization.
"""
from __future__ import annotations

from urllib.parse import urlparse

MAX_SMS_LENGTH = 2000
MAX_URL_LENGTH = 2048


class ValidationError(Exception):
    pass


def validate_sms_input(message: str) -> str:
    if not message or not message.strip():
        raise ValidationError("SMS message must not be empty.")
    if len(message) > MAX_SMS_LENGTH:
        raise ValidationError(f"SMS message exceeds max length of {MAX_SMS_LENGTH} characters.")
    return message.strip()


def validate_url_input(url: str) -> str:
    if not url or not url.strip():
        raise ValidationError("URL must not be empty.")
    url = url.strip()
    if len(url) > MAX_URL_LENGTH:
        raise ValidationError(f"URL exceeds max length of {MAX_URL_LENGTH} characters.")
    candidate = url if "://" in url else f"http://{url}"
    parsed = urlparse(candidate)
    if not parsed.hostname:
        raise ValidationError("URL does not appear to contain a valid hostname.")
    return url

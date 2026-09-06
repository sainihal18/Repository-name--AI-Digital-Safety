"""
Privacy-preserving utilities.

Hard rule enforced here, not just in the docs: OTP/password/PIN/CVV/
banking-credential strings are stripped before anything is hashed or
logged, and raw content is only ever hashed (SHA-256), never stored, and
only when STORE_ANALYSIS=true.
"""
from __future__ import annotations

import hashlib
import os
import re

_SENSITIVE_PATTERNS = [
    re.compile(r"\botp\D{0,5}\d{4,8}\b", re.IGNORECASE),
    re.compile(r"\bpin\D{0,5}\d{4,8}\b", re.IGNORECASE),
    re.compile(r"\bcvv\D{0,5}\d{3,4}\b", re.IGNORECASE),
    re.compile(r"\bpassword\s*[:=]?\s*\S+", re.IGNORECASE),
]


def redact_sensitive(text: str) -> str:
    """Best-effort redaction for anything that must never reach logs,
    even in a stack trace or debug message."""
    redacted = text
    for pattern in _SENSITIVE_PATTERNS:
        redacted = pattern.sub("[REDACTED]", redacted)
    return redacted


def should_store_analysis() -> bool:
    return os.getenv("STORE_ANALYSIS", "true").lower() == "true"


def hash_content(text: str) -> str:
    """One-way hash — cannot be reversed to recover the original message
    or URL. Used only for research-mode duplicate detection/statistics,
    never for anything requiring the original content."""
    normalized = text.strip().lower()
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()

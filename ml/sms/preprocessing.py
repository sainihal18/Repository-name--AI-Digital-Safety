"""
SMS preprocessing.

Preserves `raw_text` alongside `normalized_text` — transformers need the
raw, semantically-rich text; the TF-IDF baseline benefits from a cleaner
normalized form. Neither model should lose information the other needs.
"""
from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass


_WHITESPACE_RE = re.compile(r"\s+")


@dataclass
class PreprocessedSMS:
    raw_text: str
    normalized_text: str


def normalize_unicode(text: str) -> str:
    return unicodedata.normalize("NFKC", text)


def normalize_whitespace(text: str) -> str:
    return _WHITESPACE_RE.sub(" ", text).strip()


def preprocess_sms(text: str, lowercase_for_tfidf: bool = True) -> PreprocessedSMS:
    raw = text
    normalized = normalize_unicode(text)
    normalized = normalize_whitespace(normalized)
    if lowercase_for_tfidf:
        normalized = normalized.lower()
    return PreprocessedSMS(raw_text=raw, normalized_text=normalized)


def normalize_label(raw_label: str) -> int:
    """Map dataset-specific label strings to the canonical 0/1 scheme
    required by the spec: 0 = ham/safe/legitimate/benign, 1 = spam/scam/
    phishing/fraud/malicious."""
    label = str(raw_label).strip().lower()
    safe_labels = {"ham", "safe", "legitimate", "benign", "0"}
    scam_labels = {"spam", "scam", "phishing", "fraud", "malicious", "1"}
    if label in safe_labels:
        return 0
    if label in scam_labels:
        return 1
    raise ValueError(f"Unrecognized label '{raw_label}' — cannot normalize. "
                      f"Add it explicitly to safe_labels/scam_labels, don't guess.")

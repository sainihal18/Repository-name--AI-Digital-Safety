"""Password strength analysis & simulated breach check endpoint."""
from __future__ import annotations

import hashlib
import math
import re
import string
from typing import Any

from fastapi import APIRouter

from pydantic import BaseModel, Field

router = APIRouter()


class PasswordRequest(BaseModel):
    password: str = Field(..., min_length=1, max_length=512)


class PasswordAnalysis(BaseModel):
    score: int  # 0-100
    entropy: float
    crack_time_display: str
    character_classes: dict[str, bool]
    length: int
    breach_count: int
    suggestions: list[str]
    verdict: str  # VERY WEAK / WEAK / FAIR / STRONG / VERY STRONG


# ── Helpers ──────────────────────────────────────────────────────────────────

_COMMON_PASSWORDS = {
    "password", "123456", "12345678", "qwerty", "abc123", "monkey", "1234567",
    "letmein", "trustno1", "dragon", "baseball", "iloveyou", "master", "sunshine",
    "ashley", "bailey", "passw0rd", "shadow", "123123", "654321", "superman",
    "qazwsx", "michael", "football", "password1", "password123", "admin", "welcome",
    "hello", "charlie", "donald", "login", "starwars", "121212", "flower",
}


def _character_classes(pw: str) -> dict[str, bool]:
    return {
        "lowercase": bool(re.search(r"[a-z]", pw)),
        "uppercase": bool(re.search(r"[A-Z]", pw)),
        "digits": bool(re.search(r"\d", pw)),
        "special": bool(re.search(r"[^a-zA-Z0-9]", pw)),
    }


def _pool_size(classes: dict[str, bool]) -> int:
    pool = 0
    if classes["lowercase"]:
        pool += 26
    if classes["uppercase"]:
        pool += 26
    if classes["digits"]:
        pool += 10
    if classes["special"]:
        pool += len(string.punctuation)
    return pool or 1


def _crack_time(entropy: float) -> str:
    """Estimate offline crack time at 10B guesses/sec."""
    guesses = 2 ** entropy
    seconds = guesses / 10_000_000_000
    if seconds < 1:
        return "Instantly"
    if seconds < 60:
        return f"{seconds:.0f} seconds"
    if seconds < 3600:
        return f"{seconds / 60:.0f} minutes"
    if seconds < 86400:
        return f"{seconds / 3600:.1f} hours"
    if seconds < 86400 * 365:
        return f"{seconds / 86400:.0f} days"
    if seconds < 86400 * 365 * 1000:
        return f"{seconds / (86400 * 365):.0f} years"
    if seconds < 86400 * 365 * 1_000_000:
        return f"{seconds / (86400 * 365 * 1000):.0f} thousand years"
    return "Millions of years+"


def _entropy(pw: str, pool: int) -> float:
    if pool <= 1 or len(pw) == 0:
        return 0.0
    return len(pw) * math.log2(pool)


def _score(entropy: float, pw: str, breach: int) -> int:
    """Map entropy + penalties to a 0-100 score."""
    base = min(100, int(entropy * 1.2))
    # Penalties
    if pw.lower() in _COMMON_PASSWORDS:
        base = min(base, 5)
    if len(set(pw)) <= 2:
        base = max(0, base - 40)
    if breach > 0:
        base = max(0, base - 30)
    return max(0, min(100, base))


def _verdict(score: int) -> str:
    if score < 20:
        return "VERY WEAK"
    if score < 40:
        return "WEAK"
    if score < 60:
        return "FAIR"
    if score < 80:
        return "STRONG"
    return "VERY STRONG"


def _suggestions(pw: str, classes: dict[str, bool], score: int) -> list[str]:
    tips: list[str] = []
    if len(pw) < 12:
        tips.append("Use at least 12 characters for better security.")
    if not classes["uppercase"]:
        tips.append("Add uppercase letters (A-Z).")
    if not classes["lowercase"]:
        tips.append("Add lowercase letters (a-z).")
    if not classes["digits"]:
        tips.append("Include numbers (0-9).")
    if not classes["special"]:
        tips.append("Add special characters (!@#$%^&*).")
    if pw.lower() in _COMMON_PASSWORDS:
        tips.append("This is a commonly-used password. Choose something unique.")
    if len(set(pw)) <= 3:
        tips.append("Avoid repeating the same characters.")
    if score >= 80 and not tips:
        tips.append("Excellent password strength!")
    return tips


def _simulated_breach_count(pw: str) -> int:
    """
    Simulated breach lookup using the password's SHA-1 hash.
    In production, this would use the HaveIBeenPwned k-anonymity API.
    Here we deterministically derive a fake count from hash bytes.
    """
    sha1 = hashlib.sha1(pw.encode()).hexdigest().upper()
    # Common passwords get large breach counts
    if pw.lower() in _COMMON_PASSWORDS:
        return int(sha1[:4], 16) * 100 + 50_000
    # Derive a small count from the first 2 hex chars
    val = int(sha1[:2], 16)
    if val < 30:
        return val * 3  # ~12% chance of small breach
    return 0  # Most unique passwords ⇒ 0 breaches


# ── Endpoint ─────────────────────────────────────────────────────────────────


@router.post("/analyze/password", tags=["Password"])
async def analyze_password(req: PasswordRequest) -> PasswordAnalysis:
    pw = req.password
    classes = _character_classes(pw)
    pool = _pool_size(classes)
    ent = _entropy(pw, pool)
    breach = _simulated_breach_count(pw)
    sc = _score(ent, pw, breach)

    return PasswordAnalysis(
        score=sc,
        entropy=round(ent, 2),
        crack_time_display=_crack_time(ent),
        character_classes=classes,
        length=len(pw),
        breach_count=breach,
        suggestions=_suggestions(pw, classes, sc),
        verdict=_verdict(sc),
    )

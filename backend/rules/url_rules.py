"""
URL rule engine.

Includes the brand-impersonation / typosquat / homoglyph detector
(edit-distance + Unicode confusable mapping + combosquat keyword check)
added on top of the original spec — see the research addendum for why
this is worth the small amount of extra code.
"""
from __future__ import annotations

import re
import unicodedata
from typing import Dict, List
from urllib.parse import urlparse

from backend.rules import patterns as p

# A small confusable-character map covering the most common homoglyph
# substitutions: Cyrillic/Greek look-alikes for Latin letters, AND the
# classic ASCII "leetspeak" substitutions (0->o, 1->l, 3->e, etc.) that
# typosquatters use just as often since they don't require Unicode/
# punycode at all (e.g. "paypa1.com", "amaz0n.com"). This is intentionally
# not exhaustive — it is a defensive heuristic, not a guarantee, and is
# documented as such in the evidence description.
_CONFUSABLES = {
    "а": "a", "е": "e", "о": "o", "р": "p", "с": "c", "у": "y", "х": "x",  # Cyrillic
    "і": "i", "ѕ": "s", "һ": "h", "ј": "j", "ԁ": "d", "ɡ": "g",
    "α": "a", "ο": "o", "ρ": "p", "υ": "u", "ν": "v",  # Greek
    "0": "o", "1": "l", "3": "e", "4": "a", "5": "s", "7": "t",  # leetspeak
}

_TOKEN_SPLIT_RE = re.compile(r"[.\-_]+")


def _normalize_confusables(s: str) -> str:
    s = unicodedata.normalize("NFKC", s)
    return "".join(_CONFUSABLES.get(ch, ch) for ch in s)


def _levenshtein(a: str, b: str) -> int:
    if a == b:
        return 0
    if len(a) == 0:
        return len(b)
    if len(b) == 0:
        return len(a)
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, start=1):
        curr = [i] + [0] * len(b)
        for j, cb in enumerate(b, start=1):
            cost = 0 if ca == cb else 1
            curr[j] = min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost)
        prev = curr
    return prev[-1]


def check_brand_impersonation(hostname: str) -> Dict:
    """Typosquat + homoglyph/leetspeak + combosquat detection against a
    curated brand list.

    Checks BOTH the full second-level-domain string and its individual
    hyphen/underscore-separated tokens, since typosquat domains commonly
    look like "brand-secure-login.tld" where only one token ("brand" or a
    near-miss of it) actually resembles the real brand — comparing the
    whole string to the brand name alone would miss this.
    """
    if not hostname:
        return {"type": "brand_impersonation", "fired": False, "severity": "LOW",
                "description": "", "matched_terms": [], "strength": 0}

    core = hostname.lower().split(".")[0] if "." in hostname else hostname.lower()
    tokens = [t for t in _TOKEN_SPLIT_RE.split(core) if t]
    candidates = list(dict.fromkeys([core] + tokens))  # whole string + each token, deduped

    other_tokens_suspicious = any(kw in tok for tok in tokens for kw in p.URL_SUSPICIOUS_KEYWORDS)

    best_brand, best_distance, match_kind, best_candidate = None, 999, None, None

    for candidate in candidates:
        normalized = _normalize_confusables(candidate)
        for brand in p.PROTECTED_BRANDS:
            if candidate == brand:
                continue  # exact match to the real brand name is not impersonation by itself
            # Combosquat: brand name embedded in the full domain alongside
            # a suspicious keyword token (e.g. "paypal-secure-login").
            if len(brand) >= 4 and brand in core and core != brand and other_tokens_suspicious:
                if best_distance > 0:
                    best_brand, best_distance, match_kind, best_candidate = brand, 0, "combosquat", candidate
                continue
            dist = _levenshtein(normalized, brand)
            if dist < best_distance and dist <= 2 and len(brand) >= 4:
                match_kind = "homoglyph_or_leetspeak" if normalized != candidate else "typosquat"
                best_brand, best_distance, best_candidate = brand, dist, candidate

    fired = best_brand is not None
    if not fired:
        return {"type": "brand_impersonation", "fired": False, "severity": "LOW",
                "description": "", "matched_terms": [], "strength": 0}

    severity = "HIGH" if best_distance <= 1 or match_kind == "combosquat" else "MEDIUM"
    strength = 95 if best_distance == 0 else max(40, 90 - best_distance * 20)
    return {
        "type": "brand_impersonation",
        "fired": True,
        "severity": severity,
        "description": (
            f"Domain token '{best_candidate}' closely resembles the brand '{best_brand}' "
            f"({match_kind}, edit distance {best_distance}) — a common phishing tactic."
        ),
        "matched_terms": [best_brand],
        "strength": strength,
    }


def check_suspicious_keywords(url: str) -> Dict:
    lower = url.lower()
    hits = [kw for kw in p.URL_SUSPICIOUS_KEYWORDS if kw in lower]
    return {
        "type": "suspicious_keywords",
        "fired": len(hits) > 0,
        "severity": "HIGH" if len(hits) >= 3 else "MEDIUM",
        "description": "URL contains terms commonly used to imitate login/verification pages.",
        "matched_terms": hits,
        "strength": min(100, len(hits) * 20),
    }


def check_ip_address_host(hostname: str) -> Dict:
    parts = hostname.split(".")
    is_ip = len(parts) == 4 and all(part.isdigit() and 0 <= int(part) <= 255 for part in parts)
    return {
        "type": "ip_address_host",
        "fired": is_ip,
        "severity": "HIGH",
        "description": "URL uses a raw IP address instead of a domain name — legitimate services rarely do this.",
        "matched_terms": [hostname] if is_ip else [],
        "strength": 90 if is_ip else 0,
    }


def check_at_symbol(url: str) -> Dict:
    has_at = "@" in url
    return {
        "type": "at_symbol_obfuscation",
        "fired": has_at,
        "severity": "HIGH",
        "description": "URL contains '@', which can hide the real destination host from casual inspection.",
        "matched_terms": ["@"] if has_at else [],
        "strength": 85 if has_at else 0,
    }


def check_no_https(scheme: str) -> Dict:
    insecure = scheme.lower() != "https"
    return {
        "type": "no_https",
        "fired": insecure,
        "severity": "MEDIUM",
        "description": "URL does not use HTTPS.",
        "matched_terms": [],
        "strength": 40 if insecure else 0,
    }


def check_url_shortener(hostname: str) -> Dict:
    is_shortener = any(s in hostname.lower() for s in p.URL_SHORTENERS)
    return {
        "type": "url_shortener",
        "fired": is_shortener,
        "severity": "MEDIUM",
        "description": "URL uses a shortening service, which can hide the real destination.",
        "matched_terms": [hostname] if is_shortener else [],
        "strength": 55 if is_shortener else 0,
    }


def check_download_extension(path: str) -> Dict:
    lower = path.lower()
    hit = next((ext for ext in p.DOWNLOAD_EXTENSIONS if lower.endswith(ext)), None)
    return {
        "type": "risky_download_extension",
        "fired": hit is not None,
        "severity": "HIGH",
        "description": "URL points directly at an executable/installable file type.",
        "matched_terms": [hit] if hit else [],
        "strength": 90 if hit else 0,
    }


def check_excessive_subdomains(hostname: str) -> Dict:
    depth = hostname.count(".")
    fired = depth >= 4
    return {
        "type": "excessive_subdomains",
        "fired": fired,
        "severity": "MEDIUM",
        "description": "URL uses an unusually deep subdomain chain, sometimes used to obscure the real domain.",
        "matched_terms": [hostname] if fired else [],
        "strength": 50 if fired else 0,
    }


def run_url_rules(url: str) -> List[Dict]:
    parsed = urlparse(url if "://" in url else f"http://{url}")
    hostname = parsed.hostname or ""
    return [
        check_brand_impersonation(hostname),
        check_suspicious_keywords(url),
        check_ip_address_host(hostname),
        check_at_symbol(url),
        check_no_https(parsed.scheme or "http"),
        check_url_shortener(hostname),
        check_download_extension(parsed.path or ""),
        check_excessive_subdomains(hostname),
    ]

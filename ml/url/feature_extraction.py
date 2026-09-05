"""
URL lexical/structural feature extraction.

Deliberately dependency-free (urllib.parse + math + re only) so it works
identically offline, in CI, and in production — no reliance on rendering
the page or calling out to the network. Produces 36+ engineered features
per the spec.
"""
from __future__ import annotations

import math
import re
from collections import Counter
from dataclasses import dataclass, fields
from urllib.parse import urlparse

from backend.rules.patterns import DOWNLOAD_EXTENSIONS, URL_SHORTENERS, URL_SUSPICIOUS_KEYWORDS

_IP_RE = re.compile(r"^(\d{1,3}\.){3}\d{1,3}$")
_PUNYCODE_RE = re.compile(r"xn--", re.IGNORECASE)


def _shannon_entropy(s: str) -> float:
    if not s:
        return 0.0
    counts = Counter(s)
    length = len(s)
    return -sum((c / length) * math.log2(c / length) for c in counts.values())


@dataclass
class URLFeatures:
    # Length-based
    url_length: int = 0
    hostname_length: int = 0
    path_length: int = 0
    query_length: int = 0
    fragment_length: int = 0

    # Character counts
    num_dots: int = 0
    num_hyphens: int = 0
    num_underscores: int = 0
    num_slashes: int = 0
    num_digits: int = 0
    num_letters: int = 0
    num_special_chars: int = 0
    num_equals: int = 0
    num_ampersands: int = 0
    num_percent: int = 0
    num_at_symbols: int = 0

    # Structural / boolean
    has_https: int = 0
    has_ip_address: int = 0
    has_port: int = 0
    is_punycode: int = 0
    has_at_symbol: int = 0
    is_url_shortener: int = 0

    # Domain complexity
    subdomain_count: int = 0
    tld_length: int = 0
    domain_token_count: int = 0

    # Path / query
    num_path_segments: int = 0
    num_query_params: int = 0
    has_double_slash_redirect: int = 0
    has_risky_extension: int = 0

    # Entropy / obfuscation
    hostname_entropy: float = 0.0
    path_entropy: float = 0.0
    digit_letter_ratio: float = 0.0

    # Suspicious-vocabulary
    suspicious_keyword_count: int = 0
    brand_keyword_and_suspicious_combo: int = 0

    # Ratios
    special_char_ratio: float = 0.0
    hostname_to_url_ratio: float = 0.0

    def as_dict(self) -> dict:
        return {f.name: getattr(self, f.name) for f in fields(self)}

    @staticmethod
    def feature_names() -> list:
        return [f.name for f in fields(URLFeatures)]


def extract_url_features(raw_url: str) -> URLFeatures:
    url = raw_url.strip()
    if "://" not in url:
        url = "http://" + url  # normalize so urlparse behaves consistently

    parsed = urlparse(url)
    hostname = parsed.hostname or ""
    path = parsed.path or ""
    query = parsed.query or ""
    fragment = parsed.fragment or ""

    letters = sum(c.isalpha() for c in url)
    digits = sum(c.isdigit() for c in url)
    specials = sum(not c.isalnum() for c in url)

    tld = hostname.split(".")[-1] if "." in hostname else ""
    domain_tokens = re.split(r"[.\-_]", hostname)

    f = URLFeatures(
        url_length=len(url),
        hostname_length=len(hostname),
        path_length=len(path),
        query_length=len(query),
        fragment_length=len(fragment),

        num_dots=url.count("."),
        num_hyphens=url.count("-"),
        num_underscores=url.count("_"),
        num_slashes=url.count("/"),
        num_digits=digits,
        num_letters=letters,
        num_special_chars=specials,
        num_equals=url.count("="),
        num_ampersands=url.count("&"),
        num_percent=url.count("%"),
        num_at_symbols=url.count("@"),

        has_https=int(parsed.scheme.lower() == "https"),
        has_ip_address=int(bool(_IP_RE.match(hostname))),
        has_port=int(parsed.port is not None),
        is_punycode=int(bool(_PUNYCODE_RE.search(hostname))),
        has_at_symbol=int("@" in url),
        is_url_shortener=int(any(s in hostname.lower() for s in URL_SHORTENERS)),

        subdomain_count=max(0, hostname.count(".") - 1),
        tld_length=len(tld),
        domain_token_count=len([t for t in domain_tokens if t]),

        num_path_segments=len([p for p in path.split("/") if p]),
        num_query_params=len([q for q in query.split("&") if q]),
        has_double_slash_redirect=int("//" in path),
        has_risky_extension=int(any(path.lower().endswith(ext) for ext in DOWNLOAD_EXTENSIONS)),

        hostname_entropy=round(_shannon_entropy(hostname), 4),
        path_entropy=round(_shannon_entropy(path), 4),
        digit_letter_ratio=round(digits / letters, 4) if letters else float(digits),

        suspicious_keyword_count=sum(1 for kw in URL_SUSPICIOUS_KEYWORDS if kw in url.lower()),
        brand_keyword_and_suspicious_combo=0,  # computed by rules/url_rules.py, kept here for schema parity

        special_char_ratio=round(specials / len(url), 4) if url else 0.0,
        hostname_to_url_ratio=round(len(hostname) / len(url), 4) if url else 0.0,
    )
    return f

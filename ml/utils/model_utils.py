"""Shared model save/load helpers: versioning + metadata JSON conventions."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path


def generate_version_tag(prefix: str) -> str:
    """e.g. 'sms-tfidf-lr-v20260814T101530Z' — sortable, unique, human-readable."""
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    return f"{prefix}-{ts}"


def write_json(path: str, data: dict) -> None:
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w") as f:
        json.dump(data, f, indent=2, default=str)


def read_json(path: str) -> dict:
    with open(path) as f:
        return json.load(f)

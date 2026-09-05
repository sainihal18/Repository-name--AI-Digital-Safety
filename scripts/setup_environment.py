#!/usr/bin/env python3
"""One-time setup: creates required directories that .gitignore excludes."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
for d in ["data/raw", "data/processed", "models/sms", "models/url", "reports", "logs", "output"]:
    (ROOT / d).mkdir(parents=True, exist_ok=True)
print("Environment directories created.")

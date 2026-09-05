"""
Batch inference utility — run many SMS/URLs through the analyzers at once
(e.g. for evaluating against a large held-out set, or for a CSV of items
a user wants triaged).
"""
from __future__ import annotations

from typing import List

import pandas as pd

from ml.inference.inference_engine import InferenceEngine


def batch_analyze_sms(messages: List[str]) -> pd.DataFrame:
    engine = InferenceEngine()
    rows = []
    for msg in messages:
        report = engine.analyze_sms(msg)
        rows.append({
            "message_preview": msg[:60], "verdict": report.verdict.value,
            "risk_score": report.risk_score, "confidence": report.confidence,
            "category": report.category.value,
        })
    return pd.DataFrame(rows)


def batch_analyze_urls(urls: List[str]) -> pd.DataFrame:
    engine = InferenceEngine()
    rows = []
    for url in urls:
        report = engine.analyze_url(url)
        rows.append({
            "url": url, "verdict": report.verdict.value,
            "risk_score": report.risk_score, "confidence": report.confidence,
            "category": report.category.value,
        })
    return pd.DataFrame(rows)

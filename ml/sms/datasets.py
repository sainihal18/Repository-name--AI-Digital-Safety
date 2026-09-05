"""
SMS dataset pipeline.

Supports the two column layouts named in the spec:
  - "label,message"
  - "v1,v2" (the raw UCI/Kaggle SMS Spam Collection column names)

Does NOT fabricate data. If you point this at data/raw/sms_sample.csv
(the tiny illustrative placeholder shipped with this repo) it will work,
but that file is a smoke-test fixture, not a real dataset — see
data/docs/dataset_cards/sms_spam_collection.md for how to get the real
UCI SMS Spam Collection (5,574 messages) before training anything you
intend to evaluate seriously.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import List, Tuple

import pandas as pd
from sklearn.model_selection import train_test_split

from ml.sms.preprocessing import normalize_label, preprocess_sms

logger = logging.getLogger(__name__)

_COLUMN_ALIASES = {
    "v1": "label", "v2": "message",
    "label": "label", "message": "message",
    "text": "message", "sms": "message",
}


@dataclass
class SMSDatasetStats:
    source_path: str
    total_rows: int
    duplicates_removed: int
    missing_removed: int
    final_rows: int
    class_distribution: dict


def load_raw_sms_csv(path: str) -> pd.DataFrame:
    df = pd.read_csv(path, encoding="latin-1")
    df = df.rename(columns={c: _COLUMN_ALIASES.get(c.strip().lower(), c) for c in df.columns})
    missing = {"label", "message"} - set(df.columns)
    if missing:
        raise ValueError(
            f"CSV at {path} is missing required column(s) {missing}. "
            f"Expected 'label,message' or 'v1,v2' format."
        )
    return df[["label", "message"]]


def clean_and_split(
    path: str,
    test_size: float = 0.15,
    val_size: float = 0.15,
    random_seed: int = 42,
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, SMSDatasetStats]:
    df = load_raw_sms_csv(path)
    total_rows = len(df)

    df = df.dropna(subset=["label", "message"])
    missing_removed = total_rows - len(df)

    df["message"] = df["message"].astype(str).apply(lambda t: preprocess_sms(t).normalized_text)
    before_dedup = len(df)
    df = df.drop_duplicates(subset=["message"])
    duplicates_removed = before_dedup - len(df)

    df["label"] = df["label"].apply(normalize_label)

    # Leakage prevention: split BEFORE any further transformation, and
    # split on the deduplicated frame so no identical message can appear
    # in both train and test.
    train_df, temp_df = train_test_split(
        df, test_size=(test_size + val_size), random_state=random_seed, stratify=df["label"]
    )
    relative_test = test_size / (test_size + val_size)
    val_df, test_df = train_test_split(
        temp_df, test_size=relative_test, random_state=random_seed, stratify=temp_df["label"]
    )

    stats = SMSDatasetStats(
        source_path=path,
        total_rows=total_rows,
        duplicates_removed=duplicates_removed,
        missing_removed=missing_removed,
        final_rows=len(df),
        class_distribution=df["label"].value_counts().to_dict(),
    )
    logger.info("SMS dataset loaded: %s", stats)
    return train_df, val_df, test_df, stats

"""
URL dataset pipeline.

Expects a CSV with at minimum `url,label` columns. Label normalization
follows the same 0/1 scheme as SMS (0 = benign/legitimate, 1 = phishing/
malicious). See data/docs/dataset_cards/url_phishing_dataset.md for real
public sources (PhiUSIIL on UCI, Kaggle "Phishing URLs Dataset with
Extracted Features") — data/raw/url_sample.csv shipped in this repo is a
tiny illustrative placeholder for smoke-testing the pipeline only.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Tuple

import pandas as pd
from sklearn.model_selection import train_test_split

from ml.sms.preprocessing import normalize_label
from ml.url.feature_extraction import extract_url_features

logger = logging.getLogger(__name__)


@dataclass
class URLDatasetStats:
    source_path: str
    total_rows: int
    duplicates_removed: int
    missing_removed: int
    final_rows: int
    class_distribution: dict


def load_raw_url_csv(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    cols = {c.strip().lower(): c for c in df.columns}
    if "url" not in cols or "label" not in cols:
        raise ValueError(f"CSV at {path} must contain 'url' and 'label' columns.")
    df = df.rename(columns={cols["url"]: "url", cols["label"]: "label"})
    return df[["url", "label"]]


def build_feature_frame(df: pd.DataFrame) -> pd.DataFrame:
    feature_rows = [extract_url_features(u).as_dict() for u in df["url"]]
    features_df = pd.DataFrame(feature_rows)
    features_df["label"] = df["label"].values
    features_df["url"] = df["url"].values
    return features_df


def clean_and_split(
    path: str,
    test_size: float = 0.15,
    val_size: float = 0.15,
    random_seed: int = 42,
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, URLDatasetStats]:
    df = load_raw_url_csv(path)
    total_rows = len(df)

    df = df.dropna(subset=["url", "label"])
    missing_removed = total_rows - len(df)

    before_dedup = len(df)
    df = df.drop_duplicates(subset=["url"])
    duplicates_removed = before_dedup - len(df)

    df["label"] = df["label"].apply(normalize_label)
    features_df = build_feature_frame(df)

    train_df, temp_df = train_test_split(
        features_df, test_size=(test_size + val_size), random_state=random_seed,
        stratify=features_df["label"],
    )
    relative_test = test_size / (test_size + val_size)
    val_df, test_df = train_test_split(
        temp_df, test_size=relative_test, random_state=random_seed, stratify=temp_df["label"]
    )

    stats = URLDatasetStats(
        source_path=path,
        total_rows=total_rows,
        duplicates_removed=duplicates_removed,
        missing_removed=missing_removed,
        final_rows=len(df),
        class_distribution=df["label"].value_counts().to_dict(),
    )
    logger.info("URL dataset loaded: %s", stats)
    return train_df, val_df, test_df, stats

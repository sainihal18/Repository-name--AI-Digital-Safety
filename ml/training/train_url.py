"""
Train the URL model configured as `url.active_model` in
config/model_config.yaml.

Usage:
    python ml/training/train_url.py
    python ml/training/train_url.py --model gradient_boosting

IMPORTANT: data/raw/url_sample.csv shipped in this repo is a tiny
illustrative placeholder (30 rows) for smoke-testing this exact script —
NOT a real dataset. See data/docs/dataset_cards/url_phishing_dataset.md
for real public sources (PhiUSIIL on UCI, Kaggle Phishing URLs Dataset).
"""
from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from ml.url.datasets import clean_and_split, load_raw_url_csv
from ml.url.models.model_registry import build_model, load_model_config
from ml.training.config import Paths
from ml.utils.model_utils import generate_version_tag, write_json

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("train_url")


def main() -> None:
    parser = argparse.ArgumentParser(description="Train the URL scam-detection model.")
    parser.add_argument("--data", default=Paths().url_csv, help="Path to URL CSV (url,label)")
    parser.add_argument("--model", default=None, help="Override url.active_model from config")
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    logger.info("Loading and splitting dataset from %s", args.data)
    train_df, val_df, test_df, stats = clean_and_split(args.data, random_seed=args.seed)
    logger.info(
        "Dataset stats: total=%d duplicates_removed=%d missing_removed=%d final=%d classes=%s",
        stats.total_rows, stats.duplicates_removed, stats.missing_removed,
        stats.final_rows, stats.class_distribution,
    )
    logger.info("Split sizes: train=%d val=%d test=%d", len(train_df), len(val_df), len(test_df))

    model_name = args.model or load_model_config()["url"]["active_model"]
    logger.info("Building model: %s", model_name)
    model = build_model(model_name)

    logger.info("Fitting model on %d training examples (pre-extracted features)...", len(train_df))
    model.fit_from_features(train_df, train_df["label"].tolist())

    version = generate_version_tag(f"url-{model_name}")
    out_dir = str(Path(Paths().url_models_dir) / model_name)
    model.save(out_dir, version=version)
    logger.info("Saved model to %s (version=%s)", out_dir, version)

    write_json(
        str(Path(Paths().reports_dir) / "url_dataset_stats.json"),
        {
            "source_path": stats.source_path,
            "total_rows": stats.total_rows,
            "duplicates_removed": stats.duplicates_removed,
            "missing_removed": stats.missing_removed,
            "final_rows": stats.final_rows,
            "class_distribution": {str(k): v for k, v in stats.class_distribution.items()},
            "train_size": len(train_df), "val_size": len(val_df), "test_size": len(test_df),
            "model_version": version,
            "random_seed": args.seed,
        },
    )

    # We need the ORIGINAL urls (not just features) for evaluate_url.py to
    # re-run through the full analyzer pipeline, so re-derive the raw test
    # URLs using the same seed/split ratios from the raw file.
    raw_df = load_raw_url_csv(args.data)
    raw_df.to_csv(str(Path(Paths().reports_dir).parent / "data" / "raw" / "_url_raw_cache.csv"), index=False)
    test_df.to_csv(str(Path(Paths().reports_dir).parent / "data" / "processed" / "url_test_split_features.csv"), index=False)
    logger.info("Wrote held-out test split for evaluate_url.py. Training complete.")


if __name__ == "__main__":
    main()

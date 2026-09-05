"""
Train the SMS model configured as `sms.active_model` in
config/model_config.yaml.

Usage:
    python ml/training/train_sms.py
    python ml/training/train_sms.py --model tfidf_logistic_regression

IMPORTANT: data/raw/sms_sample.csv shipped in this repo is a tiny
illustrative placeholder (30 rows) for smoke-testing this exact script —
it is NOT a real dataset and models trained on it should not be evaluated
as if they were production-ready. Point --data at the real UCI SMS Spam
Collection (or another properly licensed dataset) before training
anything you intend to actually deploy or report metrics on. See
data/docs/dataset_cards/sms_spam_collection.md.
"""
from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from ml.sms.datasets import clean_and_split
from ml.sms.models.model_registry import build_model, load_model_config
from ml.training.config import Paths
from ml.utils.model_utils import generate_version_tag, write_json

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("train_sms")


def main() -> None:
    parser = argparse.ArgumentParser(description="Train the SMS scam-detection model.")
    parser.add_argument("--data", default=Paths().sms_csv, help="Path to SMS CSV (label,message or v1,v2)")
    parser.add_argument("--model", default=None, help="Override sms.active_model from config")
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

    model_name = args.model or load_model_config()["sms"]["active_model"]
    logger.info("Building model: %s", model_name)
    model = build_model(model_name)

    logger.info("Fitting model on %d training examples...", len(train_df))
    model.fit(train_df["message"].tolist(), train_df["label"].tolist())

    version = generate_version_tag(f"sms-{model_name}")
    out_dir = str(Path(Paths().sms_models_dir) / model_name)
    model.save(out_dir, version=version)
    logger.info("Saved model to %s (version=%s)", out_dir, version)

    write_json(
        str(Path(Paths().reports_dir) / "sms_dataset_stats.json"),
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

    # Held out for evaluate_sms.py — write the test split so evaluation is
    # reproducible and never re-derives its own (potentially leaky) split.
    test_df.to_csv(str(Path(Paths().reports_dir).parent / "data" / "processed" / "sms_test_split.csv"), index=False)
    logger.info("Wrote held-out test split for evaluate_sms.py. Training complete.")


if __name__ == "__main__":
    main()

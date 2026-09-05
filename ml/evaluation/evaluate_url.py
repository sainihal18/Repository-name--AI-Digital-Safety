"""
Evaluate the trained URL model on the held-out test split written by
train_url.py.

Usage:
    python ml/training/evaluate_url.py
"""
from __future__ import annotations

import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

import pandas as pd

from ml.evaluation.confusion_matrix import plot_confusion_matrix
from ml.evaluation.metrics import compute_metrics
from ml.url.models.model_registry import get_active_model_name, load_active_model
from ml.training.config import Paths
from ml.utils.model_utils import write_json

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("evaluate_url")


def main() -> None:
    features_path = Path(Paths().reports_dir).parent / "data" / "processed" / "url_test_split_features.csv"
    raw_cache_path = Path(Paths().reports_dir).parent / "data" / "raw" / "_url_raw_cache.csv"
    if not features_path.exists() or not raw_cache_path.exists():
        raise FileNotFoundError(
            f"No test split found. Run `python ml/training/train_url.py` first."
        )

    features_df = pd.read_csv(features_path)
    raw_df = pd.read_csv(raw_cache_path)
    logger.info("Loaded %d held-out test examples.", len(features_df))

    model = load_active_model()
    model_name = get_active_model_name()
    logger.info("Evaluating model: %s (%s)", model.name, model_name)

    urls = features_df["url"].tolist()
    y_true = features_df["label"].tolist()

    proba = model.predict_proba(urls)
    y_scam_proba = [float(p[1]) for p in proba]
    y_pred = [int(p >= 0.5) for p in y_scam_proba]

    metrics = compute_metrics(y_true, y_pred, y_scam_proba)
    metrics["model_name"] = model.name
    metrics["model_type"] = model_name
    logger.info("Metrics: %s", metrics)

    reports_dir = Path(Paths().reports_dir)
    reports_dir.mkdir(parents=True, exist_ok=True)
    write_json(str(reports_dir / "url_metrics.json"), metrics)
    plot_confusion_matrix(
        metrics["confusion_matrix"], "URL Model Confusion Matrix",
        str(reports_dir / "url_confusion_matrix.png"),
    )
    logger.info("Wrote reports/url_metrics.json and reports/url_confusion_matrix.png")


if __name__ == "__main__":
    main()

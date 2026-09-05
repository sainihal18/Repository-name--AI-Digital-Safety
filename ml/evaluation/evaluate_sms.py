"""
Evaluate the trained SMS model on the held-out test split written by
train_sms.py (never re-derives its own split — that would risk silently
using different data than what the model actually never saw).

Usage:
    python ml/training/evaluate_sms.py
"""
from __future__ import annotations

import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

import pandas as pd

from ml.evaluation.confusion_matrix import plot_confusion_matrix
from ml.evaluation.metrics import compute_metrics
from ml.sms.models.model_registry import get_active_model_name, load_active_model
from ml.training.config import Paths
from ml.utils.model_utils import write_json

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("evaluate_sms")


def main() -> None:
    test_split_path = Path(Paths().reports_dir).parent / "data" / "processed" / "sms_test_split.csv"
    if not test_split_path.exists():
        raise FileNotFoundError(
            f"No test split found at {test_split_path}. Run `python ml/training/train_sms.py` first."
        )
    test_df = pd.read_csv(test_split_path)
    logger.info("Loaded %d held-out test examples.", len(test_df))

    model = load_active_model()
    model_name = get_active_model_name()
    logger.info("Evaluating model: %s (%s)", model.name, model_name)

    texts = test_df["message"].astype(str).tolist()
    y_true = test_df["label"].tolist()

    proba = model.predict_proba(texts)
    y_scam_proba = [float(p[1]) for p in proba]
    y_pred = [int(p >= 0.5) for p in y_scam_proba]

    metrics = compute_metrics(y_true, y_pred, y_scam_proba)
    metrics["model_name"] = model.name
    metrics["model_type"] = model_name
    logger.info("Metrics: %s", metrics)

    reports_dir = Path(Paths().reports_dir)
    reports_dir.mkdir(parents=True, exist_ok=True)
    write_json(str(reports_dir / "sms_metrics.json"), metrics)
    plot_confusion_matrix(
        metrics["confusion_matrix"], "SMS Model Confusion Matrix",
        str(reports_dir / "sms_confusion_matrix.png"),
    )
    logger.info("Wrote reports/sms_metrics.json and reports/sms_confusion_matrix.png")


if __name__ == "__main__":
    main()

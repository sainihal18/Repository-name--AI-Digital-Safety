"""
Evaluation metrics — precision/recall/F1/ROC-AUC/confusion matrix.

Per the spec, cybersecurity evaluation should emphasize precision/recall/
F1, not accuracy alone (a 95%-ham dataset gets 95% "accuracy" by always
predicting ham, which is useless — these metrics are reported alongside
accuracy specifically so that failure mode is visible).
"""
from __future__ import annotations

from typing import List

from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    average_precision_score,
)


def compute_metrics(y_true: List[int], y_pred: List[int], y_proba: List[float] | None = None) -> dict:
    metrics = {
        "accuracy": round(accuracy_score(y_true, y_pred), 4),
        "precision": round(precision_score(y_true, y_pred, zero_division=0), 4),
        "recall": round(recall_score(y_true, y_pred, zero_division=0), 4),
        "f1": round(f1_score(y_true, y_pred, zero_division=0), 4),
    }
    if y_proba is not None and len(set(y_true)) > 1:
        try:
            metrics["roc_auc"] = round(roc_auc_score(y_true, y_proba), 4)
            metrics["pr_auc"] = round(average_precision_score(y_true, y_proba), 4)
        except ValueError:
            metrics["roc_auc"] = None
            metrics["pr_auc"] = None
    else:
        metrics["roc_auc"] = None
        metrics["pr_auc"] = None

    cm = confusion_matrix(y_true, y_pred, labels=[0, 1])
    tn, fp, fn, tp = cm.ravel() if cm.size == 4 else (0, 0, 0, 0)
    metrics["confusion_matrix"] = {
        "true_negative": int(tn), "false_positive": int(fp),
        "false_negative": int(fn), "true_positive": int(tp),
    }
    metrics["sample_count"] = len(y_true)
    return metrics

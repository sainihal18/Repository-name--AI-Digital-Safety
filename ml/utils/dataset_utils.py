"""Dataset splitting/balancing helpers shared by SMS and URL pipelines."""
from __future__ import annotations

from collections import Counter
from typing import List


def class_distribution(labels: List[int]) -> dict:
    return dict(Counter(labels))


def compute_class_weights(labels: List[int]) -> dict:
    """Inverse-frequency class weights — same effect as sklearn's
    class_weight='balanced', exposed separately for models/report-writing
    that want the explicit numbers (e.g. for the dataset card)."""
    counts = Counter(labels)
    n = len(labels)
    n_classes = len(counts)
    return {cls: n / (n_classes * count) for cls, count in counts.items()}

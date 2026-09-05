"""
Generic trainer base class.

train_sms.py / train_url.py are simple enough to not strictly need this,
but it's provided for future models (screenshot/OCR, email, etc.) that
will want a shared fit/validate/early-stopping loop rather than each
reimplementing one.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, List


@dataclass
class EarlyStoppingConfig:
    patience: int = 2
    min_delta: float = 0.001


class BaseTrainer(ABC):
    def __init__(self, early_stopping: EarlyStoppingConfig | None = None):
        self.early_stopping = early_stopping or EarlyStoppingConfig()
        self._best_score = -float("inf")
        self._epochs_without_improvement = 0

    @abstractmethod
    def train_epoch(self, *args: Any, **kwargs: Any) -> float:
        """Run one epoch, return a validation score (higher = better)."""
        raise NotImplementedError

    def should_stop(self, val_score: float) -> bool:
        if val_score > self._best_score + self.early_stopping.min_delta:
            self._best_score = val_score
            self._epochs_without_improvement = 0
            return False
        self._epochs_without_improvement += 1
        return self._epochs_without_improvement >= self.early_stopping.patience

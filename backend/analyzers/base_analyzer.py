"""
Abstract analyzer interface.

Both SMSAnalyzer and URLAnalyzer implement `analyze()` returning the same
AnalysisReport shape, so backend/services/analysis_service.py never needs
to know which one it's calling.
"""
from __future__ import annotations

from abc import ABC, abstractmethod

from backend.models.schemas import AnalysisReport


class BaseAnalyzer(ABC):
    @abstractmethod
    def analyze(self, content: str) -> AnalysisReport:
        raise NotImplementedError

"""
Analysis service — the orchestration layer FastAPI endpoints call into.
Keeps endpoints thin (HTTP concerns only) and analyzers pure (no DB/HTTP
concerns), per standard service-layer separation.
"""
from __future__ import annotations

from sqlalchemy.orm import Session

from backend.analyzers.sms_analyzer import SMSAnalyzer
from backend.analyzers.url_analyzer import URLAnalyzer
from backend.database import crud
from backend.logging_config.logger import log_event
from backend.models.schemas import AnalysisReport
from backend.security.validators import validate_sms_input, validate_url_input
import logging

logger = logging.getLogger("ai_digital_safety")

# Analyzers load their ML models once at import time (singleton pattern) —
# loading a model per-request would be needlessly slow.
_sms_analyzer = SMSAnalyzer()
_url_analyzer = URLAnalyzer()


def analyze_sms(db: Session, message: str) -> AnalysisReport:
    clean = validate_sms_input(message)
    report = _sms_analyzer.analyze(clean)
    crud.save_analysis(db, report, raw_content=clean)
    log_event(logger, "analysis_completed", analysis_id=report.analysis_id,
              type="SMS", risk_score=report.risk_score, verdict=report.verdict.value)
    return report


def analyze_url(db: Session, url: str) -> AnalysisReport:
    clean = validate_url_input(url)
    report = _url_analyzer.analyze(clean)
    crud.save_analysis(db, report, raw_content=clean)
    log_event(logger, "analysis_completed", analysis_id=report.analysis_id,
              type="URL", risk_score=report.risk_score, verdict=report.verdict.value)
    return report


def reload_models() -> None:
    """Called after training completes so a running API picks up a newly
    trained model without a full restart."""
    global _sms_analyzer, _url_analyzer
    _sms_analyzer = SMSAnalyzer()
    _url_analyzer = URLAnalyzer()

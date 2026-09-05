"""
CRUD operations. Privacy gate lives here: raw content never reaches the
database unless STORE_ANALYSIS=true, and even then only as a hash plus
the already-anonymized JSON report (which itself never contains raw
message/URL text — see backend/models/schemas.py).
"""
from __future__ import annotations

import json
from typing import List, Optional

from sqlalchemy.orm import Session

from backend.models.database import Analysis, Feedback, SystemEvent, ThreatIntelligenceResult
from backend.models.schemas import AnalysisReport, FeedbackRequest
from backend.security.privacy import hash_content, should_store_analysis


def save_analysis(db: Session, report: AnalysisReport, raw_content: str) -> Optional[Analysis]:
    if not should_store_analysis():
        return None

    record = Analysis(
        analysis_id=report.analysis_id,
        timestamp=report.timestamp,
        input_type=report.input_type.value,
        verdict=report.verdict.value,
        risk_score=report.risk_score,
        confidence=report.confidence,
        category=report.category.value,
        model_name=report.model.name,
        model_version=report.model.version,
        dataset_version=report.dataset_version,
        feature_version=report.feature_version,
        risk_engine_version=report.risk_engine_version,
        content_hash=hash_content(raw_content),
        report_json=report.model_dump_json(),
    )
    db.add(record)

    for ti in report.threat_intelligence:
        db.add(ThreatIntelligenceResult(
            analysis_id=report.analysis_id,
            source=ti.source,
            query_status=ti.query_status.value,
            known_malicious=ti.known_malicious,
            threat_type=ti.threat_type,
            reputation=ti.reputation,
            error_status=ti.error_status,
        ))

    db.commit()
    db.refresh(record)
    return record


def get_analysis(db: Session, analysis_id: str) -> Optional[Analysis]:
    return db.query(Analysis).filter(Analysis.analysis_id == analysis_id).first()


def save_feedback(db: Session, feedback: FeedbackRequest) -> Feedback:
    record = Feedback(
        analysis_id=feedback.analysis_id,
        label=feedback.label.value,
        comment=feedback.comment,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_statistics(db: Session) -> dict:
    analyses: List[Analysis] = db.query(Analysis).all()
    total = len(analyses)
    if total == 0:
        return {
            "total_scans": 0, "sms_scans": 0, "url_scans": 0,
            "high_risk_count": 0, "suspicious_count": 0, "unknown_count": 0,
            "low_risk_count": 0, "average_risk_score": 0.0,
            "false_positive_feedback": 0, "false_negative_feedback": 0,
            "top_categories": {},
        }

    sms_scans = sum(1 for a in analyses if a.input_type == "SMS")
    url_scans = sum(1 for a in analyses if a.input_type == "URL")
    verdict_counts = {"HIGH RISK": 0, "SUSPICIOUS": 0, "UNKNOWN": 0, "LOW RISK": 0}
    for a in analyses:
        if a.verdict in verdict_counts:
            verdict_counts[a.verdict] += 1

    categories: dict = {}
    for a in analyses:
        categories[a.category] = categories.get(a.category, 0) + 1

    fp = db.query(Feedback).filter(Feedback.label == "FALSE_POSITIVE").count()
    fn = db.query(Feedback).filter(Feedback.label == "FALSE_NEGATIVE").count()

    return {
        "total_scans": total,
        "sms_scans": sms_scans,
        "url_scans": url_scans,
        "high_risk_count": verdict_counts["HIGH RISK"],
        "suspicious_count": verdict_counts["SUSPICIOUS"],
        "unknown_count": verdict_counts["UNKNOWN"],
        "low_risk_count": verdict_counts["LOW RISK"],
        "average_risk_score": round(sum(a.risk_score for a in analyses) / total, 2),
        "false_positive_feedback": fp,
        "false_negative_feedback": fn,
        "top_categories": categories,
    }


def log_system_event(db: Session, event: str, detail: dict) -> None:
    db.add(SystemEvent(event=event, detail_json=json.dumps(detail)))
    db.commit()

"""
Feedback service. Stores feedback separately from training data — per
the spec, user feedback never automatically retrains production models.
A human reviews `feedback.reviewed=False` rows before any of it feeds
into a future labeled dataset.
"""
from __future__ import annotations

import uuid

from sqlalchemy.orm import Session

from backend.database import crud
from backend.models.schemas import FeedbackRequest, FeedbackResponse


def submit_feedback(db: Session, feedback: FeedbackRequest) -> FeedbackResponse:
    record = crud.save_feedback(db, feedback)
    return FeedbackResponse(
        feedback_id=record.feedback_id,
        analysis_id=feedback.analysis_id,
        stored=True,
    )

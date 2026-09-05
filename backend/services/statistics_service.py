"""
Statistics service — powers GET /api/v1/statistics.
"""
from __future__ import annotations

from sqlalchemy.orm import Session

from backend.database import crud
from backend.models.schemas import StatisticsResponse


def get_statistics(db: Session) -> StatisticsResponse:
    stats = crud.get_statistics(db)
    return StatisticsResponse(**stats)

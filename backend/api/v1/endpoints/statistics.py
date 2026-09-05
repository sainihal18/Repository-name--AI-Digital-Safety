from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.models.schemas import StatisticsResponse
from backend.services.statistics_service import get_statistics

router = APIRouter()


@router.get("/statistics", response_model=StatisticsResponse)
def statistics_endpoint(db: Session = Depends(get_db)):
    return get_statistics(db)

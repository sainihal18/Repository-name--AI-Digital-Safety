from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.models.schemas import FeedbackRequest, FeedbackResponse
from backend.services.feedback_service import submit_feedback

router = APIRouter()


@router.post("/feedback", response_model=FeedbackResponse)
def feedback_endpoint(request: FeedbackRequest, db: Session = Depends(get_db)):
    return submit_feedback(db, request)

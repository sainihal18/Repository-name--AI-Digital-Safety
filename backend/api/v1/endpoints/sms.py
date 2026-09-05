from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.models.schemas import AnalysisReport, SMSAnalyzeRequest
from backend.security.validators import ValidationError
from backend.services.analysis_service import analyze_sms

router = APIRouter()


@router.post("/analyze/sms", response_model=AnalysisReport)
def analyze_sms_endpoint(request: SMSAnalyzeRequest, db: Session = Depends(get_db)):
    try:
        return analyze_sms(db, request.message)
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.models.schemas import AnalysisReport, URLAnalyzeRequest
from backend.security.validators import ValidationError
from backend.services.analysis_service import analyze_url

router = APIRouter()


@router.post("/analyze/url", response_model=AnalysisReport)
def analyze_url_endpoint(request: URLAnalyzeRequest, db: Session = Depends(get_db)):
    try:
        return analyze_url(db, request.url)
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

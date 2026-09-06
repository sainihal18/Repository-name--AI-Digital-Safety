import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import crud
from backend.database.session import get_db

router = APIRouter()


@router.get("/analysis")
def get_history_endpoint(db: Session = Depends(get_db)):
    return crud.get_history(db)


@router.get("/analysis/{analysis_id}")
def get_analysis_endpoint(analysis_id: str, db: Session = Depends(get_db)):
    record = crud.get_analysis(db, analysis_id)
    if record is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "Analysis not found. Either the ID is incorrect, or STORE_ANALYSIS "
                "was disabled at the time of the original analysis (results are not "
                "persisted by default for privacy)."
            ),
        )
    return json.loads(record.report_json) if record.report_json else {
        "analysis_id": record.analysis_id, "note": "Report body was not stored."
    }

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from backend.database.session import get_db
from backend.models.schemas import HealthResponse
from ml.sms.models import model_registry as sms_registry
from ml.url.models import model_registry as url_registry

router = APIRouter()


@router.get("/", response_model=dict)
def root():
    return {
        "app": "AI Digital Safety",
        "tagline": "Analyze Before You Trust.",
        "docs": "/docs",
        "health": "/health",
    }


@router.get("/health", response_model=HealthResponse)
def health(db: Session = Depends(get_db)):
    models_loaded = True
    try:
        sms_registry.load_active_model()
        url_registry.load_active_model()
    except FileNotFoundError:
        models_loaded = False

    database_ok = True
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        database_ok = False

    return HealthResponse(
        status="ok" if database_ok else "degraded",
        version="1.0.0-phase1",
        models_loaded=models_loaded,
        database_ok=database_ok,
    )

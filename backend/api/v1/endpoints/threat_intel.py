from fastapi import APIRouter

from backend.models.schemas import ThreatIntelStatusResponse
from backend.services.threat_intel_service import get_status

router = APIRouter()


@router.get("/threat-intelligence/status", response_model=ThreatIntelStatusResponse)
def threat_intel_status_endpoint():
    return get_status()

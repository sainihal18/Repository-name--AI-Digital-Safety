"""Aggregates all v1 endpoints under a single router."""
from fastapi import APIRouter

from backend.api.v1.endpoints import (
    analysis, feedback, health, model_info, sms, statistics, threat_intel, url, image,
    password, scanner, honeypot, vault,
    email, qr, darkweb, copilot,
)

api_router = APIRouter()

# health.py defines "/" and "/health" un-prefixed (top-level), everything
# else lives under /api/v1 (mounted in backend/main.py).
api_router.include_router(sms.router, prefix="/api/v1", tags=["SMS"])
api_router.include_router(url.router, prefix="/api/v1", tags=["URL"])
api_router.include_router(analysis.router, prefix="/api/v1", tags=["Analysis"])
api_router.include_router(feedback.router, prefix="/api/v1", tags=["Feedback"])
api_router.include_router(model_info.router, prefix="/api/v1", tags=["Model Info"])
api_router.include_router(statistics.router, prefix="/api/v1", tags=["Statistics"])
api_router.include_router(threat_intel.router, prefix="/api/v1", tags=["Threat Intelligence"])
api_router.include_router(image.router, prefix="/api/v1", tags=["Image/Multimodal"])
api_router.include_router(password.router, prefix="/api/v1", tags=["Password"])
api_router.include_router(scanner.router, prefix="/api/v1", tags=["Scanner"])
api_router.include_router(honeypot.router, prefix="/api/v1", tags=["Honeypot"])
api_router.include_router(vault.router, prefix="/api/v1", tags=["Vault"])
api_router.include_router(email.router, prefix="/api/v1", tags=["Email Forensics"])
api_router.include_router(qr.router, prefix="/api/v1", tags=["QR Scanner"])
api_router.include_router(darkweb.router, prefix="/api/v1", tags=["Dark Web"])
api_router.include_router(copilot.router, prefix="/api/v1", tags=["Copilot"])

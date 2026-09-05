from fastapi import APIRouter

from backend.models.schemas import ModelInfoResponse
from backend.services.model_service import get_model_info

router = APIRouter()


@router.get("/model-info", response_model=ModelInfoResponse)
def model_info_endpoint():
    return get_model_info()

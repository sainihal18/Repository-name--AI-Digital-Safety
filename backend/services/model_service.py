"""
Model info service — powers GET /api/v1/model-info.
"""
from __future__ import annotations

import yaml
from pathlib import Path

from backend.models.schemas import ModelInfo, ModelInfoResponse
from ml.sms.models import model_registry as sms_registry
from ml.url.models import model_registry as url_registry

_RISK_CONFIG_PATH = Path(__file__).resolve().parents[2] / "config" / "risk_config.yaml"


def get_model_info() -> ModelInfoResponse:
    sms_name = sms_registry.get_active_model_name()
    url_name = url_registry.get_active_model_name()

    try:
        sms_model = sms_registry.load_active_model()
        sms_info = ModelInfo(name=sms_model.name, version=getattr(sms_model, "version", "unversioned"),
                              type=sms_model.model_type)
    except FileNotFoundError:
        sms_info = ModelInfo(name=f"sms-{sms_name}", version="not_trained", type=sms_name)

    try:
        url_model = url_registry.load_active_model()
        url_info = ModelInfo(name=url_model.name, version=getattr(url_model, "version", "unversioned"),
                              type=url_model.model_type)
    except FileNotFoundError:
        url_info = ModelInfo(name=f"url-{url_name}", version="not_trained", type=url_name)

    with open(_RISK_CONFIG_PATH) as f:
        risk_version = yaml.safe_load(f)["version"]

    return ModelInfoResponse(
        sms_model=sms_info,
        url_model=url_info,
        risk_engine_version=risk_version,
        feature_versions={"sms": "sms-features-v1", "url": "url-features-v1"},
    )

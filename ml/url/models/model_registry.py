"""
URL model registry — mirrors ml/sms/models/model_registry.py.
"""
from __future__ import annotations

from pathlib import Path
from typing import Optional

import yaml

from ml.url.models.random_forest import RandomForestConfig, URLRandomForestModel

_CONFIG_PATH = Path(__file__).resolve().parents[3] / "config" / "model_config.yaml"
_MODELS_DIR = Path(__file__).resolve().parents[3] / "models" / "url"


def load_model_config() -> dict:
    with open(_CONFIG_PATH, "r") as f:
        return yaml.safe_load(f)


def get_active_model_name() -> str:
    return load_model_config()["url"]["active_model"]


def build_model(model_name: Optional[str] = None):
    cfg = load_model_config()["url"]
    model_name = model_name or cfg["active_model"]

    if model_name == "random_forest":
        params = cfg["random_forest"]
        return URLRandomForestModel(RandomForestConfig(**params))
    if model_name == "gradient_boosting":
        from ml.url.models.gradient_boosting import GradientBoostingConfig, URLGradientBoostingModel
        params = cfg["gradient_boosting"]
        return URLGradientBoostingModel(GradientBoostingConfig(**params))

    raise ValueError(
        f"Unknown url.active_model '{model_name}' in model_config.yaml. "
        f"Valid options: random_forest, gradient_boosting."
    )


def load_active_model():
    model_name = get_active_model_name()
    model_dir = _MODELS_DIR / model_name
    if not model_dir.exists() or not any(model_dir.iterdir()):
        raise FileNotFoundError(
            f"No trained '{model_name}' model found at {model_dir}. "
            f"Run: python ml/training/train_url.py"
        )
    if model_name == "random_forest":
        return URLRandomForestModel.load(str(model_dir))
    if model_name == "gradient_boosting":
        from ml.url.models.gradient_boosting import URLGradientBoostingModel
        return URLGradientBoostingModel.load(str(model_dir))
    raise ValueError(f"Unknown url.active_model '{model_name}'.")

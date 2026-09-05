"""Shared training configuration — reads config/model_config.yaml so every
training script uses the same hyperparameters as the model registry."""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import yaml

_ROOT = Path(__file__).resolve().parents[2]
CONFIG_PATH = _ROOT / "config" / "model_config.yaml"
DATA_RAW_DIR = _ROOT / "data" / "raw"
MODELS_DIR = _ROOT / "models"
REPORTS_DIR = _ROOT / "reports"


@dataclass
class Paths:
    sms_csv: str = str(DATA_RAW_DIR / "spam.csv")
    url_csv: str = str(DATA_RAW_DIR / "PhiUSIIL_Phishing_URL_Dataset.csv")
    sms_models_dir: str = str(MODELS_DIR / "sms")
    url_models_dir: str = str(MODELS_DIR / "url")
    reports_dir: str = str(REPORTS_DIR)


def load_full_config() -> dict:
    with open(CONFIG_PATH) as f:
        return yaml.safe_load(f)

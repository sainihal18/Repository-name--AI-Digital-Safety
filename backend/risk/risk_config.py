"""
Loads config/risk_config.yaml so weights/thresholds are configurable,
never hard-coded in the engine itself.
"""
from __future__ import annotations

from pathlib import Path

import yaml

_CONFIG_PATH = Path(__file__).resolve().parents[2] / "config" / "risk_config.yaml"


def load_risk_config() -> dict:
    with open(_CONFIG_PATH, "r") as f:
        return yaml.safe_load(f)

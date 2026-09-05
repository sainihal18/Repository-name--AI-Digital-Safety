"""
SMS model registry.

Reads config/model_config.yaml so switching MODEL_NAME (tfidf_logistic_
regression | distilbert | roberta) never requires touching calling code
in backend/analyzers/sms_analyzer.py — it always just asks the registry
for "the active model."
"""
from __future__ import annotations

from pathlib import Path
from typing import Optional

import yaml

from ml.sms.models.tfidf_lr import TfidfLogisticRegressionModel, TfidfLRConfig

_CONFIG_PATH = Path(__file__).resolve().parents[3] / "config" / "model_config.yaml"
_MODELS_DIR = Path(__file__).resolve().parents[3] / "models" / "sms"


def load_model_config() -> dict:
    with open(_CONFIG_PATH, "r") as f:
        return yaml.safe_load(f)


def get_active_model_name() -> str:
    return load_model_config()["sms"]["active_model"]


def build_model(model_name: Optional[str] = None):
    """Construct a fresh, untrained model of the requested type (or the
    configured active model). Transformer imports are lazy — only paid for
    if distilbert/roberta is actually selected."""
    cfg = load_model_config()["sms"]
    model_name = model_name or cfg["active_model"]

    if model_name == "tfidf_logistic_regression":
        params = cfg["tfidf_logistic_regression"]
        return TfidfLogisticRegressionModel(TfidfLRConfig(
            max_features=params["max_features"],
            ngram_range=tuple(params["ngram_range"]),
            C=params["C"],
            class_weight=params["class_weight"],
        ))
    if model_name == "distilbert":
        from ml.sms.models.distilbert import DistilBertSMSModel, TransformerConfig
        params = cfg["distilbert"]
        return DistilBertSMSModel(TransformerConfig(**params))
    if model_name == "roberta":
        from ml.sms.models.roberta import RoBERTaSMSModel, TransformerConfig
        params = cfg["roberta"]
        return RoBERTaSMSModel(TransformerConfig(**params))

    raise ValueError(
        f"Unknown sms.active_model '{model_name}' in model_config.yaml. "
        f"Valid options: tfidf_logistic_regression, distilbert, roberta."
    )


def load_active_model():
    """Load the currently active, already-trained model from disk for
    inference. Raises a clear error (never a silent fallback to an
    untrained model) if nothing has been trained yet."""
    model_name = get_active_model_name()
    model_dir = _MODELS_DIR / model_name
    if not model_dir.exists() or not any(model_dir.iterdir()):
        raise FileNotFoundError(
            f"No trained '{model_name}' model found at {model_dir}. "
            f"Run: python ml/training/train_sms.py"
        )
    if model_name == "tfidf_logistic_regression":
        return TfidfLogisticRegressionModel.load(str(model_dir))
    if model_name == "distilbert":
        from ml.sms.models.distilbert import DistilBertSMSModel
        return DistilBertSMSModel.load(str(model_dir))
    if model_name == "roberta":
        from ml.sms.models.roberta import RoBERTaSMSModel
        return RoBERTaSMSModel.load(str(model_dir))
    raise ValueError(f"Unknown sms.active_model '{model_name}'.")

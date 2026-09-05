"""
URL model: Gradient Boosting over lexical/structural features (alternative to Random Forest).
"""
from __future__ import annotations

import json
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import List

import joblib
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier

from ml.url.feature_extraction import URLFeatures, extract_url_features


@dataclass
class GradientBoostingConfig:
    n_estimators: int = 400
    max_depth: int = 6
    learning_rate: float = 0.05
    random_state: int = 42


class URLGradientBoostingModel:
    name = "url-gradient-boosting"
    model_type = "gradient_boosting"

    def __init__(self, config: GradientBoostingConfig | None = None):
        self.config = config or GradientBoostingConfig()
        self.classifier = GradientBoostingClassifier(
            n_estimators=self.config.n_estimators,
            max_depth=self.config.max_depth,
            learning_rate=self.config.learning_rate,
            random_state=self.config.random_state,
        )
        self.feature_names = URLFeatures.feature_names()
        self._fitted = False

    def _urls_to_matrix(self, urls: List[str]) -> pd.DataFrame:
        rows = [extract_url_features(u).as_dict() for u in urls]
        return pd.DataFrame(rows, columns=self.feature_names)

    def fit(self, urls: List[str], labels: List[int]) -> "URLGradientBoostingModel":
        X = self._urls_to_matrix(urls)
        self.classifier.fit(X, labels)
        self._fitted = True
        return self

    def fit_from_features(self, X: pd.DataFrame, labels: List[int]) -> "URLGradientBoostingModel":
        self.classifier.fit(X[self.feature_names], labels)
        self._fitted = True
        return self

    def predict_proba(self, urls: List[str]):
        if not self._fitted:
            raise RuntimeError("Model is not fitted/loaded yet.")
        X = self._urls_to_matrix(urls)
        return self.classifier.predict_proba(X)

    def predict(self, urls: List[str]) -> List[int]:
        proba = self.predict_proba(urls)
        return [int(p[1] >= 0.5) for p in proba]

    def feature_importance(self, top_k: int = 8) -> List[tuple]:
        if not self._fitted:
            return []
        importances = self.classifier.feature_importances_
        ranked = sorted(zip(self.feature_names, importances), key=lambda x: x[1], reverse=True)
        return ranked[:top_k]

    def top_features_for_url(self, url: str, top_k: int = 5) -> List[str]:
        """Local explainability: which features are both non-zero for this
        URL and globally important for the model. A lightweight stand-in
        for full SHAP when shap isn't installed (see explainability/shap_wrapper.py
        for the SHAP-based version)."""
        feats = extract_url_features(url).as_dict()
        importances = dict(zip(self.feature_names, self.classifier.feature_importances_))
        active = [(k, importances.get(k, 0)) for k, v in feats.items() if v not in (0, 0.0)]
        ranked = sorted(active, key=lambda x: x[1], reverse=True)
        return [k for k, _ in ranked[:top_k]]

    def save(self, directory: str, version: str) -> None:
        out = Path(directory)
        out.mkdir(parents=True, exist_ok=True)
        joblib.dump(self.classifier, out / "classifier.joblib")
        meta = {"name": self.name, "model_type": self.model_type, "version": version,
                "config": asdict(self.config), "feature_names": self.feature_names}
        (out / "metadata.json").write_text(json.dumps(meta, indent=2))

    @classmethod
    def load(cls, directory: str) -> "URLGradientBoostingModel":
        src = Path(directory)
        meta = json.loads((src / "metadata.json").read_text())
        model = cls(GradientBoostingConfig(**meta["config"]))
        model.classifier = joblib.load(src / "classifier.joblib")
        model.feature_names = meta["feature_names"]
        model._fitted = True
        return model

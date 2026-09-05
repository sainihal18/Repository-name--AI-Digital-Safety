"""
URL model: Random Forest over lexical/structural features (default).
"""
from __future__ import annotations

import json
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import List

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

from ml.url.feature_extraction import URLFeatures, extract_url_features


@dataclass
class RandomForestConfig:
    n_estimators: int = 300
    max_depth: int = 18
    class_weight: str = "balanced"
    random_state: int = 42


class URLRandomForestModel:
    name = "url-random-forest"
    model_type = "random_forest"

    def __init__(self, config: RandomForestConfig | None = None):
        self.config = config or RandomForestConfig()
        self.classifier = RandomForestClassifier(
            n_estimators=self.config.n_estimators,
            max_depth=self.config.max_depth,
            class_weight=self.config.class_weight,
            random_state=self.config.random_state,
            n_jobs=-1,
        )
        self.feature_names = URLFeatures.feature_names()
        self._fitted = False

    def _urls_to_matrix(self, urls: List[str]) -> pd.DataFrame:
        rows = [extract_url_features(u).as_dict() for u in urls]
        return pd.DataFrame(rows, columns=self.feature_names)

    def fit(self, urls: List[str], labels: List[int]) -> "URLRandomForestModel":
        X = self._urls_to_matrix(urls)
        self.classifier.fit(X, labels)
        self._fitted = True
        return self

    def fit_from_features(self, X: pd.DataFrame, labels: List[int]) -> "URLRandomForestModel":
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
    def load(cls, directory: str) -> "URLRandomForestModel":
        src = Path(directory)
        meta = json.loads((src / "metadata.json").read_text())
        model = cls(RandomForestConfig(**meta["config"]))
        model.classifier = joblib.load(src / "classifier.joblib")
        model.feature_names = meta["feature_names"]
        model._fitted = True
        
        # Alignment guard: if the feature schema changed since training,
        # raise a clear error rather than producing silent garbage predictions.
        expected = URLFeatures.feature_names()
        if model.feature_names != expected:
            raise ValueError(
                f"Saved model has {len(model.feature_names)} features "
                f"but URLFeatures defines {len(expected)}. "
                f"Re-train with: python ml/training/train_url.py"
            )
        return model

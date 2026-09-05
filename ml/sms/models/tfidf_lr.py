"""
Level 1 SMS model: TF-IDF + Logistic Regression baseline.

This is the model that actually runs in this environment without GPU or
internet access — it's also, per the spec, meant to be the baseline every
transformer model is compared against in reports/model_comparison.md.
"""
from __future__ import annotations

import json
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import List

import joblib
from sklearn.linear_model import LogisticRegression

from ml.sms.feature_extraction import build_tfidf_vectorizer


@dataclass
class TfidfLRConfig:
    max_features: int = 8000
    ngram_range: tuple = (1, 2)
    C: float = 1.0
    class_weight: str = "balanced"
    random_state: int = 42


class TfidfLogisticRegressionModel:
    """Thin wrapper so the training/evaluation/inference scripts can treat
    every SMS model (TF-IDF, DistilBERT, RoBERTa) through the same
    fit / predict_proba / save / load interface."""

    name = "sms-tfidf-logreg"
    model_type = "tfidf_logistic_regression"

    def __init__(self, config: TfidfLRConfig | None = None):
        self.config = config or TfidfLRConfig()
        self.vectorizer = build_tfidf_vectorizer(
            max_features=self.config.max_features, ngram_range=self.config.ngram_range
        )
        self.classifier = LogisticRegression(
            C=self.config.C,
            class_weight=self.config.class_weight,
            random_state=self.config.random_state,
            max_iter=1000,
        )
        self._fitted = False

    def fit(self, texts: List[str], labels: List[int]) -> "TfidfLogisticRegressionModel":
        X = self.vectorizer.fit_transform(texts)
        self.classifier.fit(X, labels)
        self._fitted = True
        return self

    def predict_proba(self, texts: List[str]):
        if not self._fitted:
            raise RuntimeError("Model is not fitted/loaded yet.")
        X = self.vectorizer.transform(texts)
        return self.classifier.predict_proba(X)  # columns: [P(ham), P(scam)]

    def predict(self, texts: List[str]) -> List[int]:
        proba = self.predict_proba(texts)
        return [int(p[1] >= 0.5) for p in proba]

    def top_features_for_text(self, text: str, top_k: int = 5) -> List[str]:
        """Explainability helper: which TF-IDF terms in this specific text
        contributed most to the classifier's decision (coefficient * tfidf
        weight). Used by backend/explainability/explainer.py."""
        if not self._fitted:
            return []
        X = self.vectorizer.transform([text])
        coefs = self.classifier.coef_[0]
        contributions = X.multiply(coefs).toarray()[0]
        feature_names = self.vectorizer.get_feature_names_out()
        ranked = sorted(
            ((feature_names[i], contributions[i]) for i in X.nonzero()[1]),
            key=lambda x: abs(x[1]),
            reverse=True,
        )
        return [term for term, weight in ranked[:top_k] if weight > 0]

    def save(self, directory: str, version: str) -> None:
        out = Path(directory)
        out.mkdir(parents=True, exist_ok=True)
        joblib.dump(self.vectorizer, out / "vectorizer.joblib")
        joblib.dump(self.classifier, out / "classifier.joblib")
        meta = {
            "name": self.name,
            "model_type": self.model_type,
            "version": version,
            "config": asdict(self.config),
        }
        (out / "metadata.json").write_text(json.dumps(meta, indent=2))

    @classmethod
    def load(cls, directory: str) -> "TfidfLogisticRegressionModel":
        src = Path(directory)
        meta = json.loads((src / "metadata.json").read_text())
        model = cls(TfidfLRConfig(**meta["config"]))
        model.vectorizer = joblib.load(src / "vectorizer.joblib")
        model.classifier = joblib.load(src / "classifier.joblib")
        model._fitted = True
        return model

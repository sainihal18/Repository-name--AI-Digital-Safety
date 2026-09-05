"""
Optional SHAP integration.

SHAP/LIME are explicitly optional per the spec. This wrapper degrades
gracefully to the model's built-in feature-importance explainer
(URLRandomForestModel.top_features_for_url) when the `shap` package isn't
installed, rather than failing the whole analysis.
"""
from __future__ import annotations

from typing import List, Optional


def shap_available() -> bool:
    try:
        import shap  # noqa: F401
        return True
    except ImportError:
        return False


def explain_url_with_shap(model, url: str, top_k: int = 5) -> Optional[List[str]]:
    if not shap_available():
        return None
    try:
        import shap
        explainer = shap.TreeExplainer(model.classifier)
        X = model._urls_to_matrix([url])
        shap_values = explainer.shap_values(X)
        # For binary classifiers shap_values is a list [class0, class1];
        # we want the contribution toward the "scam" class (index 1).
        contributions = shap_values[1][0] if isinstance(shap_values, list) else shap_values[0]
        ranked = sorted(zip(model.feature_names, contributions), key=lambda x: abs(x[1]), reverse=True)
        return [name for name, value in ranked[:top_k] if value > 0]
    except Exception:
        # Never let an explainability failure break the analysis itself.
        return None

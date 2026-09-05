"""
SMS analyzer — orchestrates the full pipeline described in the spec:

  SMS -> preprocessing -> rule engine -> ML -> risk engine ->
  explainability -> security report

If no trained ML model is available yet (fresh clone, before running
`python ml/training/train_sms.py`), the analyzer does NOT crash or
silently pretend to have a model — it falls back to rules-only scoring
and records this explicitly in `limitations`, exactly as the spec's
error-handling section requires ("missing model" is a normal, handled
case, not an unhandled exception).
"""
from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone

from backend.analyzers.base_analyzer import BaseAnalyzer
from backend.explainability.attack_chain import build_sms_attack_chain
from backend.explainability.explainer import build_recommendations, build_why_flagged, classify_category
from backend.models.schemas import AnalysisReport, Evidence, Explainability, ModelInfo
from backend.rules.rule_engine import evaluate_sms
from backend.rules.sms_rules import extract_entities
from backend.risk.risk_engine import compute_risk
from backend.risk.scam_dna import compute_sms_scam_dna
from ml.sms.models import model_registry
from ml.sms.preprocessing import preprocess_sms

logger = logging.getLogger("ai_digital_safety")

FEATURE_VERSION = "sms-features-v1"
RISK_ENGINE_VERSION = "v1.0"


class SMSAnalyzer(BaseAnalyzer):
    def __init__(self):
        self._model = None
        self._model_load_error: str | None = None
        self._try_load_model()

    def _try_load_model(self) -> None:
        try:
            self._model = model_registry.load_active_model()
        except FileNotFoundError as exc:
            self._model_load_error = str(exc)
            logger.warning("SMS ML model not loaded: %s", exc)

    def analyze(self, message: str) -> AnalysisReport:
        preprocessed = preprocess_sms(message)
        rule_result = evaluate_sms(preprocessed.raw_text)
        entities = extract_entities(preprocessed.raw_text)

        fired_types = [r["type"] for r in rule_result["raw_results"] if r["fired"]]

        limitations = [
            "This analysis is based on message text only; it cannot verify sender identity.",
            "A LOW RISK or UNKNOWN verdict is not a guarantee of safety.",
        ]

        model_info = ModelInfo(name="none", version="none", type="rules_only")
        if self._model is not None:
            ml_scam_proba, ml_confidence_raw = self._run_model(preprocessed.normalized_text)
            model_info = ModelInfo(
                name=self._model.name, version=getattr(self._model, "version", "unversioned"),
                type=self._model.model_type,
            )
        else:
            ml_scam_proba, ml_confidence_raw = 0.0, 0.0
            limitations.append(
                "No trained ML model is currently loaded — this result is based on the rule "
                "engine alone. Run `python ml/training/train_sms.py` to enable ML scoring."
            )

        risk = compute_risk(
            ml_confidence_scam=ml_scam_proba * 100,
            ml_confidence_raw=ml_confidence_raw * 100,
            ml_available=self._model is not None,
            rule_score=rule_result["rule_score"],
            fired_rule_count=rule_result["fired_count"],
            threat_intel_known_malicious=None,
            threat_intel_available=False,  # threat intel applies to URLs; SMS relies on rules+ML
        )
        limitations.extend(risk.explanation)

        evidence = [Evidence(**e) for e in rule_result["evidence"]]
        scam_dna = compute_sms_scam_dna(rule_result["raw_results"])
        attack_chain = build_sms_attack_chain(fired_types)
        recommendations = build_recommendations(evidence)
        category = classify_category(fired_types)

        # Phase 2: build the explainability block
        top_ml_features: list = []
        if self._model is not None and hasattr(self._model, "top_features_for_text"):
            try:
                top_ml_features = self._model.top_features_for_text(
                    preprocessed.normalized_text, top_k=5
                )
            except Exception:
                pass  # explainability must never break the analysis pipeline

        explainability = Explainability(
            flagged_reasons=build_why_flagged(evidence),
            top_ml_features=top_ml_features,
            rule_score=rule_result["rule_score"],
            ml_score=int(round(ml_scam_proba * 100)),
            fusion_method="weighted_average",
            threat_intel_contributed=False,
        )

        report = AnalysisReport(
            analysis_id=uuid.uuid4().hex,
            timestamp=datetime.now(timezone.utc),
            input_type="SMS",
            verdict=risk.verdict,
            risk_score=risk.risk_score,
            confidence=risk.confidence,
            category=category,
            evidence=evidence,
            suspicious_terms=rule_result["suspicious_terms"],
            extracted_urls=entities["urls"],
            extracted_entities=entities,
            scam_dna=scam_dna,
            attack_chain=attack_chain,
            recommended_actions=recommendations,
            explainability=explainability,
            model=model_info,
            feature_version=FEATURE_VERSION,
            risk_engine_version=RISK_ENGINE_VERSION,
            dataset_version=getattr(self._model, "dataset_version", None) if self._model else None,
            threat_intelligence=[],
            limitations=limitations,
            reason=risk.reason,
        )
        return report

    def _run_model(self, normalized_text: str):
        proba = self._model.predict_proba([normalized_text])[0]
        scam_proba = float(proba[1])
        confidence_raw = float(max(proba))
        return scam_proba, confidence_raw

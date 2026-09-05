"""
URL analyzer — mirrors sms_analyzer.py's orchestration pattern, with the
addition of threat-intelligence lookups. Threat-intel calls are wrapped
so a slow/unavailable external API degrades the analysis (UNAVAILABLE,
handled explicitly by the risk engine) rather than blocking or crashing it.
"""
from __future__ import annotations

import logging
import os
import uuid
from datetime import datetime, timezone

from backend.analyzers.base_analyzer import BaseAnalyzer
from backend.explainability.attack_chain import build_url_attack_chain
from backend.explainability.explainer import build_recommendations, build_why_flagged, classify_category
from backend.intelligence.threat_intel_aggregator import query_all_sources
from backend.models.schemas import AnalysisReport, Evidence, Explainability, ModelInfo
from backend.rules.rule_engine import evaluate_url
from backend.risk.risk_engine import compute_risk
from backend.risk.scam_dna import compute_url_scam_dna
from ml.url.models import model_registry

logger = logging.getLogger("ai_digital_safety")

FEATURE_VERSION = "url-features-v1"
RISK_ENGINE_VERSION = "v1.0"


class URLAnalyzer(BaseAnalyzer):
    def __init__(self):
        self._model = None
        self._try_load_model()

    def _try_load_model(self) -> None:
        try:
            self._model = model_registry.load_active_model()
        except FileNotFoundError as exc:
            logger.warning("URL ML model not loaded: %s", exc)

    def analyze(self, url: str) -> AnalysisReport:
        rule_result = evaluate_url(url)
        fired_types = [r["type"] for r in rule_result["raw_results"] if r["fired"]]

        limitations = [
            "This analysis inspects the URL string and (if enabled) threat-intel reputation only; "
            "the destination page is never visited or executed.",
            "Absence from a threat-intelligence database does not confirm the URL is safe.",
            "This tool cannot identify the private owner of a domain or the physical location of an attacker.",
        ]

        model_info = ModelInfo(name="none", version="none", type="rules_only")
        if self._model is not None:
            ml_scam_proba, ml_confidence_raw = self._run_model(url)
            model_info = ModelInfo(
                name=self._model.name, version=getattr(self._model, "version", "unversioned"),
                type=self._model.model_type,
            )
        else:
            ml_scam_proba, ml_confidence_raw = 0.0, 0.0
            limitations.append(
                "No trained ML model is currently loaded — this result is based on the rule "
                "engine alone. Run `python ml/training/train_url.py` to enable ML scoring."
            )

        threat_intel = query_all_sources(url) if os.getenv("THREAT_INTEL_ENABLED", "true").lower() == "true" else None
        ti_results = threat_intel.results if threat_intel else []
        ti_available = threat_intel.overall_available if threat_intel else False
        ti_malicious = threat_intel.overall_known_malicious if threat_intel else None
        if not ti_available:
            limitations.append("Threat intelligence sources were unavailable or disabled for this analysis.")

        risk = compute_risk(
            ml_confidence_scam=ml_scam_proba * 100,
            ml_confidence_raw=ml_confidence_raw * 100,
            ml_available=self._model is not None,
            rule_score=rule_result["rule_score"],
            fired_rule_count=rule_result["fired_count"],
            threat_intel_known_malicious=ti_malicious,
            threat_intel_available=ti_available,
        )
        limitations.extend(risk.explanation)

        evidence = [Evidence(**e) for e in rule_result["evidence"]]
        scam_dna = compute_url_scam_dna(rule_result["raw_results"])
        attack_chain = build_url_attack_chain(fired_types)
        recommendations = build_recommendations(evidence)
        category = classify_category(fired_types)

        # Phase 2: build the explainability block
        top_ml_features: list = []
        if self._model is not None and hasattr(self._model, "top_features_for_url"):
            try:
                top_ml_features = self._model.top_features_for_url(url, top_k=5)
            except Exception:
                pass  # explainability must never break the analysis pipeline

        ml_score_int = int(round(ml_scam_proba * 100)) if self._model is not None else 0
        explainability = Explainability(
            flagged_reasons=build_why_flagged(evidence),
            top_ml_features=top_ml_features,
            rule_score=rule_result["rule_score"],
            ml_score=ml_score_int,
            fusion_method="weighted_average",
            threat_intel_contributed=ti_available,
        )

        report = AnalysisReport(
            analysis_id=uuid.uuid4().hex,
            timestamp=datetime.now(timezone.utc),
            input_type="URL",
            verdict=risk.verdict,
            risk_score=risk.risk_score,
            confidence=risk.confidence,
            category=category,
            evidence=evidence,
            suspicious_terms=rule_result["suspicious_terms"],
            extracted_urls=[url],
            extracted_entities={},
            scam_dna=scam_dna,
            attack_chain=attack_chain,
            recommended_actions=recommendations,
            explainability=explainability,
            model=model_info,
            feature_version=FEATURE_VERSION,
            risk_engine_version=RISK_ENGINE_VERSION,
            dataset_version=getattr(self._model, "dataset_version", None) if self._model else None,
            threat_intelligence=ti_results,
            limitations=limitations,
            reason=risk.reason,
        )
        return report

    def _run_model(self, url: str):
        proba = self._model.predict_proba([url])[0]
        scam_proba = float(proba[1])
        confidence_raw = float(max(proba))
        return scam_proba, confidence_raw

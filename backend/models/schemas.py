"""
Pydantic schemas — the API contract.

Every analysis response follows the "Professional Security Report" shape
required by the project spec: verdict + risk score are never returned
alone. Evidence, Scam DNA, attack chain, model provenance, and
limitations always travel together so the frontend (and the user) can
see *why*, not just *what*.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator

from backend.models.enums import (
    FeedbackLabel,
    InputType,
    ScamCategory,
    Severity,
    ThreatIntelStatus,
    Verdict,
)

# --------------------------------------------------------------------------
# Requests
# --------------------------------------------------------------------------


class SMSAnalyzeRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="Raw SMS text")
    sender: Optional[str] = Field(None, max_length=64, description="Sender ID/number if known")

    @field_validator("message")
    @classmethod
    def not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("message must not be blank")
        return v


class URLAnalyzeRequest(BaseModel):
    url: str = Field(..., min_length=4, max_length=2048, description="URL string to analyze")

    @field_validator("url")
    @classmethod
    def not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("url must not be blank")
        return v


class FeedbackRequest(BaseModel):
    analysis_id: str
    label: FeedbackLabel
    comment: Optional[str] = Field(None, max_length=500)


# --------------------------------------------------------------------------
# Shared response building blocks
# --------------------------------------------------------------------------


class Evidence(BaseModel):
    type: str
    severity: Severity
    description: str


class ScamDNA(BaseModel):
    """
    Structured, non-random indicator scores (0-100). Every value here must
    be derived from actual rule/model evidence — never randomly generated.
    """
    urgency: int = 0
    fear_intimidation: int = 0
    financial_pressure: int = 0
    reward_manipulation: int = 0
    credential_harvesting: int = 0
    otp_targeting: int = 0
    impersonation: int = 0
    authority_abuse: int = 0
    social_engineering: int = 0
    external_link_usage: int = 0
    call_to_action_pressure: int = 0
    brand_impersonation: int = 0  # URL-side signal, 0 for pure SMS text


class AttackChainStep(BaseModel):
    stage: str
    description: str


class ModelInfo(BaseModel):
    name: str
    version: str
    type: str  # e.g. "tfidf_logistic_regression", "transformer", "gradient_boosting"
    device: Optional[str] = None


class ThreatIntelResult(BaseModel):
    source: str
    query_status: ThreatIntelStatus
    known_malicious: Optional[bool] = None
    threat_type: Optional[str] = None
    reputation: Optional[str] = None
    timestamp: Optional[str] = None
    error_status: Optional[str] = None


class Explainability(BaseModel):
    """Structured explainability block: what rules fired, why the ML model
    produced the score it did, and how the signals were fused.

    Every field traces back to actual computed evidence — never invented.
    Absence of flagged_reasons means the message had no detectable scam signals.
    """
    flagged_reasons: List[str] = Field(
        default_factory=list,
        description=(
            "Short human-readable labels for each rule that fired "
            "(e.g. 'Urgency', 'OTP targeting'). Empty for clean messages."
        ),
    )
    top_ml_features: List[str] = Field(
        default_factory=list,
        description="Top ML token/feature names that drove the model prediction (where available).",
    )
    rule_score: int = Field(
        default=0, ge=0, le=100,
        description="Rule-engine contribution score (0-100) before weighted fusion.",
    )
    ml_score: int = Field(
        default=0, ge=0, le=100,
        description="ML model P(scam)*100 contribution (0 if model unavailable).",
    )
    fusion_method: str = Field(
        default="weighted_average",
        description="How rule + ML + threat-intel scores were combined into the final risk_score.",
    )
    threat_intel_contributed: bool = Field(
        default=False,
        description="Whether threat intelligence data was available and contributed to the score.",
    )


class AnalysisReport(BaseModel):
    """The full 'Professional Security Report' returned by both analyzers."""

    analysis_id: str
    timestamp: datetime
    input_type: InputType
    verdict: Verdict
    risk_score: int = Field(..., ge=0, le=100)
    confidence: int = Field(..., ge=0, le=100)
    category: ScamCategory

    evidence: List[Evidence] = Field(default_factory=list)
    suspicious_terms: List[str] = Field(default_factory=list)
    extracted_urls: List[str] = Field(default_factory=list)
    extracted_entities: Dict[str, Any] = Field(default_factory=dict)

    scam_dna: ScamDNA
    attack_chain: List[AttackChainStep] = Field(default_factory=list)
    recommended_actions: List[str] = Field(default_factory=list)
    explainability: Optional[Explainability] = None  # Phase 2: full signal breakdown

    model: ModelInfo
    feature_version: str
    risk_engine_version: str
    dataset_version: Optional[str] = None

    threat_intelligence: List[ThreatIntelResult] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)
    reason: Optional[str] = None  # populated mainly for UNKNOWN verdicts


class FeedbackResponse(BaseModel):
    feedback_id: str
    analysis_id: str
    stored: bool
    message: str = "Feedback stored for future review. Production models are not auto-retrained."


class ModelInfoResponse(BaseModel):
    sms_model: ModelInfo
    url_model: ModelInfo
    risk_engine_version: str
    feature_versions: Dict[str, str]


class StatisticsResponse(BaseModel):
    total_scans: int
    sms_scans: int
    url_scans: int
    high_risk_count: int
    suspicious_count: int
    unknown_count: int
    low_risk_count: int
    average_risk_score: float
    false_positive_feedback: int
    false_negative_feedback: int
    top_categories: Dict[str, int]


class ThreatIntelStatusResponse(BaseModel):
    sources: List[ThreatIntelResult]


class HealthResponse(BaseModel):
    status: str
    version: str
    models_loaded: bool
    database_ok: bool

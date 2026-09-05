# Architecture — AI Digital Safety (Phase 1)

## Pipeline

```
SMS text / URL string
        |
        v
  preprocessing (normalize, extract entities)
        |
        v
   rule engine  ---------\
        |                 \
        v                  v
   ML model (TF-IDF+LR /   risk engine (weighted fusion,
   DistilBERT / RoBERTa /   configurable weights/thresholds,
   RandomForest / GBM)      UNKNOWN logic)
        |                  ^
        v                 /
  threat intelligence ---/   (URL only: URLhaus, Safe Browsing, PhishTank)
        |
        v
  explainability layer (Scam DNA, attack chain, recommendations)
        |
        v
  professional JSON security report (backend/models/schemas.py::AnalysisReport)
```

## Module responsibilities

| Module | Responsibility |
|---|---|
| `backend/rules/` | Deterministic, auditable pattern matching (urgency, credential requests, brand impersonation, etc.) |
| `ml/sms/`, `ml/url/` | Feature extraction, model training/inference, model registry (config-driven model selection) |
| `backend/risk/` | Weighted fusion of ML + rules + threat intel into a risk score and verdict, including the UNKNOWN override |
| `backend/intelligence/` | Threat-intel API clients with graceful degradation (never silently treats "unavailable" as "safe") |
| `backend/explainability/` | Turns evidence into Scam DNA scores, attack chains, and plain-language recommendations |
| `backend/analyzers/` | Orchestrates the full pipeline for one input (SMS or URL) into one `AnalysisReport` |
| `backend/services/` | Thin layer between FastAPI endpoints and analyzers/database (keeps endpoints HTTP-only) |
| `backend/api/` | FastAPI routes — no business logic lives here |
| `backend/database/` | SQLAlchemy models + session + CRUD, privacy-gated by `STORE_ANALYSIS` |
| `backend/security/` | Validation, rate limiting, security headers, privacy redaction/hashing |

## Why a rule engine AND ML, not just ML?

A pure ML model is a black box — it can't tell you *why* it flagged
something, and it can silently degrade on inputs unlike its training
data. A pure rule engine is transparent but brittle and easy to evade
with paraphrasing. Combining them means the ML model catches semantic
patterns the rules miss, the rules catch structural patterns transformers
under-weight (e.g. a raw IP address as a URL host), and the risk engine's
weighting makes the trade-off between them configurable and explainable
rather than implicit in model weights nobody can inspect.

## Why can the engine return UNKNOWN?

Forcing every input into "safe" or "scam" produces false confidence.
When the ML model has low confidence in its own prediction AND no rules
fired AND threat intelligence is unavailable, the honest answer is "we
don't have enough evidence" — see `backend/risk/risk_engine.py`.

## Extending to future phases (2-12)

Every analyzer implements the same `BaseAnalyzer.analyze() -> AnalysisReport`
interface (`backend/analyzers/base_analyzer.py`). A future
`ScreenshotAnalyzer` (Phase 3) would OCR the image, extract text/URLs, and
delegate to the existing `SMSAnalyzer`/`URLAnalyzer` — no changes needed
to the risk engine, schemas, or API contract. `InputType` in
`backend/models/enums.py` already reserves the enum values for
`SCREENSHOT`, `QR_CODE`, `EMAIL`, `PHONE_NUMBER`, `FILE` so the schema
never needs a breaking change when those phases are switched on.

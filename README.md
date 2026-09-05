# AI Digital Safety
### *"Analyze Before You Trust."*

A defensive, AI-powered scam detection platform. **Phase 1** (current):
SMS + URL scam detection, combining machine learning, a rule engine,
threat intelligence, and explainable AI into a single risk-scoring API.

This is a defensive cybersecurity research/prototype project. It never
executes files, visits submitted URLs, or attempts offensive actions —
see `docs/SECURITY.md`.

---

## Problem Statement

Scam SMS and phishing URLs cause real financial and psychological harm.
Most detection tools are either black-box (a verdict with no explanation)
or brittle keyword-matchers with no learning component. This project
combines both approaches — a transparent rule engine plus trained ML
models — and is honest about uncertainty: when evidence is genuinely
insufficient, it returns `UNKNOWN` instead of guessing.

## Objectives (Phase 1)

- Analyze SMS text and URL strings for scam indicators
- Combine ML + rules + (optional) threat intelligence into one risk score
- Explain every verdict: evidence, Scam DNA, potential attack path
- Never claim "100% safe," never identify attackers, never fabricate data
- Ship a modular architecture that later phases (screenshots, QR, email,
  phone, files) can plug into without a rewrite

## Architecture

```
SMS/URL -> preprocessing -> rule engine -> ML model -> risk engine
                                                  |
                                        threat intelligence (URL only)
                                                  |
                                          explainability layer
                                                  |
                                      professional JSON security report
```

Full breakdown in `docs/ARCHITECTURE.md`.

## Technology Stack

- **Backend**: FastAPI, Pydantic, SQLAlchemy (SQLite now, PostgreSQL-ready)
- **ML**: scikit-learn (TF-IDF+LogisticRegression, RandomForest,
  GradientBoosting), Hugging Face Transformers (DistilBERT, RoBERTa)
- **Explainability**: rule-based evidence, SHAP (optional), Mermaid
  attack-chain diagrams
- **Frontend**: React (Phase 2, not part of this repo yet)

## Installation (Windows / PyCharm / VS Code)

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python scripts/setup_environment.py
copy .env.example .env
```

(macOS/Linux: `python3 -m venv .venv && source .venv/bin/activate`)

## Dataset Setup

**Important:** `data/raw/sms_sample.csv` and `data/raw/url_sample.csv`
shipped in this repo are tiny illustrative placeholders (~30-40 rows
each) used only to smoke-test the pipeline end-to-end. They are **not**
real datasets and models trained on them should not be evaluated as
production-ready. Before training anything you intend to actually rely
on:

```bash
python scripts/download_datasets.py --dataset all
```

See `data/docs/dataset_cards/` for the real, properly licensed sources
(UCI SMS Spam Collection, PhiUSIIL Phishing URL Dataset) and instructions.

## Training

```bash
python ml/training/train_sms.py
python ml/training/train_url.py
```

Switch models via `config/model_config.yaml` (`sms.active_model`:
`tfidf_logistic_regression` | `distilbert` | `roberta`; `url.active_model`:
`random_forest` | `gradient_boosting`) — no code changes needed.

## Evaluation

```bash
python ml/evaluation/evaluate_sms.py
python ml/evaluation/evaluate_url.py
```

Writes `reports/sms_metrics.json`, `reports/url_metrics.json`, and
confusion matrix PNGs. Metrics emphasize precision/recall/F1 over raw
accuracy, per standard cybersecurity evaluation practice.

## Running the API

```bash
uvicorn backend.main:app --reload
```

Swagger UI: http://127.0.0.1:8000/docs

## CLI (no server needed)

```bash
python scripts/cli_test.py
```

## Testing

```bash
pytest tests/ -v
```

Note: `tests/test_analyzers/`, `tests/test_api/`, and any test importing
`backend.models.schemas` require `pydantic`/`fastapi`/`httpx` installed
(`pip install -r requirements-dev.txt`). `tests/test_rules/` and
`tests/test_ml/` run with just scikit-learn/pandas.

## API Usage

```bash
curl -X POST http://127.0.0.1:8000/api/v1/analyze/sms \
  -H "Content-Type: application/json" \
  -d '{"message": "URGENT! Verify your OTP now or your account will be suspended."}'
```

Full endpoint reference in `docs/API.md`.

## Frontend Integration

Phase 1 is backend-only by design (per the phased roadmap — see the
"IMPORTANT ENGINEERING PRINCIPLE" note at the end of this doc). Every
response follows the `AnalysisReport` schema in
`backend/models/schemas.py`, which already contains everything a Phase 2
React frontend needs: risk gauge, confidence gauge, evidence cards, Scam
DNA (radar-chart-ready), attack chain (Mermaid-renderable via
`backend/explainability/attack_chain.py::to_mermaid`), and threat-intel
cards.

## Model Evaluation Notes

See `docs/MODEL_CARD.md` for intended use, limitations, and known
weaknesses of the shipped baseline models.

## Limitations

- Cannot verify sender identity for SMS
- Cannot identify a domain's private owner or an attacker's physical location
- Absence from a threat-intelligence database is never treated as
  confirmation of safety
- `LOW RISK` / `UNKNOWN` verdicts are not a safety guarantee
- Models trained only on the illustrative sample data will not generalize —
  train on real data before relying on this for anything beyond
  architecture review

## Privacy

`STORE_ANALYSIS=false` by default — no raw message/URL content is
persisted. See `docs/SECURITY.md`.

## Security

Defensive-only. Never executes files, visits submitted URLs, or performs
unauthorized scanning. See `docs/SECURITY.md`.

## Future Scope

Phases 2-12 (React frontend, screenshot/OCR, QR codes, email, phone
number reputation, file analysis, multi-modal fusion, production
hardening, MLOps, deployment) are intentionally out of scope for this
repo — see the roadmap notes embedded in each module's docstring for how
they're expected to plug in without restructuring what's here.

---

### IMPORTANT ENGINEERING PRINCIPLE

This is Phase 1 only: SMS + URL detection, built to be modular and
production-shaped rather than a single-file toy script. Every model,
threat-intel source, and risk weight is configuration-driven, not
hard-coded. Nothing in this repo fabricates datasets, metrics, or
threat-intelligence results — the shipped sample data is explicitly
labeled as an illustrative placeholder everywhere it appears.

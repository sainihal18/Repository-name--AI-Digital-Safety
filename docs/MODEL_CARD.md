# Model Card — AI Digital Safety (Phase 1)

## SMS Models

### TF-IDF + Logistic Regression (baseline, default)
- **Purpose**: Fast, interpretable baseline scam/spam classifier for SMS text.
- **Training data**: See `docs/DATASET_CARD.md`. Illustrative sample data
  shipped in this repo (40 rows) is NOT sufficient for production use.
- **Intended use**: Baseline comparison point for transformer models;
  suitable for low-latency/CPU-only deployment.
- **Not intended for**: Production deployment without training on a real,
  properly sized dataset (thousands of examples minimum).
- **Evaluation metrics**: `reports/sms_metrics.json` (regenerated on every
  `evaluate_sms.py` run — never hand-edit this file).
- **Known weaknesses**: Bag-of-words features miss word order and can be
  evaded by paraphrasing; limited generalization to scam phrasing not
  present in training data.

### DistilBERT / RoBERTa (Level 2/3, optional)
- **Purpose**: Semantic understanding of scam phrasing beyond keyword
  matching. Selected via `config/model_config.yaml: sms.active_model`.
- **Requires**: `torch`, `transformers`, and (for the first run) internet
  access to download pretrained weights from Hugging Face.
- **Not intended for**: CPU-constrained real-time inference at high
  volume without further optimization (quantization/distillation).
- **Known weaknesses**: Requires more training data than the TF-IDF
  baseline to avoid overfitting; higher latency; needs periodic
  re-evaluation against adversarial/LLM-generated scam text (see the
  research addendum for why this matters).

## URL Models

### Random Forest (default) / Gradient Boosting
- **Purpose**: Classify URLs as scam/legitimate from 36+ lexical/
  structural features (length, entropy, suspicious keywords, brand
  impersonation score, etc.) — never from page content, since the
  destination is never visited.
- **Evaluation metrics**: `reports/url_metrics.json`.
- **Known weaknesses**: Cannot detect scams that rely entirely on
  legitimate-looking URLs with malicious page content (out of scope for
  Phase 1 — page content analysis isn't performed); brand list in
  `backend/rules/patterns.py::PROTECTED_BRANDS` is small and illustrative,
  not comprehensive.

## Bias & Fairness Considerations

- The curated brand list is a small illustrative sample (a few
  well-known global brands). It will under-protect brands/institutions
  outside that list and should be expanded for any real deployment,
  ideally to reflect the brands most relevant to your actual user base.
- SMS training data language/dialect coverage depends entirely on
  whatever dataset you train on — document this explicitly in your own
  dataset card once you've loaded real data.

## False Positives / False Negatives

Tracked via `backend/models/database.py::Feedback` and surfaced in
`GET /api/v1/statistics`. Feedback is stored for human review only —
per the spec, nothing here automatically retrains a production model.

## Model Versioning

Every analysis response includes `model.version`, `feature_version`, and
`risk_engine_version` so results are always traceable to the exact model
and configuration that produced them. Versions are generated as
`{prefix}-{UTC timestamp}` (see `ml/utils/model_utils.py::generate_version_tag`).

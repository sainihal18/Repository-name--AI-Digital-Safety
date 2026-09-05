# Dataset Card: PhiUSIIL Phishing URL Dataset

- **Source**: UCI Machine Learning Repository
- **URL**: https://archive.ics.uci.edu/dataset/967/phiusiil+phishing+url+dataset
- **Size**: 134,850 legitimate + 100,945 phishing URLs
- **License**: CC BY 4.0
- **How to load**: `python scripts/download_datasets.py --dataset url`,
  then `python ml/training/train_url.py --data data/raw/<downloaded_file>.csv`
  (rename/remap columns to `url,label` first — see `ml/url/datasets.py::load_raw_url_csv`).

## Alternative sources

- **Kaggle "Phishing URLs Dataset with Extracted Features" (2025)** —
  phishing URLs sourced from OpenPhish/URLhaus/PhishTank, benign from
  top-site lists, ~12 pre-engineered lexical features. Useful for
  cross-validating this project's own `ml/url/feature_extraction.py`
  output.
- **UCI "Phishing Websites" dataset** (11,055 rows, 32 features) — older,
  smaller, extremely well-cited baseline.

## Known limitations

- Benign URLs sourced from top-site lists (rather than real browsing
  telemetry) tend to be easier to distinguish from phishing than in
  real-world traffic — expect real-world precision/recall to be somewhat
  lower than what you measure on this dataset alone. Document the actual
  measured metrics here after training, not estimated ones.

# Dataset Card: UCI SMS Spam Collection

- **Source**: UCI Machine Learning Repository
- **URL**: https://archive.ics.uci.edu/dataset/228/sms+spam+collection
- **Also mirrored on Kaggle**: `uciml/sms-spam-collection-dataset`
- **Size**: 5,574 SMS messages (ham/spam labeled)
- **Columns**: `v1` (label: ham/spam), `v2` (message text)
- **License**: Available for research purposes — read the full terms on
  the UCI page before any commercial use.
- **How to load**: `python scripts/download_datasets.py --dataset sms`,
  then `python ml/training/train_sms.py --data data/raw/<downloaded_file>.csv`
  (the loader in `ml/sms/datasets.py` already accepts the `v1,v2` column
  layout natively).
- **Known limitations**: Collected some years ago — vocabulary and scam
  tactics evolve, so expect some drift versus current SMS scams. English-
  language only. Class imbalance (~87% ham / ~13% spam in the original
  release) — the loader applies `class_weight="balanced"` by default to
  compensate; verify the actual distribution after loading and update
  this card with the real numbers before reporting metrics anywhere.

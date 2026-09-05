# Dataset Card — AI Digital Safety (Phase 1)

## Illustrative Sample Data (shipped in this repo)

`data/raw/sms_sample.csv` (40 rows, 20 ham / 20 spam) and
`data/raw/url_sample.csv` (30 rows, 15 legitimate / 15 phishing) are
**hand-written illustrative examples**, not a real public dataset. Their
only purpose is to let `train_sms.py` / `train_url.py` /
`evaluate_sms.py` / `evaluate_url.py` run end-to-end so you can verify
the pipeline works before pointing it at real data. Any metrics produced
from them are not representative of real-world performance — do not cite
them anywhere as evidence of model quality.

**Source**: hand-authored for this repository, August 2026.
**License**: N/A (not derived from any external copyrighted dataset).
**Actual sample count**: 40 (SMS), 30 (URL) — exact, not estimated.
**Class distribution**: 50/50 in both files by construction.

## Real Datasets (use these before evaluating anything seriously)

See `data/docs/dataset_cards/sms_spam_collection.md` and
`data/docs/dataset_cards/url_phishing_dataset.md` for the recommended
real, properly licensed public datasets, how to obtain them
(`scripts/download_datasets.py`), and what to document once loaded.

**Never fabricate additional rows to hit a target sample count.** If a
real dataset has fewer than N samples, either document that N honestly or
combine multiple compatible, properly licensed datasets — never invent
data. This applies to any dataset used with this project, not just the
ones named above.

## Preprocessing Applied

- Unicode normalization (NFKC)
- Whitespace normalization
- Label normalization (ham/safe/legitimate/benign → 0; spam/scam/
  phishing/fraud/malicious → 1) — see `ml/sms/preprocessing.py::normalize_label`
- Duplicate removal (exact match on normalized text/URL)
- Missing-value removal
- Stratified train/val/test split with a fixed random seed (leakage
  prevention: split happens after deduplication, on the deduplicated
  frame, so no identical message/URL can appear in both train and test)

## Known Limitations

- Sample data is intentionally tiny and not representative of real scam
  diversity, dialects, or evasion techniques.
- Real datasets referenced in the dataset cards may themselves have known
  limitations (dated collection period, English-language bias, etc.) —
  read their original documentation before relying on them.

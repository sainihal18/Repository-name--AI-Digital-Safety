# data/

- `raw/` — original, unmodified dataset files (gitignored except the
  shipped illustrative samples). Never edit these in place.
- `processed/` — cleaned/split outputs written by the training scripts
  (test splits used by the evaluation scripts). Regenerated, not source.
- `docs/dataset_cards/` — documentation of real dataset sources, licenses,
  and how to obtain them.

See `docs/DATASET_CARD.md` for the full data policy (no fabricated data,
ever).

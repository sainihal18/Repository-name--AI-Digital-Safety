# models/

Trained model artifacts (gitignored — regenerate via `ml/training/train_sms.py`
/ `train_url.py`, don't commit binaries). Each subdirectory is created and
populated automatically:

- `sms/{model_name}/` — vectorizer.joblib + classifier.joblib (TF-IDF+LR)
  or the Hugging Face model directory (DistilBERT/RoBERTa), plus metadata.json
- `url/{model_name}/` — classifier.joblib + metadata.json

`metadata.json` in each records name, type, version, and the exact config
used to train it — this is what `GET /api/v1/model-info` reads.

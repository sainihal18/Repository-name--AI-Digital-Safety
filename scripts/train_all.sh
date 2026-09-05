#!/usr/bin/env bash
set -e
echo "Training SMS model..."
python ml/training/train_sms.py
echo "Training URL model..."
python ml/training/train_url.py
echo "Done. Run scripts/evaluate_all.sh next."

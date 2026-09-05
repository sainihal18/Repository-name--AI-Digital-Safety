#!/usr/bin/env bash
set -e
echo "Evaluating SMS model..."
python ml/evaluation/evaluate_sms.py
echo "Evaluating URL model..."
python ml/evaluation/evaluate_url.py
echo "Done. See reports/ for metrics and confusion matrices."

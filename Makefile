.PHONY: setup train evaluate test run clean

setup:
	python -m venv .venv
	. .venv/bin/activate && pip install -r requirements-dev.txt
	python scripts/setup_environment.py

train:
	python ml/training/train_sms.py
	python ml/training/train_url.py

evaluate:
	python ml/evaluation/evaluate_sms.py
	python ml/evaluation/evaluate_url.py

test:
	pytest tests/ -v

run:
	uvicorn backend.main:app --reload

cli:
	python scripts/cli_test.py

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	rm -f ai_digital_safety.db

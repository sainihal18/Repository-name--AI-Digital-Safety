"""
Standalone inference engine — used by the CLI (scripts/cli_test.py) so it
can produce analysis without going through the HTTP API/FastAPI stack.
Wraps the same analyzers the API uses, so results are always consistent
between "python scripts/cli_test.py" and "POST /api/v1/analyze/sms".
"""
from __future__ import annotations

from backend.analyzers.sms_analyzer import SMSAnalyzer
from backend.analyzers.url_analyzer import URLAnalyzer


class InferenceEngine:
    def __init__(self):
        self.sms_analyzer = SMSAnalyzer()
        self.url_analyzer = URLAnalyzer()

    def analyze_sms(self, message: str):
        return self.sms_analyzer.analyze(message)

    def analyze_url(self, url: str):
        return self.url_analyzer.analyze(url)

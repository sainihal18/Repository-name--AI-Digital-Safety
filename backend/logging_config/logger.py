"""
Structured JSON logging.

Never logs sensitive message/URL content — only metadata (event name,
analysis_id, type, risk_score, timestamps). Any raw text passed in is
run through privacy.redact_sensitive() first as a defense-in-depth
measure even though callers shouldn't be passing raw content here at all.
"""
from __future__ import annotations

import json
import logging
import sys
from datetime import datetime, timezone
from typing import Any, Dict


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if hasattr(record, "event"):
            payload["event"] = record.event
        if hasattr(record, "extra_fields"):
            payload.update(record.extra_fields)
        return json.dumps(payload)


def configure_logging(level: int = logging.INFO) -> logging.Logger:
    logger = logging.getLogger("ai_digital_safety")
    logger.setLevel(level)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(JsonFormatter())
        logger.addHandler(handler)
    return logger


def log_event(logger: logging.Logger, event: str, **fields: Any) -> None:
    logger.info(event, extra={"event": event, "extra_fields": fields})

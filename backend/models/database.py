"""
SQLAlchemy ORM models.

MVP uses SQLite (see backend/database/session.py); the schema is written
to be PostgreSQL-compatible so migration later is a connection-string
change plus an Alembic migration, not a rewrite.

Privacy rule enforced at the schema level: there is no column for raw
SMS/URL content by default. Only a one-way hash is stored, and only when
STORE_ANALYSIS=true.
"""
import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import declarative_base

Base = declarative_base()


def new_id() -> str:
    return uuid.uuid4().hex


class Analysis(Base):
    __tablename__ = "analyses"

    analysis_id = Column(String(32), primary_key=True, default=new_id)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    input_type = Column(String(16), nullable=False, index=True)
    verdict = Column(String(16), nullable=False, index=True)
    risk_score = Column(Integer, nullable=False)
    confidence = Column(Integer, nullable=False)
    category = Column(String(64), nullable=False, index=True)

    model_name = Column(String(64))
    model_version = Column(String(32))
    dataset_version = Column(String(32))
    feature_version = Column(String(32))
    risk_engine_version = Column(String(16))

    # Privacy: only ever a SHA-256 hash of the normalized input, never
    # the raw text/URL, and only written when STORE_ANALYSIS=true.
    content_hash = Column(String(64), nullable=True)

    # Full JSON report, same privacy gate as content_hash.
    report_json = Column(Text, nullable=True)


class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    model_name = Column(String(64), nullable=False)
    version = Column(String(32), nullable=False)
    model_type = Column(String(32), nullable=False)
    dataset_version = Column(String(32))
    trained_at = Column(DateTime, default=datetime.utcnow)
    metrics_json = Column(Text)
    is_active = Column(Boolean, default=True)


class ThreatIntelligenceResult(Base):
    __tablename__ = "threat_intelligence_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    analysis_id = Column(String(32), index=True)
    source = Column(String(32), nullable=False)
    query_status = Column(String(16), nullable=False)
    known_malicious = Column(Boolean, nullable=True)
    threat_type = Column(String(64), nullable=True)
    reputation = Column(String(32), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    error_status = Column(String(128), nullable=True)


class Feedback(Base):
    __tablename__ = "feedback"

    feedback_id = Column(String(32), primary_key=True, default=new_id)
    analysis_id = Column(String(32), index=True, nullable=False)
    label = Column(String(32), nullable=False)
    comment = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    # Feedback is stored separately from training data by design.
    # A human-reviewed export process (ml/training) decides what, if
    # anything, becomes part of a future labeled dataset. Nothing here
    # triggers automatic retraining.
    reviewed = Column(Boolean, default=False)


class SystemEvent(Base):
    __tablename__ = "system_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    event = Column(String(64), nullable=False)
    detail_json = Column(Text, nullable=True)

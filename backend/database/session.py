"""
Database session management.

MVP: SQLite. Swapping to PostgreSQL is a DATABASE_URL environment
variable change — no code here is SQLite-specific.
"""
from __future__ import annotations

import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.models.database import Base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ai_digital_safety.db")

_connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=_connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

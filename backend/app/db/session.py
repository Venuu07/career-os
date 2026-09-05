"""
Database session setup using SQLAlchemy 2.x with psycopg (psycopg3).

Connection strategy
-------------------
- Synchronous engine using the psycopg3 driver (postgresql+psycopg://...).
- Neon PostgreSQL requires SSL; the DATABASE_URL from .env already carries
  `?sslmode=require&channel_binding=require`, so no extra connect_args are needed.
- SessionLocal is a plain sessionmaker factory; callers use it as a context manager
  or via the FastAPI dependency (get_db) that will be added with the auth layer.

Why synchronous (not asyncpg)?
- psycopg3 supports both sync and async; we start sync to keep the codebase
  simple and easy to reason about. Migrating to async later is a one-line engine
  change (`postgresql+psycopg_async://`) with minimal callsite updates.
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session

from app.config import settings


def _normalise_db_url(url: str) -> str:
    """
    Ensure the DATABASE_URL uses the psycopg3 dialect prefix.

    Neon connection strings use 'postgresql://' which SQLAlchemy maps to the
    legacy psycopg2 driver. We replace the scheme with 'postgresql+psycopg://'
    to explicitly select psycopg3 (the `psycopg` package).

    Accepts both:
      postgresql://...       → postgresql+psycopg://...
      postgresql+psycopg://... → unchanged (already correct)
    """
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    # postgres:// shorthand (some providers use this)
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg://", 1)
    return url

# ---------------------------------------------------------------------------
# Engine
# ---------------------------------------------------------------------------
# pool_pre_ping=True: issues a lightweight "SELECT 1" before handing out a
# connection, recovering gracefully from Neon's connection idle-timeout drops.
# pool_size / max_overflow: keep defaults (5 / 10) — appropriate for a dev server.
engine = create_engine(
    _normalise_db_url(settings.DATABASE_URL),
    pool_pre_ping=True,
    echo=settings.DEBUG,  # SQL logging in debug mode only
)

# ---------------------------------------------------------------------------
# Session factory
# ---------------------------------------------------------------------------
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    class_=Session,
)


# ---------------------------------------------------------------------------
# Connectivity check
# ---------------------------------------------------------------------------
def check_database_connection() -> dict:
    """
    Attempt a single lightweight query against the database.
    Returns a dict with 'ok' bool and optional 'error' string.
    Called from the /health/db endpoint on startup and on-demand.
    """
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1 AS ping"))
            row = result.fetchone()
            if row and row.ping == 1:
                return {"ok": True}
            return {"ok": False, "error": "Unexpected result from SELECT 1"}
    except Exception as exc:
        return {"ok": False, "error": str(exc)}


# ---------------------------------------------------------------------------
# FastAPI dependency (used by route handlers once endpoints are added)
# ---------------------------------------------------------------------------
def get_db():
    """
    Yield a SQLAlchemy Session, then close it.
    Usage in route:
        db: Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

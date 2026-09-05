"""
CareerOS FastAPI application entry point.

Current state: PostgreSQL foundation phase.
- CORS middleware configured for Next.js dev server (localhost:3000)
- Lifespan: verifies database connectivity on startup
- /health      → basic liveness check (no DB)
- /health/db   → database connectivity check
"""

import logging

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db.session import check_database_connection

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Lifespan: startup / shutdown logic
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    result = check_database_connection()
    if result["ok"]:
        logger.info("[DB] Database connection established successfully.")
    else:
        # Log clearly but do NOT crash the server — let /health/db report status
        logger.error("[DB] Database connection FAILED on startup: %s", result.get("error"))

    yield  # application runs here

    # Shutdown (nothing to clean up for sync engine yet)


# ---------------------------------------------------------------------------
# App factory
# ---------------------------------------------------------------------------
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Health endpoints
# ---------------------------------------------------------------------------


@app.get("/health", tags=["health"])
def health():
    """Basic liveness check — no database required."""
    return {"status": "ok", "service": settings.APP_NAME}


@app.get("/health/db", tags=["health"])
def health_db():
    """
    Database connectivity check.
    Executes SELECT 1 against Neon PostgreSQL via SQLAlchemy.
    Returns 200 with ok=True on success, or ok=False + error details on failure.
    """
    result = check_database_connection()
    return {
        "status": "ok" if result["ok"] else "error",
        "database": result,
    }

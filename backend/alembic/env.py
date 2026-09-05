"""
Alembic env.py — configured for CareerOS.

Key design decisions:
- DATABASE_URL is read from app.config.settings (reads .env), not from alembic.ini.
  This keeps credentials out of the ini file and in the gitignored .env.
- All models are imported via app.models to register them with Base.metadata
  before autogenerate reads target_metadata.
- The psycopg3 URL normalisation from db/session.py is replicated here so
  Alembic also uses the correct driver.
- compare_type=True: autogenerate detects column type changes.
- include_schemas=False: single schema (public) only.
"""

import sys
import os
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

# ---------------------------------------------------------------------------
# Make the backend/app package importable when running alembic from backend/
# ---------------------------------------------------------------------------
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# ---------------------------------------------------------------------------
# Import app config + all ORM models (registers them with Base.metadata)
# ---------------------------------------------------------------------------
from app.config import settings  # noqa: E402
from app.db.base import Base  # noqa: E402
import app.models  # noqa: F401, E402  — side-effect import: registers all models

# ---------------------------------------------------------------------------
# Alembic Config object
# ---------------------------------------------------------------------------
config = context.config

# Set up Python logging from alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Target metadata for autogenerate
target_metadata = Base.metadata


# ---------------------------------------------------------------------------
# URL normalisation (same logic as db/session.py)
# ---------------------------------------------------------------------------
def _get_url() -> str:
    url = settings.DATABASE_URL
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg://", 1)
    return url


# ---------------------------------------------------------------------------
# Offline mode (generates SQL script without connecting)
# ---------------------------------------------------------------------------
def run_migrations_offline() -> None:
    url = _get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


# ---------------------------------------------------------------------------
# Online mode (connects to the database and runs migrations)
# ---------------------------------------------------------------------------
def run_migrations_online() -> None:
    # Override sqlalchemy.url in the ini config with our app settings URL
    config.set_main_option("sqlalchemy.url", _get_url())

    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,  # NullPool: no connection reuse during migrations
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

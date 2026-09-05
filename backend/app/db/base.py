from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """
    SQLAlchemy 2.x declarative base.

    All ORM models will inherit from this class.
    Importing this module in db/session.py (or alembic env.py) ensures
    that all model metadata is registered before migrations or table creation.
    """

    pass

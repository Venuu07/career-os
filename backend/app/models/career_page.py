"""
CareersPage model.

One company has exactly one CareersPage record (enforced via UNIQUE on company_id).

published_version_id is a NULLABLE FK back to career_page_versions.
This creates a circular reference:

    careers_pages.published_version_id → career_page_versions.id
    career_page_versions.career_page_id → careers_pages.id

The Alembic migration handles this by:
  1. Creating careers_pages WITHOUT the published_version_id FK
  2. Creating career_page_versions (references careers_pages)
  3. ALTER TABLE careers_pages ADD CONSTRAINT for published_version_id

The `slug` here is the recruiter-chosen public slug used in:
  /{company.slug}/careers

Note: we derive the public URL from company.slug, not from careers_pages.slug.
The careers_page slug can be used as a fallback or for future multi-page scenarios.
"""

import uuid

from sqlalchemy import ForeignKey, String, Text, UniqueConstraint, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import UUIDPrimaryKeyMixin, TimestampMixin


class CareersPage(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "careers_pages"
    __table_args__ = (
        # One company → one careers page
        UniqueConstraint("company_id", name="uq_careers_pages_company_id"),
        Index("ix_careers_pages_company_id", "company_id"),
    )

    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False, default="Our Careers")
    meta_description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Nullable FK — points to the currently live version.
    # NULL means the page has never been published.
    # This FK is added AFTER career_page_versions is created (circular dep).
    # See: use_alter=True in Alembic migration.
    published_version_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "career_page_versions.id",
            ondelete="SET NULL",
            use_alter=True,               # deferred FK — created post-table via ALTER TABLE
            name="fk_careers_pages_published_version",
        ),
        nullable=True,
    )

    # Relationships
    company: Mapped["Company"] = relationship(  # type: ignore[name-defined]
        "Company",
        back_populates="careers_page",
    )
    versions: Mapped[list["CareerPageVersion"]] = relationship(  # type: ignore[name-defined]
        "CareerPageVersion",
        back_populates="careers_page",
        foreign_keys="CareerPageVersion.career_page_id",
        cascade="all, delete-orphan",
    )
    published_version: Mapped["CareerPageVersion | None"] = relationship(  # type: ignore[name-defined]
        "CareerPageVersion",
        foreign_keys=[published_version_id],
        post_update=True,  # required for circular FK — SQLAlchemy inserts, then updates
    )

    def __repr__(self) -> str:
        return f"<CareersPage id={self.id} company_id={self.company_id}>"

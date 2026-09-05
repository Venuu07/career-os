"""
CareerPageVersion model — the immutable version record.

Versions are never mutated after creation (except status changes via publish/archive).
Every "save draft" creates a new version record.

Publishing is designed as an atomic transaction:
  1. UPDATE career_page_versions SET status='PUBLISHED', published_at=now() WHERE id=<version>
  2. UPDATE career_page_versions SET status='ARCHIVED' WHERE career_page_id=<page> AND status='PUBLISHED' AND id != <version>
  3. UPDATE careers_pages SET published_version_id=<version> WHERE id=<page>
  All in one DB transaction → consistent state, no partial publishes.

sections_config JSONB format (ordered list of section objects):
[
  {
    "id": "uuid",
    "type": "hero|about|culture|benefits|video|jobs|custom",
    "order": 0,
    "visible": true,
    "data": { ... type-specific fields ... }
  }
]

JSONB means new section types can be added without schema migrations.

theme_config JSONB format:
{
  "primary_color": "#...",
  "accent_color": "#...",
  "background_color": "#...",
  "font_family": "inter|geist|...",
  "logo_url": "https://..."
}
"""

import enum
import uuid
from datetime import datetime

from sqlalchemy import Enum as SAEnum, ForeignKey, Integer, UniqueConstraint, Index
from sqlalchemy.dialects.postgresql import JSONB, TIMESTAMP, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import UUIDPrimaryKeyMixin, CreatedAtMixin


class VersionStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class CareerPageVersion(UUIDPrimaryKeyMixin, CreatedAtMixin, Base):
    __tablename__ = "career_page_versions"
    __table_args__ = (
        # Each page has incrementing version numbers (1, 2, 3...)
        UniqueConstraint("career_page_id", "version_number", name="uq_career_page_versions_page_version"),
        Index("ix_career_page_versions_career_page_id", "career_page_id"),
        Index("ix_career_page_versions_status", "status"),
        # Fast lookup: find the PUBLISHED version for a page
        Index(
            "ix_career_page_versions_page_published",
            "career_page_id",
            "status",
        ),
    )

    career_page_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("careers_pages.id", ondelete="CASCADE"),
        nullable=False,
    )
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[VersionStatus] = mapped_column(
        SAEnum(VersionStatus, name="version_status", create_type=True),
        nullable=False,
        default=VersionStatus.DRAFT,
        index=False,  # covered by composite index above
    )

    # JSONB — ordered list of section configs; no migration needed for new section types
    sections_config: Mapped[list | dict] = mapped_column(
        JSONB,
        nullable=False,
        server_default="[]",
    )

    # JSONB — theme snapshot captured at version creation time
    theme_config: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        server_default="{}",
    )

    # Who created this version (nullable: system-created versions have no user)
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    published_at: Mapped[datetime | None] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=True,
    )

    # Relationships
    careers_page: Mapped["CareersPage"] = relationship(  # type: ignore[name-defined]
        "CareersPage",
        back_populates="versions",
        foreign_keys=[career_page_id],
    )
    created_by_user: Mapped["User | None"] = relationship(  # type: ignore[name-defined]
        "User",
        back_populates="created_versions",
        foreign_keys=[created_by_id],
    )

    def __repr__(self) -> str:
        return (
            f"<CareerPageVersion id={self.id} "
            f"page={self.career_page_id} v={self.version_number} status={self.status}>"
        )

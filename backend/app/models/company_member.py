"""
CompanyMember model — the multi-tenancy bridge.

A User can belong to multiple Companies with different roles.

    User → CompanyMember → Company

This design follows AGENTS.md §6 exactly:
  "Do NOT model users as belonging directly to one company."

Roles (defined as a Python Enum + PostgreSQL native ENUM):
  - OWNER  : full control, cannot be demoted
  - ADMIN  : can manage members and content
  - EDITOR : can edit content only
"""

import enum
import uuid

# pyrefly: ignore [missing-import]
from sqlalchemy import Enum as SAEnum, ForeignKey, UniqueConstraint, Index
# pyrefly: ignore [missing-import]
from sqlalchemy.dialects.postgresql import UUID
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import UUIDPrimaryKeyMixin, CreatedAtMixin


class MemberRole(str, enum.Enum):
    """
    Inheriting from str makes the enum JSON-serialisable and compatible with
    Pydantic v2 without extra configuration.
    """
    OWNER = "owner"
    ADMIN = "admin"
    EDITOR = "editor"


class CompanyMember(UUIDPrimaryKeyMixin, CreatedAtMixin, Base):
    __tablename__ = "company_members"
    __table_args__ = (
        # A user can only hold one membership per company
        UniqueConstraint("user_id", "company_id", name="uq_company_members_user_company"),
        Index("ix_company_members_company_id", "company_id"),
        Index("ix_company_members_user_id", "user_id"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=False,
    )
    role: Mapped[MemberRole] = mapped_column(
        SAEnum(MemberRole, name="member_role", create_type=True),
        nullable=False,
        default=MemberRole.EDITOR,
    )

    # Relationships
    user: Mapped["User"] = relationship(  # type: ignore[name-defined]
        "User",
        back_populates="memberships",
    )
    company: Mapped["Company"] = relationship(  # type: ignore[name-defined]
        "Company",
        back_populates="members",
    )

    def __repr__(self) -> str:
        return f"<CompanyMember user={self.user_id} company={self.company_id} role={self.role}>"

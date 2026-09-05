"""
User model.

Users are NOT directly tied to a single company.
Multi-tenancy is modelled through company_members:

    User → CompanyMember → Company

hashed_password is included now so the schema is complete for the auth session.
The column is nullable=False but will be populated only during registration.
"""

from sqlalchemy import Boolean, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import UUIDPrimaryKeyMixin, TimestampMixin


class User(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "users"
    __table_args__ = (
        UniqueConstraint("email", name="uq_users_email"),
    )

    # Basic identity
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")

    # Relationships
    memberships: Mapped[list["CompanyMember"]] = relationship(  # type: ignore[name-defined]
        "CompanyMember",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    created_versions: Mapped[list["CareerPageVersion"]] = relationship(  # type: ignore[name-defined]
        "CareerPageVersion",
        back_populates="created_by_user",
        foreign_keys="CareerPageVersion.created_by_id",
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r}>"

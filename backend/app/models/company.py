"""
Company model.

Companies are first-class tenants in CareerOS.

The `slug` field is the URL-safe company identifier used in the public
careers page URL:  /{company.slug}/careers

All company-owned resources (careers_pages, jobs) carry company_id.
"""

from sqlalchemy import String, Text, UniqueConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import UUIDPrimaryKeyMixin, TimestampMixin


class Company(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "companies"
    __table_args__ = (
        UniqueConstraint("slug", name="uq_companies_slug"),
        Index("ix_companies_slug", "slug"),  # fast public URL lookup
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    # slug: URL-safe identifier for /{slug}/careers public page
    slug: Mapped[str] = mapped_column(String(100), nullable=False)
    logo_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    website_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    members: Mapped[list["CompanyMember"]] = relationship(  # type: ignore[name-defined]
        "CompanyMember",
        back_populates="company",
        cascade="all, delete-orphan",
    )
    careers_page: Mapped["CareersPage | None"] = relationship(  # type: ignore[name-defined]
        "CareersPage",
        back_populates="company",
        uselist=False,  # one-to-one: a company has at most one careers page
    )
    jobs: Mapped[list["Job"]] = relationship(  # type: ignore[name-defined]
        "Job",
        back_populates="company",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Company id={self.id} slug={self.slug!r}>"

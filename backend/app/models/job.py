"""
Job model.

Jobs belong to a Company, not directly to a CareersPage.

Rationale: jobs are a company-level resource. A company may have one careers page
today, but jobs exist independently and are displayed by the careers page at render
time. This also makes job management simpler (one CRUD surface, not nested under pages).

Indexes support common query patterns:
  - List all OPEN jobs for a company (candidate view)
  - Filter by department, location, job_type (candidate search/filter)
  - Company-scoped job management (recruiter view)
"""

import enum
import uuid

from sqlalchemy import Enum as SAEnum, ForeignKey, String, Text, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import UUIDPrimaryKeyMixin, TimestampMixin


class JobType(str, enum.Enum):
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    INTERNSHIP = "internship"


class ExperienceLevel(str, enum.Enum):
    ENTRY = "entry"
    MID = "mid"
    SENIOR = "senior"
    LEAD = "lead"


class JobStatus(str, enum.Enum):
    DRAFT = "draft"
    OPEN = "open"
    CLOSED = "closed"


class Job(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "jobs"
    __table_args__ = (
        # Most common query: list open jobs for a company
        Index("ix_jobs_company_status", "company_id", "status"),
        # Filtering support
        Index("ix_jobs_company_department", "company_id", "department"),
        Index("ix_jobs_company_location", "company_id", "location"),
        Index("ix_jobs_company_job_type", "company_id", "job_type"),
    )

    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=False,
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    department: Mapped[str | None] = mapped_column(String(100), nullable=True)
    location: Mapped[str | None] = mapped_column(String(150), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    job_type: Mapped[JobType] = mapped_column(
        SAEnum(JobType, name="job_type", create_type=True),
        nullable=False,
        default=JobType.FULL_TIME,
    )
    experience_level: Mapped[ExperienceLevel | None] = mapped_column(
        SAEnum(ExperienceLevel, name="experience_level", create_type=True),
        nullable=True,
    )
    status: Mapped[JobStatus] = mapped_column(
        SAEnum(JobStatus, name="job_status", create_type=True),
        nullable=False,
        default=JobStatus.DRAFT,
    )

    # Relationships
    company: Mapped["Company"] = relationship(  # type: ignore[name-defined]
        "Company",
        back_populates="jobs",
    )

    def __repr__(self) -> str:
        return f"<Job id={self.id} title={self.title!r} status={self.status}>"

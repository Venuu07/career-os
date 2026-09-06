"""
ORM model registry.

Importing this package registers all models with Base.metadata.
This must be imported by alembic/env.py BEFORE target_metadata is read,
otherwise autogenerate will produce an empty migration.

Import order respects dependency direction to avoid circular import issues:
  1. mixins   (no model deps)
  2. user     (no FK deps on other models)
  3. company  (no FK deps on other models)
  4. company_member  (deps: user, company)
  5. career_page     (deps: company; circular FK to career_page_version handled via use_alter)
  6. career_page_version (deps: career_page, user)
  7. job      (deps: company)
"""

from app.models.mixins import UUIDPrimaryKeyMixin, TimestampMixin, CreatedAtMixin  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.company import Company  # noqa: F401
from app.models.company_member import CompanyMember, MemberRole  # noqa: F401
from app.models.career_page import CareersPage  # noqa: F401
from app.models.career_page_version import CareerPageVersion, VersionStatus  # noqa: F401
from app.models.job import Job, JobType, WorkPolicy, ExperienceLevel, JobStatus  # noqa: F401

__all__ = [
    "UUIDPrimaryKeyMixin",
    "TimestampMixin",
    "CreatedAtMixin",
    "User",
    "Company",
    "CompanyMember",
    "MemberRole",
    "CareersPage",
    "CareerPageVersion",
    "VersionStatus",
    "Job",
    "JobType",
    "WorkPolicy",
    "ExperienceLevel",
    "JobStatus",
]

from datetime import datetime
from uuid import UUID
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator, model_validator
from app.models.job import JobType, WorkPolicy, ExperienceLevel, JobStatus


class JobResponse(BaseModel):
    """
    Full job representation returned to the recruiter.
    Also used by the public job cards (status is always OPEN in public context).
    """
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    department: str | None = None
    location: str | None = None
    description: str | None = None
    job_type: JobType
    work_policy: WorkPolicy | None = None
    experience_level: ExperienceLevel | None = None
    salary_range: str | None = None
    application_url: str | None = None
    status: JobStatus
    created_at: datetime
    updated_at: datetime


class JobCreate(BaseModel):
    """Validated request body for creating a new job."""

    title: str = Field(..., min_length=1, max_length=255, description="Job title is required")
    department: Optional[str] = Field(None, max_length=100)
    location: Optional[str] = Field(None, max_length=150)
    description: Optional[str] = None
    job_type: JobType = JobType.FULL_TIME
    work_policy: Optional[WorkPolicy] = None
    experience_level: Optional[ExperienceLevel] = None
    salary_range: Optional[str] = Field(None, max_length=100, description="Human-readable range e.g. '$120k–$160k'")
    application_url: Optional[str] = Field(None, max_length=2048, description="Optional direct link to application form")
    status: JobStatus = JobStatus.DRAFT

    @field_validator("title")
    @classmethod
    def title_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Job title cannot be blank")
        return v.strip()

    @field_validator("application_url")
    @classmethod
    def validate_application_url(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return None
        v = v.strip()
        if not (v.startswith("http://") or v.startswith("https://")):
            raise ValueError("application_url must be a valid http/https URL")
        return v

    @field_validator("salary_range")
    @classmethod
    def salary_range_not_blank(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            return None
        return v


class JobUpdate(BaseModel):
    """Partial update — all fields optional. Validated the same as create when supplied."""

    title: Optional[str] = Field(None, min_length=1, max_length=255)
    department: Optional[str] = Field(None, max_length=100)
    location: Optional[str] = Field(None, max_length=150)
    description: Optional[str] = None
    job_type: Optional[JobType] = None
    work_policy: Optional[WorkPolicy] = None
    experience_level: Optional[ExperienceLevel] = None
    salary_range: Optional[str] = Field(None, max_length=100)
    application_url: Optional[str] = Field(None, max_length=2048)
    status: Optional[JobStatus] = None

    @field_validator("title")
    @classmethod
    def title_not_blank(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("Job title cannot be blank")
        return v.strip() if v else v

    @field_validator("application_url")
    @classmethod
    def validate_application_url(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return None
        v = v.strip()
        if not (v.startswith("http://") or v.startswith("https://")):
            raise ValueError("application_url must be a valid http/https URL")
        return v


class JobStatusUpdate(BaseModel):
    """Convenience body for simple status transitions (open/close/draft)."""
    status: JobStatus

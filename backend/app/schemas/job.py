from datetime import datetime
from uuid import UUID
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.job import JobType, ExperienceLevel, JobStatus


class JobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    department: str | None = None
    location: str | None = None
    description: str | None = None
    job_type: JobType
    experience_level: ExperienceLevel | None = None
    status: JobStatus
    created_at: datetime


class JobCreate(BaseModel):
    title: str
    department: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    job_type: JobType = JobType.FULL_TIME
    experience_level: Optional[ExperienceLevel] = None
    status: JobStatus = JobStatus.DRAFT


class JobUpdate(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    job_type: Optional[JobType] = None
    experience_level: Optional[ExperienceLevel] = None
    status: Optional[JobStatus] = None

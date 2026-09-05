from datetime import datetime
from uuid import UUID
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

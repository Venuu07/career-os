from datetime import datetime
from uuid import UUID
from typing import Any
from pydantic import BaseModel, ConfigDict, Field
from app.models.career_page_version import VersionStatus
from app.schemas.job import JobResponse


class SectionConfig(BaseModel):
    """
    Extensible section envelope. 
    Specific payload goes into `data`.
    """
    id: str = Field(..., description="Stable unique identifier for the section instance")
    type: str = Field(..., description="Type of the section (e.g., hero, about, jobs, custom)")
    visible: bool = True
    order: int
    data: dict[str, Any] = Field(default_factory=dict, description="Arbitrary payload for the section content")


class ThemeConfig(BaseModel):
    primary_color: str | None = None
    accent_color: str | None = None
    background_color: str | None = None
    font_family: str | None = None
    logo_url: str | None = None
    social_links: dict[str, str] | None = None


class CareerPageDraftUpdate(BaseModel):
    sections_config: list[SectionConfig]
    theme_config: ThemeConfig
    title: str | None = None
    meta_description: str | None = None


class CareerPageVersionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    version_number: int
    status: VersionStatus
    sections_config: list[dict[str, Any]]
    theme_config: dict[str, Any]
    published_at: datetime | None


class CareersPageResponse(BaseModel):
    """
    Recruiter's view of the Careers Page.
    Includes the page metadata, the current draft, and the currently published version.
    """
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    company_id: UUID
    title: str
    meta_description: str | None
    
    draft_version: CareerPageVersionResponse | None = None
    published_version: CareerPageVersionResponse | None = None


class PublicCareerPageResponse(BaseModel):
    """
    Candidate's view of the Careers Page.
    """
    model_config = ConfigDict(from_attributes=True)
    
    company_name: str
    slug: str
    title: str
    meta_description: str | None
    
    theme_config: dict[str, Any]
    sections_config: list[dict[str, Any]]
    
    open_jobs: list[JobResponse]

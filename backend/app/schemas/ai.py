"""
Schemas for the AI Career Copy endpoint.

Design notes:
  - content_type is an enum — no arbitrary strings accepted.
  - tone is an enum — no free-form system-instruction injection.
  - context fields are individually typed and length-bounded.
  - No company_id field — it always comes from the authenticated session.
"""

from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field, field_validator, model_validator


# ─── Enums (allowlists) ───────────────────────────────────────────────────────

class ContentType(str, Enum):
    hero            = "hero"
    about           = "about"
    culture         = "culture"
    job_description = "job_description"


class CopyTone(str, Enum):
    professional = "professional"
    friendly     = "friendly"
    bold         = "bold"
    minimal      = "minimal"


# ─── Input ────────────────────────────────────────────────────────────────────

# Individual character limits per field — generous but bounded
_MAX_SHORT = 200    # headlines, titles
_MAX_BODY  = 2000   # descriptions, body copy

class CareerCopyRequest(BaseModel):
    """
    Request body for POST /api/ai/career-copy.

    content_type and tone are strict enums.
    context carries recruiter-provided fields — each individually bounded.
    company_id is NEVER accepted; it comes from the authenticated session.
    """

    content_type: ContentType
    tone: CopyTone = CopyTone.professional

    # Recruiter-supplied context.
    # Fields are optional — the AI writes around missing information.
    context: CareerCopyContext = Field(default_factory=lambda: CareerCopyContext())

    @model_validator(mode="after")
    def check_reasonable_payload(self) -> "CareerCopyRequest":
        """
        Aggregate size guard: prevent a single oversized request regardless of
        which individual fields are populated. Measured in characters, not tokens.
        """
        total = sum(
            len(str(v))
            for v in self.context.model_dump().values()
            if v is not None
        )
        if total > 5000:
            raise ValueError(
                "Total context size exceeds the maximum allowed length (5000 characters)."
            )
        return self


class CareerCopyContext(BaseModel):
    """
    Recruiter-supplied context fields.

    All fields are optional. Each has a per-field character limit.
    Fields not relevant to the requested content_type are ignored by the service.
    """

    # Hero / general
    headline: str | None = Field(None, max_length=_MAX_SHORT)
    description: str | None = Field(None, max_length=_MAX_BODY)

    # About / Culture
    content: str | None = Field(None, max_length=_MAX_BODY)

    # Job description
    title: str | None = Field(None, max_length=_MAX_SHORT)
    department: str | None = Field(None, max_length=_MAX_SHORT)
    location: str | None = Field(None, max_length=_MAX_SHORT)
    work_policy: str | None = Field(None, max_length=_MAX_SHORT)
    job_type: str | None = Field(None, max_length=_MAX_SHORT)
    experience_level: str | None = Field(None, max_length=_MAX_SHORT)
    salary_range: str | None = Field(None, max_length=_MAX_SHORT)

    @field_validator("*", mode="before")
    @classmethod
    def strip_strings(cls, v: Any) -> Any:
        """Strip surrounding whitespace from all string inputs."""
        if isinstance(v, str):
            return v.strip() or None
        return v


# ─── Output ───────────────────────────────────────────────────────────────────

class CultureValue(BaseModel):
    title: str
    description: str


class CareerCopyResponse(BaseModel):
    """
    Polymorphic response — only fields relevant to the content_type will be set.

    Hero:            headline, description, cta
    About:           headline, body
    Culture:         headline, intro, values
    Job description: description
    """

    content_type: ContentType

    # Hero fields
    headline: str | None = None
    description: str | None = None
    cta: str | None = None

    # About fields
    body: str | None = None

    # Culture fields
    intro: str | None = None
    values: list[CultureValue] | None = None

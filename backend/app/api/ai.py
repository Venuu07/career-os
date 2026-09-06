"""
AI Career Copy Assistant — API endpoint.

POST /api/ai/career-copy

Security model:
  - Requires authenticated recruiter (cookie or Bearer token via get_current_recruiter).
  - company_name is resolved from the authenticated membership, NEVER from the request body.
  - content_type and tone are strict enum fields — no arbitrary string injection.
  - Context fields are individually bounded via Pydantic.
  - Gemini model name comes from server config, not the client.
  - Generated content is NEVER persisted to the database by this endpoint.
  - API key is NEVER logged or included in error responses.

Error semantics:
  - 401 / 403  → authentication / authorization failure (from deps)
  - 422        → validation failure (Pydantic)
  - 503        → Gemini not configured (missing API key)
  - 502        → Gemini API call failed
  - 500        → unexpected internal error (no internals exposed to client)
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_recruiter, RecruiterContext
from app.schemas.ai import CareerCopyRequest, CareerCopyResponse, CultureValue
from app.services.ai import generate_career_copy

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/career-copy",
    response_model=CareerCopyResponse,
    summary="Generate AI career copy",
    description=(
        "Generates AI-assisted copy for a careers page section or job description. "
        "Content is returned for recruiter review — it is NEVER automatically saved. "
        "Requires recruiter authentication."
    ),
)
def generate_copy(
    request: CareerCopyRequest,
    context: RecruiterContext = Depends(get_current_recruiter),
) -> CareerCopyResponse:
    """
    Generate AI career copy.

    The company name is resolved from the authenticated recruiter's membership.
    The client never supplies a company_id — it always comes from the session.
    """
    company_name = context.company.name

    # Call the isolated AI service — raises RuntimeError on failure
    try:
        result = generate_career_copy(
            content_type=request.content_type.value,
            tone=request.tone.value,
            context=request.context.model_dump(exclude_none=True),
            company_name=company_name,
        )
    except RuntimeError as exc:
        error_str = str(exc)

        # Missing API key — configuration problem, not a client error
        if "AI_NOT_CONFIGURED" in error_str:
            logger.warning("AI endpoint called but Gemini is not configured.")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI assistant is not configured. Please contact your administrator.",
            )

        # Gemini API call failed — upstream error
        if "AI_API_ERROR" in error_str:
            logger.error("Gemini API error for company=%s: %s", company_name, error_str[:200])
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="AI generation failed. Please try again.",
            )

        # Parse error — unexpected model output
        if "AI_PARSE_ERROR" in error_str:
            logger.error("Gemini parse error for company=%s: %s", company_name, error_str[:200])
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="AI generation failed. Please try again.",
            )

        # Unexpected error — don't leak internals
        logger.exception("Unexpected AI service error for company=%s", company_name)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again.",
        )

    # Shape the response according to content_type
    ct = request.content_type

    values = None
    if ct.value == "culture" and isinstance(result.get("values"), list):
        values = [
            CultureValue(title=v["title"], description=v["description"])
            for v in result["values"]
            if isinstance(v, dict)
        ]

    return CareerCopyResponse(
        content_type=ct,
        headline=result.get("headline"),
        description=result.get("description"),
        cta=result.get("cta"),
        body=result.get("body"),
        intro=result.get("intro"),
        values=values,
    )

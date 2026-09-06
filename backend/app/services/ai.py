"""
AI service — Gemini Copy Assistant.

Responsibilities:
  - Initialize Gemini client from settings.
  - Build safe, structured prompts for each content type.
  - Parse and validate Gemini responses.
  - Handle errors gracefully without leaking internals.
  - NEVER persist generated content to the database.
  - NEVER expose the API key in logs or error messages.

Security notes:
  - No free-form system-instruction field is accepted from the client.
  - Tone is controlled via an allowlist enum, not raw strings.
  - Input lengths are bounded before reaching this layer.
  - Gemini model name is taken from server config only.
"""

from __future__ import annotations

import json
import logging
from typing import Any

from app.config import settings

logger = logging.getLogger(__name__)

# ─── Allowlists ───────────────────────────────────────────────────────────────

ALLOWED_CONTENT_TYPES = {"hero", "about", "culture", "job_description"}

ALLOWED_TONES = {"professional", "friendly", "bold", "minimal"}

TONE_DESCRIPTORS: dict[str, str] = {
    "professional": (
        "Write in a polished, credible, business-professional tone. "
        "Clear and confident without being stiff."
    ),
    "friendly": (
        "Write in a warm, approachable, human tone. "
        "Conversational but still professional."
    ),
    "bold": (
        "Write in a direct, energetic, impactful tone. "
        "Short punchy sentences. Confident and forward-leaning."
    ),
    "minimal": (
        "Write in a sparse, restrained tone. "
        "Fewer words, no fluff. Only essential information."
    ),
}

# ─── Safety system prompt ─────────────────────────────────────────────────────

SAFETY_PREAMBLE = """
You are a professional careers-page copywriter assisting a recruiter.

STRICT RULES — follow these without exception:
1. Never invent company facts, statistics, employee counts, or awards.
2. Never fabricate salary, compensation, or benefit details.
3. Never invent specific technologies, tools, or programming languages.
4. Never claim achievements or accolades unless explicitly provided in the input.
5. Preserve all factual information supplied in the input (location, salary range, job type, etc.).
6. Write around missing information rather than fabricating it.
7. Avoid generic buzzword-heavy language ("world-class", "rockstar", "ninja", "passionate").
8. Do not make discriminatory hiring statements.
9. Do not target or exclude protected classes.
10. Do not generate illegal hiring requirements.
11. Do not modify factual job requirements — only improve the wording if asked.
12. Output only the requested JSON structure. No markdown fences, no prose outside JSON.
""".strip()


# ─── Prompt builders ──────────────────────────────────────────────────────────

def _build_hero_prompt(
    company_name: str,
    existing_headline: str,
    existing_description: str,
    tone: str,
) -> str:
    return f"""{SAFETY_PREAMBLE}

TASK: Generate a careers-page Hero section for {company_name!r}.

Tone: {TONE_DESCRIPTORS[tone]}

Context provided by the recruiter:
- Company name: {company_name}
- Existing headline: {existing_headline or "(none)"}
- Existing description: {existing_description or "(none)"}

Generate improved copy for the Hero section.

Return ONLY this JSON (no markdown, no code fences):
{{
  "headline": "<compelling headline, max 12 words>",
  "description": "<supporting description, 1-2 sentences, max 40 words>",
  "cta": "<call-to-action button text, max 5 words>"
}}"""


def _build_about_prompt(
    company_name: str,
    existing_content: str,
    tone: str,
) -> str:
    return f"""{SAFETY_PREAMBLE}

TASK: Generate an About section for {company_name!r}'s careers page.

Tone: {TONE_DESCRIPTORS[tone]}

Context provided by the recruiter:
- Company name: {company_name}
- Existing content: {existing_content or "(none)"}

Generate improved About copy. Base your writing only on the provided context.

Return ONLY this JSON (no markdown, no code fences):
{{
  "headline": "<section headline, max 8 words>",
  "body": "<body copy, 2-4 sentences, max 80 words>"
}}"""


def _build_culture_prompt(
    company_name: str,
    existing_content: str,
    tone: str,
) -> str:
    return f"""{SAFETY_PREAMBLE}

TASK: Generate a Culture section for {company_name!r}'s careers page.

Tone: {TONE_DESCRIPTORS[tone]}

Context provided by the recruiter:
- Company name: {company_name}
- Existing content: {existing_content or "(none)"}

Generate 3 or 4 culture/values items. Do not invent specific company claims.

Return ONLY this JSON (no markdown, no code fences):
{{
  "headline": "<section headline, max 8 words>",
  "intro": "<1-2 sentence intro, max 30 words>",
  "values": [
    {{"title": "<value title, max 4 words>", "description": "<1 sentence, max 20 words>"}},
    {{"title": "<value title, max 4 words>", "description": "<1 sentence, max 20 words>"}},
    {{"title": "<value title, max 4 words>", "description": "<1 sentence, max 20 words>"}}
  ]
}}"""


def _build_job_description_prompt(
    job_title: str,
    department: str | None,
    location: str | None,
    work_policy: str | None,
    job_type: str | None,
    experience_level: str | None,
    salary_range: str | None,
    existing_description: str | None,
    tone: str,
) -> str:
    facts = []
    if job_title:
        facts.append(f"- Title: {job_title}")
    if department:
        facts.append(f"- Department: {department}")
    if location:
        facts.append(f"- Location: {location}")
    if work_policy:
        facts.append(f"- Work style: {work_policy}")
    if job_type:
        facts.append(f"- Employment type: {job_type}")
    if experience_level:
        facts.append(f"- Experience level: {experience_level}")
    if salary_range:
        facts.append(f"- Salary range (preserve exactly): {salary_range}")
    facts_str = "\n".join(facts) if facts else "(no structured fields provided)"

    return f"""{SAFETY_PREAMBLE}

TASK: Write or improve a job description for a {job_title!r} role.

Tone: {TONE_DESCRIPTORS[tone]}

Factual fields from the recruiter (preserve all of these; do NOT invent additional facts):
{facts_str}

Existing description (improve the writing but preserve factual content):
{existing_description or "(none — write a general description based only on the provided fields)"}

Do NOT invent technologies, specific responsibilities, salary, benefits, team size, or company claims.

Return ONLY this JSON (no markdown, no code fences):
{{
  "description": "<improved job description, max 300 words, plain text>"
}}"""


# ─── Core service function ────────────────────────────────────────────────────

def generate_career_copy(
    content_type: str,
    tone: str,
    context: dict[str, Any],
    company_name: str,
) -> dict[str, Any]:
    """
    Generate AI career copy using Gemini.

    Args:
        content_type: One of ALLOWED_CONTENT_TYPES.
        tone:         One of ALLOWED_TONES.
        context:      Recruiter-supplied context fields (already validated/sanitized upstream).
        company_name: Company name from the authenticated recruiter's membership.

    Returns:
        Parsed dict matching the expected structure for the content_type.

    Raises:
        RuntimeError: If Gemini is not configured, the request fails, or the
                      response cannot be parsed into the expected structure.
    """
    if not settings.GEMINI_API_KEY:
        raise RuntimeError(
            "AI_NOT_CONFIGURED: Gemini API key is not set. "
            "Set GEMINI_API_KEY in the server environment."
        )

    # Build prompt
    if content_type == "hero":
        prompt = _build_hero_prompt(
            company_name=company_name,
            existing_headline=context.get("headline", ""),
            existing_description=context.get("description", ""),
            tone=tone,
        )
    elif content_type == "about":
        prompt = _build_about_prompt(
            company_name=company_name,
            existing_content=context.get("content", ""),
            tone=tone,
        )
    elif content_type == "culture":
        prompt = _build_culture_prompt(
            company_name=company_name,
            existing_content=context.get("content", ""),
            tone=tone,
        )
    elif content_type == "job_description":
        prompt = _build_job_description_prompt(
            job_title=context.get("title", ""),
            department=context.get("department"),
            location=context.get("location"),
            work_policy=context.get("work_policy"),
            job_type=context.get("job_type"),
            experience_level=context.get("experience_level"),
            salary_range=context.get("salary_range"),
            existing_description=context.get("description"),
            tone=tone,
        )
    else:
        raise ValueError(f"Unsupported content_type: {content_type}")

    # Call Gemini — import lazily so startup doesn't fail if SDK missing
    try:
        from google import genai  # type: ignore[import]
        from google.genai import types as genai_types  # type: ignore[import]
    except ImportError as exc:
        raise RuntimeError(
            "AI_NOT_CONFIGURED: google-genai SDK is not installed."
        ) from exc

    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config=genai_types.GenerateContentConfig(
                max_output_tokens=600,
                temperature=0.7,
            ),
        )
    except Exception as exc:
        # Log the error type but NOT the key or full traceback
        logger.error(
            "Gemini API call failed: %s: %s",
            type(exc).__name__,
            str(exc)[:200],
        )
        raise RuntimeError("AI_API_ERROR: Gemini request failed.") from exc

    # Extract text from response
    raw_text = ""
    try:
        raw_text = response.text or ""
    except Exception:
        raw_text = ""

    if not raw_text.strip():
        raise RuntimeError("AI_EMPTY_RESPONSE: Gemini returned an empty response.")

    # Parse JSON — strip markdown fences if the model added them despite instructions
    text = raw_text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        # Drop first line (``` or ```json) and last line (```)
        text = "\n".join(lines[1:-1]).strip()

    try:
        result = json.loads(text)
    except json.JSONDecodeError as exc:
        logger.error(
            "Gemini response was not valid JSON. content_type=%s raw=%r",
            content_type,
            text[:500],
        )
        raise RuntimeError(
            "AI_PARSE_ERROR: Gemini returned an unexpected response format."
        ) from exc

    # Validate expected keys per content type
    _validate_structure(content_type, result)
    return result


def _validate_structure(content_type: str, data: dict[str, Any]) -> None:
    """Raise RuntimeError if required keys are missing from the AI response."""
    required: dict[str, list[str]] = {
        "hero": ["headline", "description", "cta"],
        "about": ["headline", "body"],
        "culture": ["headline", "intro", "values"],
        "job_description": ["description"],
    }
    missing = [k for k in required.get(content_type, []) if k not in data]
    if missing:
        raise RuntimeError(
            f"AI_PARSE_ERROR: Response missing required fields: {missing}"
        )
    # Validate culture values list
    if content_type == "culture":
        values = data.get("values", [])
        if not isinstance(values, list) or len(values) < 1:
            raise RuntimeError(
                "AI_PARSE_ERROR: Culture response must include at least one value item."
            )
        for item in values:
            if not isinstance(item, dict) or "title" not in item or "description" not in item:
                raise RuntimeError(
                    "AI_PARSE_ERROR: Each culture value must have 'title' and 'description'."
                )

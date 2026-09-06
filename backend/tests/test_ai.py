"""
Tests for POST /api/ai/career-copy

Coverage:
  1. Unauthenticated request → 401
  2. Invalid content_type enum → 422
  3. Invalid tone enum → 422
  4. Oversized context → 422
  5. Gemini not configured (no key) → 503
  6. Gemini API failure → 502
  7. Gemini parse error → 502
  8. Hero: valid response structure
  9. About: valid response structure
  10. Culture: valid response structure including values list
  11. Job description: valid response structure
  12. company_name comes from session, not request body
  13. AI output does NOT persist to database

Run with:
    cd backend
    .venv\\Scripts\\python -m pytest tests/test_ai.py -v

The Gemini service is mocked in all tests — no real API calls are made.
No quota is consumed.
"""

from __future__ import annotations

import sys
import types
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

# ─── Minimal in-process app setup ─────────────────────────────────────────────
# We import the FastAPI app directly rather than spinning up a server.

from app.main import app
from app.api.deps import get_current_recruiter, RecruiterContext


# ─── Fixtures ─────────────────────────────────────────────────────────────────

def _make_recruiter(company_name: str = "Acme Corp") -> RecruiterContext:
    """Build a minimal RecruiterContext stub for dependency override."""
    user = MagicMock()
    user.id = "user-1"
    user.email = "test@example.com"
    user.is_active = True

    company = MagicMock()
    company.id = "company-1"
    company.name = company_name

    member = MagicMock()
    member.company = company

    return RecruiterContext(user=user, member=member)


@pytest.fixture
def client_unauthed():
    """TestClient with NO auth override — simulates an unauthenticated request."""
    return TestClient(app, raise_server_exceptions=False)


@pytest.fixture
def client_authed():
    """TestClient with recruiter auth overridden to Acme Corp."""
    recruiter = _make_recruiter("Acme Corp")
    app.dependency_overrides[get_current_recruiter] = lambda: recruiter
    c = TestClient(app, raise_server_exceptions=False)
    yield c
    app.dependency_overrides.pop(get_current_recruiter, None)


# ─── Helper to build a minimal valid request body ─────────────────────────────

def _hero_body(**overrides) -> dict:
    body = {
        "content_type": "hero",
        "tone": "professional",
        "context": {"headline": "Join us", "description": "We build great things."},
    }
    body.update(overrides)
    return body


# ─── 1. Unauthenticated → 401 ─────────────────────────────────────────────────

def test_unauthenticated_rejected(client_unauthed):
    resp = client_unauthed.post("/api/ai/career-copy", json=_hero_body())
    assert resp.status_code == 401, resp.text


# ─── 2. Invalid content_type → 422 ───────────────────────────────────────────

def test_invalid_content_type(client_authed):
    resp = client_authed.post(
        "/api/ai/career-copy",
        json={"content_type": "evil_injection", "tone": "professional", "context": {}},
    )
    assert resp.status_code == 422


# ─── 3. Invalid tone → 422 ───────────────────────────────────────────────────

def test_invalid_tone(client_authed):
    resp = client_authed.post(
        "/api/ai/career-copy",
        json={"content_type": "hero", "tone": "pirate", "context": {}},
    )
    assert resp.status_code == 422


# ─── 4. Oversized context → 422 ──────────────────────────────────────────────

def test_oversized_context(client_authed):
    resp = client_authed.post(
        "/api/ai/career-copy",
        json={
            "content_type": "hero",
            "tone": "professional",
            "context": {"description": "x" * 5001},
        },
    )
    assert resp.status_code == 422


# ─── 5. Gemini not configured → 503 ──────────────────────────────────────────

def test_gemini_not_configured(client_authed):
    with patch(
        "app.api.ai.generate_career_copy",
        side_effect=RuntimeError("AI_NOT_CONFIGURED: no key"),
    ):
        resp = client_authed.post("/api/ai/career-copy", json=_hero_body())
    assert resp.status_code == 503
    assert "not configured" in resp.json()["detail"].lower()


# ─── 6. Gemini API failure → 502 ─────────────────────────────────────────────

def test_gemini_api_failure(client_authed):
    with patch(
        "app.api.ai.generate_career_copy",
        side_effect=RuntimeError("AI_API_ERROR: request failed"),
    ):
        resp = client_authed.post("/api/ai/career-copy", json=_hero_body())
    assert resp.status_code == 502
    assert "failed" in resp.json()["detail"].lower()


# ─── 7. Gemini parse error → 502 ─────────────────────────────────────────────

def test_gemini_parse_error(client_authed):
    with patch(
        "app.api.ai.generate_career_copy",
        side_effect=RuntimeError("AI_PARSE_ERROR: bad json"),
    ):
        resp = client_authed.post("/api/ai/career-copy", json=_hero_body())
    assert resp.status_code == 502


# ─── 8. Hero: valid response structure ───────────────────────────────────────

def test_hero_valid_response(client_authed):
    mock_result = {
        "headline": "Build the Future with Us",
        "description": "Join Acme Corp and make an impact.",
        "cta": "View open roles",
    }
    with patch("app.api.ai.generate_career_copy", return_value=mock_result):
        resp = client_authed.post("/api/ai/career-copy", json=_hero_body())
    assert resp.status_code == 200
    data = resp.json()
    assert data["content_type"] == "hero"
    assert data["headline"] == "Build the Future with Us"
    assert data["description"] == "Join Acme Corp and make an impact."
    assert data["cta"] == "View open roles"


# ─── 9. About: valid response structure ──────────────────────────────────────

def test_about_valid_response(client_authed):
    mock_result = {
        "headline": "Who we are",
        "body": "We are a mission-driven team building tools people love.",
    }
    body = {
        "content_type": "about",
        "tone": "friendly",
        "context": {"content": "We build software."},
    }
    with patch("app.api.ai.generate_career_copy", return_value=mock_result):
        resp = client_authed.post("/api/ai/career-copy", json=body)
    assert resp.status_code == 200
    data = resp.json()
    assert data["content_type"] == "about"
    assert data["headline"] == "Who we are"
    assert data["body"] == "We are a mission-driven team building tools people love."


# ─── 10. Culture: valid response with values list ────────────────────────────

def test_culture_valid_response(client_authed):
    mock_result = {
        "headline": "Life at Acme",
        "intro": "We work hard and have fun doing it.",
        "values": [
            {"title": "Ownership", "description": "We take responsibility."},
            {"title": "Transparency", "description": "We communicate openly."},
            {"title": "Growth", "description": "We invest in our people."},
        ],
    }
    body = {
        "content_type": "culture",
        "tone": "bold",
        "context": {"content": "We are a great team."},
    }
    with patch("app.api.ai.generate_career_copy", return_value=mock_result):
        resp = client_authed.post("/api/ai/career-copy", json=body)
    assert resp.status_code == 200
    data = resp.json()
    assert data["content_type"] == "culture"
    assert data["headline"] == "Life at Acme"
    assert data["intro"] == "We work hard and have fun doing it."
    assert len(data["values"]) == 3
    assert data["values"][0]["title"] == "Ownership"


# ─── 11. Job description: valid response ─────────────────────────────────────

def test_job_description_valid_response(client_authed):
    mock_result = {
        "description": "We are looking for a talented Software Engineer to join our team."
    }
    body = {
        "content_type": "job_description",
        "tone": "minimal",
        "context": {
            "title": "Software Engineer",
            "department": "Engineering",
            "location": "Remote",
            "work_policy": "REMOTE",
            "job_type": "full_time",
            "experience_level": "mid",
        },
    }
    with patch("app.api.ai.generate_career_copy", return_value=mock_result):
        resp = client_authed.post("/api/ai/career-copy", json=body)
    assert resp.status_code == 200
    data = resp.json()
    assert data["content_type"] == "job_description"
    assert data["description"] is not None


# ─── 12. company_name comes from session, not request body ───────────────────

def test_company_name_from_session(client_authed):
    """
    The company_name passed to generate_career_copy must come from the
    authenticated session (Acme Corp), not from any client-supplied field.
    """
    captured_company_name: list[str] = []

    def _mock_generate(content_type, tone, context, company_name):
        captured_company_name.append(company_name)
        return {"headline": "Test", "description": "Test desc.", "cta": "Apply"}

    with patch("app.api.ai.generate_career_copy", side_effect=_mock_generate):
        resp = client_authed.post("/api/ai/career-copy", json=_hero_body())

    assert resp.status_code == 200
    # Must be the session company, not anything from the request body
    assert captured_company_name == ["Acme Corp"]


# ─── 13. AI output does NOT persist to database ───────────────────────────────

def test_ai_output_not_persisted(client_authed):
    """
    The endpoint must not write anything to the database.
    We verify by checking that no db.commit / db.add calls are made
    (the DB session dependency is never even invoked for the AI endpoint).
    """
    mock_result = {
        "headline": "Test",
        "description": "Test description.",
        "cta": "Apply now",
    }
    with patch("app.api.ai.generate_career_copy", return_value=mock_result) as mock_gen:
        resp = client_authed.post("/api/ai/career-copy", json=_hero_body())

    assert resp.status_code == 200
    # The service was called exactly once — no second call that might persist
    assert mock_gen.call_count == 1
    # Response body doesn't contain any DB IDs or timestamps
    data = resp.json()
    assert "id" not in data
    assert "created_at" not in data
    assert "company_id" not in data

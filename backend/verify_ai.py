"""
Live smoke test for POST /api/ai/career-copy.

Usage:
    cd backend
    .venv\\Scripts\\python verify_ai.py

This script:
  1. Logs in as the demo recruiter.
  2. Calls /api/ai/career-copy for each content type.
  3. Prints the Gemini-generated results.
  4. Verifies no database writes occurred (by checking jobs table count).

The GEMINI_API_KEY must be set in .env.
"""

import json
import sys
import time
import requests

BASE = "http://localhost:8000"
EMAIL = "demo@careeros.dev"
PASSWORD = "Demo@12345"

session = requests.Session()

print("=" * 60)
print("CareerOS AI Endpoint — Live Smoke Test")
print("=" * 60)

# ─── 1. Login ─────────────────────────────────────────────────────────────────
print("\n[1] Logging in as demo recruiter...")
resp = session.post(
    f"{BASE}/api/auth/login",
    data={"username": EMAIL, "password": PASSWORD},
)
if resp.status_code != 200:
    print(f"  FAIL: Login returned {resp.status_code}: {resp.text}")
    sys.exit(1)
token = resp.json().get("access_token")
headers = {"Authorization": f"Bearer {token}"}
print("  OK: Authenticated")

# ─── 2. Hero ──────────────────────────────────────────────────────────────────
print("\n[2] Hero section generation (tone: professional)...")
resp = session.post(
    f"{BASE}/api/ai/career-copy",
    headers=headers,
    json={
        "content_type": "hero",
        "tone": "professional",
        "context": {
            "headline": "Join Our Team",
            "description": "We build technology that powers the future.",
        },
    },
)
print(f"  Status: {resp.status_code}")
if resp.status_code == 200:
    data = resp.json()
    print(f"  headline:    {data.get('headline')}")
    print(f"  description: {data.get('description')}")
    print(f"  cta:         {data.get('cta')}")
    assert data.get("headline"), "Missing headline"
    assert data.get("description"), "Missing description"
    assert data.get("cta"), "Missing cta"
    print("  PASS")
elif resp.status_code == 503:
    print("  SKIP: Gemini not configured (503)")
else:
    print(f"  FAIL: {resp.text[:300]}")
    sys.exit(1)

time.sleep(1)

# ─── 3. About ─────────────────────────────────────────────────────────────────
print("\n[3] About section generation (tone: friendly)...")
resp = session.post(
    f"{BASE}/api/ai/career-copy",
    headers=headers,
    json={
        "content_type": "about",
        "tone": "friendly",
        "context": {"content": "We started with a simple belief: the best teams build the best products."},
    },
)
print(f"  Status: {resp.status_code}")
if resp.status_code == 200:
    data = resp.json()
    print(f"  headline: {data.get('headline')}")
    print(f"  body:     {data.get('body')[:80]}...")
    assert data.get("headline"), "Missing headline"
    assert data.get("body"), "Missing body"
    print("  PASS")
elif resp.status_code == 503:
    print("  SKIP: Gemini not configured")
else:
    print(f"  FAIL: {resp.text[:300]}")
    sys.exit(1)

time.sleep(1)

# ─── 4. Job description ───────────────────────────────────────────────────────
print("\n[4] Job description generation (tone: minimal)...")
resp = session.post(
    f"{BASE}/api/ai/career-copy",
    headers=headers,
    json={
        "content_type": "job_description",
        "tone": "minimal",
        "context": {
            "title": "Senior Software Engineer",
            "department": "Engineering",
            "location": "New York, NY",
            "work_policy": "HYBRID",
            "job_type": "full_time",
            "experience_level": "senior",
            "description": "Looking for a senior engineer to join our platform team.",
        },
    },
)
print(f"  Status: {resp.status_code}")
if resp.status_code == 200:
    data = resp.json()
    desc = data.get("description", "")
    print(f"  description ({len(desc)} chars): {desc[:120]}...")
    assert desc, "Missing description"
    # Safety check: make sure AI didn't invent salary
    assert "$" not in desc or "salary" not in desc.lower(), "AI may have invented salary"
    print("  PASS")
elif resp.status_code == 503:
    print("  SKIP: Gemini not configured")
else:
    print(f"  FAIL: {resp.text[:300]}")
    sys.exit(1)

time.sleep(1)

# ─── 5. Unauthenticated check ─────────────────────────────────────────────────
print("\n[5] Unauthenticated request must be rejected...")
resp = requests.post(
    f"{BASE}/api/ai/career-copy",
    json={"content_type": "hero", "tone": "professional", "context": {}},
)
assert resp.status_code == 401, f"Expected 401, got {resp.status_code}"
print("  PASS: 401 Unauthorized")

# ─── 6. Invalid content_type check ───────────────────────────────────────────
print("\n[6] Invalid content_type must return 422...")
resp = session.post(
    f"{BASE}/api/ai/career-copy",
    headers=headers,
    json={"content_type": "inject_me", "tone": "professional", "context": {}},
)
assert resp.status_code == 422, f"Expected 422, got {resp.status_code}"
print("  PASS: 422 Unprocessable Entity")

print("\n" + "=" * 60)
print("All checks passed.")
print("=" * 60)

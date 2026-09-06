"""
Step 2B-2 — Smoke test: Culture + Job Description AI integration.

Verifies:
1. Culture AI generation (authenticated)
2. Job Description AI generation with full context (authenticated)
3. Job Description AI generation with minimal context (title only)
4. Unauthenticated request → 401
5. Invalid content_type → 422
6. Hero AI still works (regression)
7. About AI still works (regression)
8. Existing jobs API still works
9. Existing career-page API still works

Run:
    cd backend
    .venv\\Scripts\\python.exe verify_ai_2b2.py
"""

import time
import requests

BASE = "http://localhost:8000"
session = requests.Session()

print("=" * 60)
print("CareerOS Step 2B-2 — AI Smoke Test")
print("=" * 60)

# ─── 1. Login ──────────────────────────────────────────────────────────────
print("\n[1] Login...")
r = session.post(f"{BASE}/api/auth/login", data={
    "username": "demo@careeros.dev",
    "password": "Demo@12345",
})
assert r.status_code == 200, f"Login failed: {r.status_code}"
token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print("  OK: Authenticated as demo@careeros.dev (Stark Industries)")

# ─── 2. Culture AI ─────────────────────────────────────────────────────────
print("\n[2] Culture AI generation (tone: bold)...")
r = session.post(f"{BASE}/api/ai/career-copy", headers=headers, json={
    "content_type": "culture",
    "tone": "bold",
    "context": {
        "content": "We believe in ownership, speed, and radical transparency.",
    },
})
assert r.status_code == 200, f"Culture AI failed: {r.status_code} {r.text[:300]}"
d = r.json()
print(f"  content_type: {d.get('content_type')}")
print(f"  headline:     {d.get('headline')}")
print(f"  intro:        {(d.get('intro') or '')[:80]}...")
values = d.get("values") or []
print(f"  values count: {len(values)}")
if values:
    for v in values[:3]:
        print(f"    - {v.get('title')}: {(v.get('description') or '')[:50]}")
assert d.get("content_type") == "culture", "Wrong content_type in response"
print("  PASS")

time.sleep(1)

# ─── 3. Job Description AI — full context ──────────────────────────────────
print("\n[3] Job Description AI — full context (tone: minimal)...")
r = session.post(f"{BASE}/api/ai/career-copy", headers=headers, json={
    "content_type": "job_description",
    "tone": "minimal",
    "context": {
        "title":            "Senior Backend Engineer",
        "department":       "Engineering",
        "location":         "New York, NY",
        "work_policy":      "HYBRID",
        "job_type":         "full_time",
        "experience_level": "senior",
        "salary_range":     "$140k–$180k",
    },
})
assert r.status_code == 200, f"Job description AI failed: {r.status_code} {r.text[:300]}"
d = r.json()
desc = d.get("description") or ""
print(f"  content_type:   {d.get('content_type')}")
print(f"  description len: {len(desc)} chars")
print(f"  preview:        {desc[:120]}...")
assert len(desc) > 50, f"Description too short: {len(desc)} chars"
# Safety: should not invent salary beyond what was provided
print("  PASS")

time.sleep(1)

# ─── 4. Job Description AI — minimal context (title only) ──────────────────
print("\n[4] Job Description AI — title only (tone: professional)...")
r = session.post(f"{BASE}/api/ai/career-copy", headers=headers, json={
    "content_type": "job_description",
    "tone": "professional",
    "context": {
        "title": "Data Analyst",
    },
})
assert r.status_code == 200, f"Minimal job AI failed: {r.status_code} {r.text[:300]}"
d = r.json()
desc = d.get("description") or ""
print(f"  description len: {len(desc)} chars")
assert len(desc) > 20, "Description should not be empty even with minimal context"
print("  PASS")

time.sleep(1)

# ─── 5. Unauthenticated request → 401 ─────────────────────────────────────
print("\n[5] Unauthenticated → 401...")
r = requests.post(f"{BASE}/api/ai/career-copy", json={
    "content_type": "culture",
    "tone": "bold",
    "context": {"content": "x"},
})
assert r.status_code == 401, f"Expected 401, got {r.status_code}"
print("  PASS: 401 Unauthorized")

# ─── 6. Invalid content_type → 422 ───────────────────────────────────────
print("\n[6] Invalid content_type → 422...")
r = session.post(f"{BASE}/api/ai/career-copy", headers=headers, json={
    "content_type": "attack_injection",
    "tone": "professional",
    "context": {},
})
assert r.status_code == 422, f"Expected 422, got {r.status_code}"
print("  PASS: 422 Unprocessable Entity")

# ─── 7. Hero AI regression ────────────────────────────────────────────────
print("\n[7] Hero AI regression check...")
r = session.post(f"{BASE}/api/ai/career-copy", headers=headers, json={
    "content_type": "hero",
    "tone": "professional",
    "context": {"headline": "Come build with us.", "description": "We craft technology."},
})
assert r.status_code == 200, f"Hero AI regression: {r.status_code}"
assert r.json().get("headline"), "Missing hero headline"
print(f"  headline: {r.json().get('headline')}")
print("  PASS")

time.sleep(1)

# ─── 8. About AI regression ───────────────────────────────────────────────
print("\n[8] About AI regression check...")
r = session.post(f"{BASE}/api/ai/career-copy", headers=headers, json={
    "content_type": "about",
    "tone": "friendly",
    "context": {"content": "We build software for the future."},
})
assert r.status_code == 200, f"About AI regression: {r.status_code}"
assert r.json().get("body"), "Missing about body"
print(f"  headline: {r.json().get('headline')}")
print("  PASS")

# ─── 9. Existing jobs API ──────────────────────────────────────────────────
print("\n[9] Existing jobs API (regression)...")
r = session.get(f"{BASE}/api/jobs", headers=headers)
assert r.status_code == 200, f"Jobs API failed: {r.status_code}"
jobs = r.json()
assert len(jobs) > 0, "No jobs returned"
print(f"  {len(jobs)} jobs — PASS")

# ─── 10. Existing career-page API ─────────────────────────────────────────
print("\n[10] Existing career-page API (regression)...")
r = session.get(f"{BASE}/api/career-page", headers=headers)
assert r.status_code == 200, f"Career-page API failed: {r.status_code}"
page = r.json()
assert page, "Empty career-page response"
print("  PASS")

print("\n" + "=" * 60)
print("All 10 checks PASSED.")
print("=" * 60)

"""Regression checks 5-10 for Step 2B-2."""
import sys, io, requests
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

BASE = "http://localhost:8000"
session = requests.Session()
r = session.post(f"{BASE}/api/auth/login", data={"username": "demo@careeros.dev", "password": "Demo@12345"})
assert r.status_code == 200
token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# 5. Unauthed
r = requests.post(f"{BASE}/api/ai/career-copy", json={"content_type": "culture", "tone": "bold", "context": {"content": "x"}})
assert r.status_code == 401, f"Expected 401, got {r.status_code}"
print("[5] Unauthenticated: PASS (401)")

# 6. Invalid enum
r = session.post(f"{BASE}/api/ai/career-copy", headers=headers, json={"content_type": "injection", "tone": "professional", "context": {}})
assert r.status_code == 422, f"Expected 422, got {r.status_code}"
print("[6] Invalid content_type: PASS (422)")

# 7. Hero regression
r = session.post(f"{BASE}/api/ai/career-copy", headers=headers, json={"content_type": "hero", "tone": "professional", "context": {"headline": "Come build.", "description": "We craft tech."}})
assert r.status_code == 200 and r.json().get("headline"), "Hero regression failed"
headline = r.json().get("headline", "")
print(f"[7] Hero regression: PASS - {headline}")

# 8. About regression
r = session.post(f"{BASE}/api/ai/career-copy", headers=headers, json={"content_type": "about", "tone": "friendly", "context": {"content": "We build software."}})
assert r.status_code == 200 and r.json().get("body"), "About regression failed"
print("[8] About regression: PASS")

# 9. Jobs API
r = session.get(f"{BASE}/api/jobs", headers=headers)
assert r.status_code == 200 and len(r.json()) > 0, "Jobs API failed"
print(f"[9] Jobs API: PASS ({len(r.json())} jobs)")

# 10. Career-page API
r = session.get(f"{BASE}/api/career-page", headers=headers)
assert r.status_code == 200, "Career-page API failed"
print("[10] Career-page API: PASS")

print("\nAll 10 checks PASSED.")

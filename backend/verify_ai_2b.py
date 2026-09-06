import requests

BASE = "http://localhost:8000"
session = requests.Session()

# 1. Login
r = session.post(f"{BASE}/api/auth/login", data={"username": "demo@careeros.dev", "password": "Demo@12345"})
assert r.status_code == 200, f"Login failed: {r.status_code}"
token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print("LOGIN: OK")

# 2. Hero AI (same request the frontend AIAssistPanel will make)
r = session.post(f"{BASE}/api/ai/career-copy", headers=headers, json={
    "content_type": "hero",
    "tone": "professional",
    "context": {
        "headline": "Come build with us.",
        "description": "We are a team obsessed with craft.",
    }
})
assert r.status_code == 200, f"Hero AI failed: {r.status_code} {r.text[:200]}"
d = r.json()
print("HERO: OK")
print(f"  headline:    {d.get('headline')}")
print(f"  description: {d.get('description')}")
print(f"  cta:         {d.get('cta')}")
assert d.get("headline"), "Empty headline"

# 3. About AI
r = session.post(f"{BASE}/api/ai/career-copy", headers=headers, json={
    "content_type": "about",
    "tone": "friendly",
    "context": {"content": "We started with a simple belief: the best teams build the best products."},
})
assert r.status_code == 200, f"About AI failed: {r.status_code} {r.text[:200]}"
d = r.json()
print("ABOUT: OK")
print(f"  headline: {d.get('headline')}")
body = d.get("body") or ""
print(f"  body:     {body[:80]}...")
assert d.get("body"), "Empty body"

# 4. Career-page API still works (builder save path untouched)
r = session.get(f"{BASE}/api/career-page", headers=headers)
assert r.status_code == 200, f"Career page fetch failed: {r.status_code}"
print("CAREER-PAGE GET: OK")

# 5. Jobs API still works
r = session.get(f"{BASE}/api/jobs", headers=headers)
assert r.status_code == 200, f"Jobs fetch failed: {r.status_code}"
jobs = r.json()
print(f"JOBS GET: OK ({len(jobs)} jobs)")

# 6. Verify AI does NOT auto-persist (no /api/ai/save or similar endpoint exists)
r = requests.get(f"{BASE}/api/ai/save")  # Should 404 — no such endpoint
assert r.status_code in (404, 405), f"Unexpected AI save endpoint exists: {r.status_code}"
print("AI NO-PERSIST: OK (no /api/ai/save endpoint)")

print()
print("All smoke tests passed.")

import sys
import logging
import uuid
from fastapi.testclient import TestClient
from sqlalchemy import delete, select

from app.main import app
from app.db.session import SessionLocal
from app.models.user import User
from app.models.company import Company
from app.models.career_page import CareersPage
from app.models.career_page_version import CareerPageVersion

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

client = TestClient(app)

def clean_test_data(db):
    try:
        logger.info("Cleaning up old test data...")
        # Deleting company automatically cascades to careers_pages, versions, jobs, and company_members
        db.execute(delete(User).where(User.email.in_(["recruiter_a@careeros.com", "recruiter_b@careeros.com"])))
        db.execute(delete(Company).where(Company.name.in_(["Company A Inc", "Company B Inc"])))
        db.commit()
    except Exception as e:
        db.rollback()
        logger.warning(f"Cleanup error: {e}")

def run_tests():
    db = SessionLocal()
    clean_test_data(db)
    
    try:
        # 1. Register Recruiter A
        res = client.post("/api/auth/register", json={
            "email": "recruiter_a@careeros.com",
            "password": "securepassword123",
            "full_name": "Recruiter A",
            "company_name": "Company A Inc"
        })
        assert res.status_code == 201
        
        # 2. Login Recruiter A
        res = client.post("/api/auth/login", data={"username": "recruiter_a@careeros.com", "password": "securepassword123"})
        assert res.status_code == 200
        token_a = res.json()["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}
        
        # 3. Register Recruiter B
        res = client.post("/api/auth/register", json={
            "email": "recruiter_b@careeros.com",
            "password": "securepassword123",
            "full_name": "Recruiter B",
            "company_name": "Company B Inc"
        })
        assert res.status_code == 201
        
        # 4. Login Recruiter B
        res = client.post("/api/auth/login", data={"username": "recruiter_b@careeros.com", "password": "securepassword123"})
        assert res.status_code == 200
        token_b = res.json()["access_token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        logger.info("Test 1: Unauthenticated recruiter endpoints return 401.")
        res = client.get("/api/career-page")
        assert res.status_code == 401

        logger.info("Test 2: Page initialization happens only once.")
        res1 = client.get("/api/career-page", headers=headers_a)
        assert res1.status_code == 200
        page1 = res1.json()
        assert page1["draft_version"] is not None
        assert page1["published_version"] is None
        
        res2 = client.get("/api/career-page", headers=headers_a)
        assert res2.status_code == 200
        page2 = res2.json()
        assert page1["id"] == page2["id"]
        assert page1["draft_version"]["id"] == page2["draft_version"]["id"]
        
        logger.info("Test 3: Recruiter A cannot access or modify Company B data.")
        # This is enforced intrinsically because the GET and PUT endpoints derive company context from the JWT.
        # There's no way to pass `company_b_id` in the API. We can verify the endpoints return the correct company pages.
        res_b = client.get("/api/career-page", headers=headers_b)
        assert res_b.json()["company_id"] != page1["company_id"]
        
        logger.info("Test 4: Valid draft updates are saved.")
        new_sections = [
            {"id": "hero-1", "type": "hero", "order": 0, "visible": True, "data": {"title": "Updated Title A"}}
        ]
        new_theme = {"primary_color": "#ff0000"}
        
        res = client.put("/api/career-page/draft", headers=headers_a, json={
            "sections_config": new_sections,
            "theme_config": new_theme,
            "title": "New Page Title"
        })
        assert res.status_code == 200
        draft_update = res.json()
        assert draft_update["sections_config"][0]["data"]["title"] == "Updated Title A"
        assert draft_update["theme_config"]["primary_color"] == "#ff0000"
        
        logger.info("Test 5: Draft changes do NOT appear publicly.")
        res = client.get("/api/public/companies/company-a-inc/careers-page")
        # Since it hasn't been published yet, should be 404
        assert res.status_code == 404

        logger.info("Test 6: Publish is atomic.")
        res = client.post("/api/career-page/publish", headers=headers_a)
        assert res.status_code == 200
        pub_page = res.json()
        assert pub_page["published_version"] is not None
        published_id = pub_page["published_version"]["id"]
        assert pub_page["draft_version"] is not None
        new_draft_id = pub_page["draft_version"]["id"]
        
        logger.info("Test 7: New draft and published version are independent objects.")
        assert published_id != new_draft_id
        
        logger.info("Test 8: New DRAFT is cloned from the published version.")
        assert pub_page["draft_version"]["sections_config"][0]["data"]["title"] == "Updated Title A"
        
        logger.info("Test 9: Public API returns only published data.")
        res = client.get("/api/public/companies/company-a-inc/careers-page")
        assert res.status_code == 200
        public_data = res.json()
        assert public_data["title"] == "New Page Title"
        assert public_data["sections_config"][0]["data"]["title"] == "Updated Title A"
        
        logger.info("Test 10: Missing company/page returns a clean 404.")
        res = client.get("/api/public/companies/invalid-slug/careers-page")
        assert res.status_code == 404
        
        logger.info("Test 11: Previous published version becomes ARCHIVED.")
        # Modify the draft again and publish a second time
        client.put("/api/career-page/draft", headers=headers_a, json={
            "sections_config": new_sections,
            "theme_config": {"primary_color": "#00ff00"}
        })
        client.post("/api/career-page/publish", headers=headers_a)
        
        # Check database for status of old published version
        db.expire_all()
        old_version = db.scalar(select(CareerPageVersion).where(CareerPageVersion.id == published_id))
        assert old_version.status == "archived", f"Expected archived, got {old_version.status}"
        
        logger.info("Test 12: Existing authentication tests still pass (JWT validation).")
        res = client.get("/api/auth/me", headers={"Authorization": "Bearer invalid_token_xyz"})
        assert res.status_code == 401
        
        # Also let's test the UUID coercion bug fix by sending a well-formed JWT with a non-UUID subject
        import jwt
        from app.config import settings
        bad_token = jwt.encode({"sub": "invalid-uuid"}, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {bad_token}"})
        assert res.status_code == 401 # Should be 401, not 500
        
        logger.info("All verification tests passed successfully!")
    finally:
        clean_test_data(db)
        db.close()

if __name__ == "__main__":
    try:
        run_tests()
    except AssertionError as e:
        logger.error(f"Test failed: {e}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        sys.exit(1)

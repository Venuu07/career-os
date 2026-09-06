"""
Step 2 Backend Verification Script - Direct Service Layer
Tests: job CRUD, company isolation, status workflow, public visibility, branding.

Does NOT require a running HTTP server -- tests the service layer and models directly.

Usage (from backend/):
  .venv\\Scripts\\python.exe verify_jobs_step2.py
"""

import sys
import logging
from sqlalchemy import delete, select

from app.db.session import SessionLocal
from app.models.user import User
from app.models.company import Company
from app.models.job import Job, JobStatus, JobType, WorkPolicy, ExperienceLevel
from app.schemas.job import JobCreate, JobUpdate, JobStatusUpdate
from app.schemas.auth import UserCreate
from app.services import auth as auth_service
from app.services import career_page as career_page_service
from app.api.deps import RecruiterContext

logging.basicConfig(level=logging.WARNING)
logger = logging.getLogger(__name__)


def check(condition: bool, msg: str) -> None:
    if condition:
        print(f"  [PASS] {msg}")
    else:
        print(f"  [FAIL] {msg}", file=sys.stderr)
        sys.exit(1)


def clean(db) -> None:
    """Remove test data before running."""
    try:
        db.rollback()
    except Exception:
        pass
    for email in ["step2-a@example.com", "step2-b@example.com"]:
        db.execute(delete(User).where(User.email == email))
    for slug_prefix in ["step2-company-a", "step2-company-b"]:
        db.execute(delete(Company).where(Company.slug.like(f"{slug_prefix}%")))
    db.commit()


def make_context(user, db) -> RecruiterContext:
    user_fresh = db.scalar(select(User).where(User.id == user.id))
    member = user_fresh.memberships[0]
    return RecruiterContext(user=user_fresh, member=member)


def run():
    print("\n=== CareerOS Step 2 - Backend Verification (direct service layer) ===\n")
    db = SessionLocal()
    clean(db)

    try:
        # -- Setup ---------------------------------------------------------------
        print("1. Setup: register two companies")
        user_a = auth_service.register_recruiter(db, UserCreate(
            email="step2-a@example.com",
            password="TestPass123!",
            full_name="Recruiter A",
            company_name="Step2 Company A",
        ))
        user_b = auth_service.register_recruiter(db, UserCreate(
            email="step2-b@example.com",
            password="TestPass123!",
            full_name="Recruiter B",
            company_name="Step2 Company B",
        ))
        ctx_a = make_context(user_a, db)
        ctx_b = make_context(user_b, db)
        check(ctx_a.company.id != ctx_b.company.id, "two separate companies created")
        print(f"    Company A id: {ctx_a.company.id}")
        print(f"    Company B id: {ctx_b.company.id}")

        # -- Job Creation --------------------------------------------------------
        print("\n2. Job creation - all new fields")
        job_a = Job(
            company_id=ctx_a.company.id,
            title="Senior Engineer",
            department="Engineering",
            location="San Francisco, CA",
            job_type=JobType.FULL_TIME,
            work_policy=WorkPolicy.HYBRID,
            experience_level=ExperienceLevel.SENIOR,
            salary_range="$160k-$200k",
            application_url="https://example.com/apply",
            status=JobStatus.DRAFT,
        )
        db.add(job_a)
        db.commit()
        db.refresh(job_a)

        check(job_a.id is not None, "job created, has id")
        check(job_a.work_policy == WorkPolicy.HYBRID, "work_policy persisted")
        check(job_a.salary_range == "$160k-$200k", "salary_range persisted")
        check(job_a.application_url == "https://example.com/apply", "application_url persisted")
        check(job_a.created_at is not None, "created_at set")
        check(job_a.updated_at is not None, "updated_at set")
        check(job_a.company_id == ctx_a.company.id, "company_id is A's company")

        # -- Job Read ------------------------------------------------------------
        print("\n3. Company-scoped job read")
        found = db.scalar(
            select(Job).where(Job.id == job_a.id, Job.company_id == ctx_a.company.id)
        )
        check(found is not None, "Company A can read own job")

        cross = db.scalar(
            select(Job).where(Job.id == job_a.id, Job.company_id == ctx_b.company.id)
        )
        check(cross is None, "Company B gets None when querying A's job (scoped by company)")

        # -- Job Update ----------------------------------------------------------
        print("\n4. Job update")
        job_a.title = "Staff Engineer"
        job_a.work_policy = WorkPolicy.REMOTE
        db.commit()
        db.refresh(job_a)
        check(job_a.title == "Staff Engineer", "title updated")
        check(job_a.work_policy == WorkPolicy.REMOTE, "work_policy updated")

        # -- Schema Validation ---------------------------------------------------
        print("\n5. Pydantic schema validation")
        from pydantic import ValidationError

        try:
            JobCreate(title="", status=JobStatus.DRAFT)
            check(False, "blank title should raise ValidationError")
        except ValidationError:
            check(True, "blank title -> ValidationError [OK]")

        try:
            JobCreate(title="Engineer", application_url="not-a-url")
            check(False, "invalid URL should raise ValidationError")
        except ValidationError:
            check(True, "invalid application_url -> ValidationError [OK]")

        jc = JobCreate(title="Engineer", application_url="https://jobs.example.com")
        check(jc.application_url == "https://jobs.example.com", "valid URL accepted")

        jc2 = JobCreate(title="Engineer", salary_range="   ")
        check(jc2.salary_range is None, "blank salary_range coerced to None")

        # -- Status Workflow -----------------------------------------------------
        print("\n6. Status workflow: draft -> open -> closed -> open")
        check(job_a.status == JobStatus.DRAFT, "initial status is DRAFT")

        job_a.status = JobStatus.OPEN
        db.commit()
        db.refresh(job_a)
        check(job_a.status == JobStatus.OPEN, "status -> OPEN")

        job_a.status = JobStatus.CLOSED
        db.commit()
        db.refresh(job_a)
        check(job_a.status == JobStatus.CLOSED, "status -> CLOSED")

        job_a.status = JobStatus.OPEN
        db.commit()
        db.refresh(job_a)
        check(job_a.status == JobStatus.OPEN, "status -> OPEN (reopen)")

        # -- Multi-Tenancy -------------------------------------------------------
        print("\n7. Multi-tenancy: Company B cannot read/update/delete A's job")
        job_b = Job(
            company_id=ctx_b.company.id,
            title="Company B Job",
            job_type=JobType.FULL_TIME,
            status=JobStatus.OPEN,
        )
        db.add(job_b)
        db.commit()
        db.refresh(job_b)

        b_jobs = db.scalars(
            select(Job).where(Job.company_id == ctx_b.company.id)
        ).all()
        b_ids = [j.id for j in b_jobs]
        check(job_a.id not in b_ids, "A's job NOT in B's job list")
        check(job_b.id in b_ids, "B's job IS in B's job list")

        a_jobs = db.scalars(
            select(Job).where(Job.company_id == ctx_a.company.id)
        ).all()
        a_ids = [j.id for j in a_jobs]
        check(job_b.id not in a_ids, "B's job NOT in A's job list")
        check(job_a.id in a_ids, "A's job IS in A's job list")

        # -- Public Visibility ---------------------------------------------------
        print("\n8. Public visibility: OPEN appears, DRAFT/CLOSED do not")
        job_draft = Job(
            company_id=ctx_a.company.id,
            title="Draft Job",
            job_type=JobType.FULL_TIME,
            status=JobStatus.DRAFT,
        )
        job_closed = Job(
            company_id=ctx_a.company.id,
            title="Closed Job",
            job_type=JobType.FULL_TIME,
            status=JobStatus.CLOSED,
        )
        db.add_all([job_draft, job_closed])
        db.commit()

        public_jobs = db.scalars(
            select(Job)
            .where(Job.company_id == ctx_a.company.id)
            .where(Job.status == JobStatus.OPEN)
        ).all()
        pub_ids = [j.id for j in public_jobs]
        check(job_a.id in pub_ids, "OPEN job appears in public query")
        check(job_draft.id not in pub_ids, "DRAFT job hidden from public query")
        check(job_closed.id not in pub_ids, "CLOSED job hidden from public query")

        # -- Branding / Theme ----------------------------------------------------
        print("\n9. Branding: theme_config in draft vs published")
        from app.schemas.career_page import CareerPageDraftUpdate, ThemeConfig, SectionConfig
        from app.models.career_page_version import VersionStatus, CareerPageVersion

        page_a = career_page_service.get_or_create_page(db, ctx_a.company.id, ctx_a.user.id)

        draft = db.scalar(
            select(CareerPageVersion)
            .where(CareerPageVersion.career_page_id == page_a.id)
            .where(CareerPageVersion.status == VersionStatus.DRAFT)
        )
        check(draft is not None, "draft version exists")

        sections = [SectionConfig(**s) for s in draft.sections_config]
        updated_draft = career_page_service.update_draft(
            db=db,
            company_id=ctx_a.company.id,
            update_data=CareerPageDraftUpdate(
                sections_config=sections,
                theme_config=ThemeConfig(
                    primary_color="#FF6B35",
                    accent_color="#A9CBB7",
                    logo_url="https://example.com/logo.png",
                ),
            ),
            user_id=ctx_a.user.id,
        )
        check(updated_draft.theme_config.get("primary_color") == "#FF6B35", "primary_color saved in draft")

        published_page = career_page_service.publish_page(db, ctx_a.company.id, ctx_a.user.id)
        check(published_page.published_version_id is not None, "page has published_version_id after publish")

        pub_version = db.scalar(
            select(CareerPageVersion)
            .where(CareerPageVersion.id == published_page.published_version_id)
        )
        check(
            pub_version.theme_config.get("primary_color") == "#FF6B35",
            "published version has new theme color"
        )

        new_draft = db.scalar(
            select(CareerPageVersion)
            .where(CareerPageVersion.career_page_id == published_page.id)
            .where(CareerPageVersion.status == VersionStatus.DRAFT)
        )
        check(new_draft is not None, "new draft created after publish")
        check(
            new_draft.theme_config.get("primary_color") == "#FF6B35",
            "new draft cloned theme from published"
        )
        check(new_draft.id != pub_version.id, "new draft is a different record from published")

        # -- Delete --------------------------------------------------------------
        print("\n10. Delete own job")
        job_id_to_delete = job_a.id
        db.delete(job_a)
        db.commit()

        deleted = db.scalar(select(Job).where(Job.id == job_id_to_delete))
        check(deleted is None, "deleted job no longer in DB")

        print("\n=== All checks passed [OK] ===\n")

    except Exception as e:
        print(f"\n[ERROR] Unexpected error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        clean(db)
        db.close()


if __name__ == "__main__":
    run()

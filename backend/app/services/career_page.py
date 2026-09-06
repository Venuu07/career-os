from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select, update
from fastapi import HTTPException, status

from app.models.career_page import CareersPage
from app.models.career_page_version import CareerPageVersion, VersionStatus
from app.models.company import Company
from app.models.job import Job, JobStatus
from app.schemas.career_page import CareerPageDraftUpdate

DEFAULT_SECTIONS = [
    {"id": "hero-1", "type": "hero", "order": 0, "visible": True, "data": {"title": "Join our team"}},
    {"id": "about-1", "type": "about", "order": 1, "visible": True, "data": {"content": "We started with a simple belief: that the best teams build the best products. We're on a mission to make work more meaningful for everyone."}},
    {"id": "culture-1", "type": "culture", "order": 2, "visible": True, "data": {"content": "Our culture is amazing."}},
    {"id": "jobs-1", "type": "jobs", "order": 3, "visible": True, "data": {}}
]

def get_or_create_page(db: Session, company_id: UUID, user_id: UUID) -> CareersPage:
    """
    Get the existing CareersPage for a company, or initialize a new one with a default DRAFT version.
    """
    page = db.scalar(select(CareersPage).where(CareersPage.company_id == company_id))
    
    if page is None:
        try:
            page = CareersPage(company_id=company_id)
            db.add(page)
            db.flush()
            
            draft = CareerPageVersion(
                career_page_id=page.id,
                version_number=1,
                status=VersionStatus.DRAFT,
                sections_config=DEFAULT_SECTIONS,
                theme_config={},
                created_by_id=user_id
            )
            db.add(draft)
            db.commit()
            db.refresh(page)
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to initialize career page: {str(e)}")
            
    # Ensure there is always a DRAFT version available to edit
    draft = db.scalar(
        select(CareerPageVersion)
        .where(CareerPageVersion.career_page_id == page.id)
        .where(CareerPageVersion.status == VersionStatus.DRAFT)
    )
    
    if not draft:
        # If somehow there is no draft (e.g. after a direct DB manipulation), create one
        # cloned from the published version if it exists
        last_version = db.scalar(
            select(CareerPageVersion)
            .where(CareerPageVersion.career_page_id == page.id)
            .order_by(CareerPageVersion.version_number.desc())
            .limit(1)
        )
        v_num = (last_version.version_number + 1) if last_version else 1
        sections = last_version.sections_config if last_version else DEFAULT_SECTIONS
        theme = last_version.theme_config if last_version else {}
        
        draft = CareerPageVersion(
            career_page_id=page.id,
            version_number=v_num,
            status=VersionStatus.DRAFT,
            sections_config=sections,
            theme_config=theme,
            created_by_id=user_id
        )
        db.add(draft)
        db.commit()
        db.refresh(page)

    return page

def update_draft(
    db: Session, 
    company_id: UUID, 
    update_data: CareerPageDraftUpdate,
    user_id: UUID
) -> CareerPageVersion:
    """
    Update the current DRAFT version for the given company's CareersPage.
    """
    page = db.scalar(select(CareersPage).where(CareersPage.company_id == company_id))
    if not page:
        raise HTTPException(status_code=404, detail="Careers page not found")
        
    draft = db.scalar(
        select(CareerPageVersion)
        .where(CareerPageVersion.career_page_id == page.id)
        .where(CareerPageVersion.status == VersionStatus.DRAFT)
    )
    if not draft:
        raise HTTPException(status_code=404, detail="No active draft found")
        
    try:
        if update_data.title is not None:
            page.title = update_data.title
        if update_data.meta_description is not None:
            page.meta_description = update_data.meta_description
            
        # Pydantic models to dicts
        draft.sections_config = [s.model_dump() for s in update_data.sections_config]
        raw_theme = update_data.theme_config.model_dump(exclude_unset=True)
        # Strip null/empty social link values so only real URLs are stored
        if "social_links" in raw_theme and raw_theme["social_links"] is not None:
            raw_theme["social_links"] = {
                k: v for k, v in raw_theme["social_links"].items()
                if v  # keep only truthy (non-empty, non-null) values
            }
            if not raw_theme["social_links"]:
                raw_theme["social_links"] = None
        draft.theme_config = raw_theme
        draft.created_by_id = user_id
        
        db.commit()
        db.refresh(draft)
        return draft
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update draft: {str(e)}")

def publish_page(db: Session, company_id: UUID, user_id: UUID) -> CareersPage:
    """
    Atomic publish transaction:
    1. Find current DRAFT
    2. Archive previous PUBLISHED
    3. Promote DRAFT to PUBLISHED
    4. Update published_version_id
    5. Clone PUBLISHED into a new DRAFT
    """
    page = db.scalar(select(CareersPage).where(CareersPage.company_id == company_id))
    if not page:
        raise HTTPException(status_code=404, detail="Careers page not found")
        
    draft = db.scalar(
        select(CareerPageVersion)
        .where(CareerPageVersion.career_page_id == page.id)
        .where(CareerPageVersion.status == VersionStatus.DRAFT)
    )
    if not draft:
        raise HTTPException(status_code=400, detail="No draft version available to publish")
        
    try:
        now = datetime.now(timezone.utc)
        
        # 2. Archive previous PUBLISHED versions for this page
        db.execute(
            update(CareerPageVersion)
            .where(CareerPageVersion.career_page_id == page.id)
            .where(CareerPageVersion.status == VersionStatus.PUBLISHED)
            .values(status=VersionStatus.ARCHIVED)
        )
        
        # 3. Promote DRAFT to PUBLISHED
        draft.status = VersionStatus.PUBLISHED
        draft.published_at = now
        db.flush()
        
        # 4. Update careers_pages.published_version_id
        page.published_version_id = draft.id
        
        # 5. Create NEW DRAFT cloned from the published version
        new_draft = CareerPageVersion(
            career_page_id=page.id,
            version_number=draft.version_number + 1,
            status=VersionStatus.DRAFT,
            sections_config=draft.sections_config,
            theme_config=draft.theme_config,
            created_by_id=user_id
        )
        db.add(new_draft)
        
        db.commit()
        db.refresh(page)
        return page
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Publishing failed: {str(e)}")

def get_public_page(db: Session, company_slug: str) -> dict:
    """
    Fetch the public view of a Careers Page and its open jobs.

    Publication semantics:
    - Jobs are a company-level resource. An OPEN job is visible as soon as it
      is created — regardless of whether the recruiter has explicitly published
      the builder page version.
    - If a published CareerPageVersion exists, its sections_config and
      theme_config are used (stable, recruiter-approved snapshot).
    - If NO published version exists yet (page was never published from the
      builder), we fall back to the current DRAFT version so the page is still
      accessible. This lets recruiters add jobs immediately without needing to
      go through the builder publish flow first.
    - If neither a published nor draft version exists (edge case), we use empty
      defaults so the page is still reachable.
    - A 404 is only returned if the company itself does not exist.
    """
    company = db.scalar(select(Company).where(Company.slug == company_slug))
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    page = db.scalar(select(CareersPage).where(CareersPage.company_id == company.id))
    if not page:
        raise HTTPException(status_code=404, detail="Careers page not found")

    # Resolve the best available version: published → draft → empty defaults
    active_version = None
    if page.published_version_id:
        active_version = page.published_version
    if not active_version:
        # Fall back to draft so the page is reachable before first publish
        active_version = db.scalar(
            select(CareerPageVersion)
            .where(CareerPageVersion.career_page_id == page.id)
            .where(CareerPageVersion.status == VersionStatus.DRAFT)
        )

    sections_config = active_version.sections_config if active_version else DEFAULT_SECTIONS
    theme_config = active_version.theme_config if active_version else {}

    open_jobs = db.scalars(
        select(Job)
        .where(Job.company_id == company.id)
        .where(Job.status == JobStatus.OPEN)
        .order_by(Job.created_at.desc())
    ).all()

    return {
        "company_name": company.name,
        "slug": company.slug,
        "title": page.title,
        "meta_description": page.meta_description,
        "theme_config": theme_config,
        "sections_config": sections_config,
        "open_jobs": open_jobs,
    }


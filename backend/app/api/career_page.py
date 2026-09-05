from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_recruiter, RecruiterContext
from app.schemas.career_page import CareersPageResponse, CareerPageDraftUpdate, CareerPageVersionResponse
from app.services import career_page

router = APIRouter()

@router.get("", response_model=CareersPageResponse)
def get_career_page(
    db: Session = Depends(get_db),
    context: RecruiterContext = Depends(get_current_recruiter)
):
    """
    Get the recruiter's Careers Page. Initializes a new page + draft if none exists.
    """
    page = career_page.get_or_create_page(db, company_id=context.company.id, user_id=context.user.id)
    
    # We need to explicitly map the draft_version and published_version to match the response schema
    # since we want them easily accessible for the UI.
    from app.models.career_page_version import VersionStatus
    draft = next((v for v in page.versions if v.status == VersionStatus.DRAFT), None)
    
    # CareersPageResponse model_config=from_attributes handles mapping.
    # We just need to attach draft_version explicitly if our model expects it directly.
    # The SQLAlchemy relationships might not map perfectly to the Pydantic field if named differently.
    page.draft_version = draft
    
    return page

@router.put("/draft", response_model=CareerPageVersionResponse)
def save_draft(
    update_data: CareerPageDraftUpdate,
    db: Session = Depends(get_db),
    context: RecruiterContext = Depends(get_current_recruiter)
):
    """
    Update the current draft version of the careers page.
    """
    draft = career_page.update_draft(
        db=db,
        company_id=context.company.id,
        update_data=update_data,
        user_id=context.user.id
    )
    return draft

@router.post("/publish", response_model=CareersPageResponse)
def publish_page(
    db: Session = Depends(get_db),
    context: RecruiterContext = Depends(get_current_recruiter)
):
    """
    Publish the current draft version of the careers page atomically.
    """
    page = career_page.publish_page(db, company_id=context.company.id, user_id=context.user.id)
    
    from app.models.career_page_version import VersionStatus
    draft = next((v for v in page.versions if v.status == VersionStatus.DRAFT), None)
    page.draft_version = draft
    
    return page

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.career_page import PublicCareerPageResponse
from app.services import career_page

router = APIRouter()

@router.get("/companies/{slug}/careers-page", response_model=PublicCareerPageResponse)
def get_public_careers_page(
    slug: str,
    db: Session = Depends(get_db)
):
    """
    Get the published careers page and open jobs for a company by its slug.
    No authentication required.
    """
    return career_page.get_public_page(db, company_slug=slug)

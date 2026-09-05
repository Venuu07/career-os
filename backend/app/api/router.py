# pyrefly: ignore [missing-import]
from fastapi import APIRouter

from app.api import auth, career_page, public, jobs

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(career_page.router, prefix="/career-page", tags=["career_page"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
api_router.include_router(public.router, prefix="/public", tags=["public"])

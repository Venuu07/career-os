"""
Jobs API — recruiter-facing CRUD.

All endpoints require authentication and are company-scoped via the
authenticated recruiter's membership context.  The company_id is NEVER
taken from the request body; it always comes from the JWT → membership
lookup in get_current_recruiter().

Authorization model:
  - 404 for any job not belonging to the recruiter's company
    (prevents disclosure of other companies' job IDs / titles)
  - 422 for validation failures (Pydantic)
  - 401 / 403 for auth failures (handled by deps)
"""
import uuid as _uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db.session import get_db
from app.api.deps import get_current_recruiter, RecruiterContext
from app.models.job import Job, JobStatus
from app.schemas.job import JobResponse, JobCreate, JobUpdate, JobStatusUpdate

router = APIRouter()


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _parse_uuid(job_id: str) -> _uuid.UUID:
    """Parse and validate a job ID string, raising 404 on invalid format."""
    try:
        return _uuid.UUID(job_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")


def _get_owned_job(db: Session, job_id: str, context: RecruiterContext) -> Job:
    """
    Fetch a job by ID, scoped to the authenticated company.
    Returns 404 if the job does not exist OR belongs to another company.
    This prevents disclosure of other companies' resource existence.
    """
    uid = _parse_uuid(job_id)
    job = db.scalar(
        select(Job).where(Job.id == uid, Job.company_id == context.company.id)
    )
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return job


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.get("", response_model=list[JobResponse])
def list_jobs(
    db: Session = Depends(get_db),
    context: RecruiterContext = Depends(get_current_recruiter),
) -> Any:
    """
    List all jobs for the current recruiter's company.
    Includes DRAFT, OPEN, and CLOSED — recruiter sees everything.
    Returned newest-first.
    """
    jobs = db.scalars(
        select(Job)
        .where(Job.company_id == context.company.id)
        .order_by(Job.created_at.desc())
    ).all()
    return jobs


@router.get("/{job_id}", response_model=JobResponse)
def get_job(
    job_id: str,
    db: Session = Depends(get_db),
    context: RecruiterContext = Depends(get_current_recruiter),
) -> Any:
    """
    Get a single job by ID. Company-scoped.
    Returns 404 for any job not owned by the recruiter's company.
    """
    return _get_owned_job(db, job_id, context)


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    job_in: JobCreate,
    db: Session = Depends(get_db),
    context: RecruiterContext = Depends(get_current_recruiter),
) -> Any:
    """
    Create a new job for the current recruiter's company.
    company_id is always taken from the authenticated context, never from the body.
    """
    job = Job(
        company_id=context.company.id,  # ← always from auth context
        title=job_in.title,
        department=job_in.department,
        location=job_in.location,
        description=job_in.description,
        job_type=job_in.job_type,
        work_policy=job_in.work_policy,
        experience_level=job_in.experience_level,
        salary_range=job_in.salary_range,
        application_url=job_in.application_url,
        status=job_in.status,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@router.patch("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: str,
    job_in: JobUpdate,
    db: Session = Depends(get_db),
    context: RecruiterContext = Depends(get_current_recruiter),
) -> Any:
    """
    Partially update a job. Only the owning company may update it.
    Returns 404 for jobs belonging to other companies.
    """
    job = _get_owned_job(db, job_id, context)
    for field, value in job_in.model_dump(exclude_unset=True).items():
        setattr(job, field, value)
    db.commit()
    db.refresh(job)
    return job


@router.patch("/{job_id}/status", response_model=JobResponse)
def update_job_status(
    job_id: str,
    status_in: JobStatusUpdate,
    db: Session = Depends(get_db),
    context: RecruiterContext = Depends(get_current_recruiter),
) -> Any:
    """
    Convenience endpoint for status-only transitions.
    Supports: draft → open, open → closed, closed → open.
    """
    job = _get_owned_job(db, job_id, context)
    job.status = status_in.status
    db.commit()
    db.refresh(job)
    return job


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: str,
    db: Session = Depends(get_db),
    context: RecruiterContext = Depends(get_current_recruiter),
) -> None:
    """
    Delete a job. Only the owning company may delete it.
    Returns 404 for jobs belonging to other companies.
    """
    job = _get_owned_job(db, job_id, context)
    db.delete(job)
    db.commit()

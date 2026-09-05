from typing import Any
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db.session import get_db
from app.api.deps import get_current_recruiter, RecruiterContext
from app.models.job import Job, JobStatus
from app.schemas.job import JobResponse, JobCreate, JobUpdate

router = APIRouter()


@router.get("", response_model=list[JobResponse])
def list_jobs(
    db: Session = Depends(get_db),
    context: RecruiterContext = Depends(get_current_recruiter),
) -> Any:
    """
    List all jobs for the current recruiter's company.
    Returned in order of creation (newest first).
    """
    jobs = db.scalars(
        select(Job)
        .where(Job.company_id == context.company.id)
        .order_by(Job.created_at.desc())
    ).all()
    return jobs


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    job_in: JobCreate,
    db: Session = Depends(get_db),
    context: RecruiterContext = Depends(get_current_recruiter),
) -> Any:
    """
    Create a new job for the current recruiter's company.
    """
    job = Job(
        company_id=context.company.id,
        title=job_in.title,
        department=job_in.department,
        location=job_in.location,
        description=job_in.description,
        job_type=job_in.job_type,
        experience_level=job_in.experience_level,
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
    Update a job. Only the owning company may update it.
    """
    import uuid as _uuid
    try:
        uid = _uuid.UUID(job_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Job not found")

    job = db.scalar(
        select(Job).where(Job.id == uid, Job.company_id == context.company.id)
    )
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    for field, value in job_in.model_dump(exclude_unset=True).items():
        setattr(job, field, value)

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
    """
    import uuid as _uuid
    try:
        uid = _uuid.UUID(job_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Job not found")

    job = db.scalar(
        select(Job).where(Job.id == uid, Job.company_id == context.company.id)
    )
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    db.delete(job)
    db.commit()

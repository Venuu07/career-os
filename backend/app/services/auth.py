import re
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException, status

from app.models.user import User
from app.models.company import Company
from app.models.company_member import CompanyMember, MemberRole
from app.schemas.auth import UserCreate
from app.services.security import verify_password, get_password_hash


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email))


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def generate_company_slug(db: Session, name: str) -> str:
    # Basic slugify: lower case, remove non-alphanumeric, replace spaces with hyphens
    base_slug = re.sub(r'[^a-z0-9\s-]', '', name.lower()).strip()
    base_slug = re.sub(r'[\s-]+', '-', base_slug)
    
    if not base_slug:
        base_slug = "company"
        
    slug = base_slug
    counter = 1
    
    # Check for collisions
    while db.scalar(select(Company).where(Company.slug == slug)):
        slug = f"{base_slug}-{counter}"
        counter += 1
        
    return slug


def register_recruiter(db: Session, user_in: UserCreate) -> User:
    from sqlalchemy.exc import IntegrityError
    
    # 1. Check if user already exists
    if get_user_by_email(db, user_in.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists."
        )
        
    for attempt in range(3):
        try:
            # 2. Create User
            db_user = User(
                email=user_in.email,
                hashed_password=get_password_hash(user_in.password),
                full_name=user_in.full_name,
            )
            db.add(db_user)
            db.flush()  # Get user ID without committing
            
            # 3. Create Company
            db_company = Company(
                name=user_in.company_name,
                slug=generate_company_slug(db, user_in.company_name)
            )
            db.add(db_company)
            db.flush()  # Get company ID without committing
            
            # 4. Create CompanyMember (OWNER)
            db_member = CompanyMember(
                user_id=db_user.id,
                company_id=db_company.id,
                role=MemberRole.OWNER
            )
            db.add(db_member)
            
            # Commit the transaction atomically
            db.commit()
            db.refresh(db_user)
            return db_user
            
        except IntegrityError as e:
            db.rollback()
            # If the error is about the unique slug constraint, retry.
            # Otherwise, it might be a concurrent user email registration or something else.
            if "uq_companies_slug" in str(e) and attempt < 2:
                continue
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Registration collision, please try again."
            )
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Registration failed: {str(e)}"
            )
            
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to register after multiple attempts due to slug collisions."
    )

import jwt
import uuid
from jwt.exceptions import InvalidTokenError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db.session import get_db
from app.config import settings
from app.models.user import User
from app.models.company_member import CompanyMember
from app.schemas.auth import TokenPayload

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id_str: str | None = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
            
        # Safely parse the UUID string to avoid 500 DataError/ValueError
        try:
            user_id = uuid.UUID(user_id_str)
        except ValueError:
            raise credentials_exception
            
        token_data = TokenPayload(sub=str(user_id))
    except InvalidTokenError:
        raise credentials_exception
        
    user = db.scalar(select(User).where(User.id == token_data.sub))
    if user is None:
        raise credentials_exception
        
    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


class RecruiterContext:
    def __init__(self, user: User, member: CompanyMember):
        self.user = user
        self.member = member
        self.company = member.company


def get_current_recruiter(
    user: User = Depends(get_current_active_user),
) -> RecruiterContext:
    """
    Dependency to resolve the active company membership for a recruiter.
    Defaults to the first active membership.
    """
    if not user.memberships:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User does not belong to any company."
        )
        
    # For now, default to the first membership.
    # Future enhancement: support switching companies via an X-Company-ID header.
    member = user.memberships[0]
    return RecruiterContext(user=user, member=member)

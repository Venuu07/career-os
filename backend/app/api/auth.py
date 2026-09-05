# pyrefly: ignore [missing-import]
from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, Response
# pyrefly: ignore [missing-import]
from fastapi.security import OAuth2PasswordRequestForm
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.config import settings
from app.schemas.auth import UserCreate, UserResponse, Token
from app.services import auth as auth_service, security
from app.api.deps import get_current_active_user
from app.models.user import User

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_in: UserCreate,
    db: Session = Depends(get_db)
) -> Any:
    """
    Register a new recruiter.
    This creates the User, their Company, and links them as OWNER.
    """
    user = auth_service.register_recruiter(db, user_in=user_in)
    return user


@router.post("/login", response_model=Token)
def login_access_token(
    response: Response,
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    Also sets an HttpOnly cookie for web clients.
    """
    user = auth_service.authenticate_user(db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(data={"sub": str(user.id)}, expires_delta=access_token_expires)
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=False,  # Should be True in production with HTTPS
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/logout")
def logout(response: Response):
    """
    Clear the authentication cookie.
    """
    response.delete_cookie(key="access_token")
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
def read_users_me(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current user profile, including company memberships.
    """
    return current_user

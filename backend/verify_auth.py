import sys
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.base import Base
from app.db.session import get_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from app.db.session import SessionLocal
from app.models.user import User
from app.models.company import Company
from sqlalchemy import delete

from app.schemas.auth import UserCreate
from app.services import auth, security
from app.api import deps

def clean_test_data(db):
    try:
        # Cascade delete will handle company_members
        db.execute(delete(User).where(User.email == "test@careeros.com"))
        db.execute(delete(Company).where(Company.name == "Test Company Inc."))
        db.commit()
    except Exception as e:
        db.rollback()
        logger.warning(f"Cleanup error: {e}")

def run_tests():
    db = SessionLocal()
    clean_test_data(db)
    try:
        logger.info("1. Testing Registration...")
        user_in = UserCreate(
            email="test@careeros.com",
            password="securepassword123",
            full_name="Test Recruiter",
            company_name="Test Company Inc."
        )
        user = auth.register_recruiter(db, user_in)
        assert user.email == "test@careeros.com"
        assert user.full_name == "Test Recruiter"
        assert len(user.memberships) == 1
        
        membership = user.memberships[0]
        assert membership.role == "owner"
        assert membership.company.name == "Test Company Inc."
        assert membership.company.slug == "test-company-inc"
        logger.info("Registration OK.")
        
        logger.info("2. Testing Duplicate Registration...")
        try:
            auth.register_recruiter(db, user_in)
            assert False, "Should have raised HTTPException"
        except Exception as e:
            assert "User with this email already exists" in str(e)
            logger.info("Duplicate Registration Rejected OK.")
        
        logger.info("3. Testing Login...")
        auth_user = auth.authenticate_user(db, email="test@careeros.com", password="securepassword123")
        assert auth_user is not None
        assert auth_user.email == "test@careeros.com"
        access_token = security.create_access_token(data={"sub": str(auth_user.id)})
        assert access_token is not None
        logger.info("Login OK.")
        
        logger.info("4. Testing Token Parsing (get_current_user)...")
        current_user = deps.get_current_user(db, token=access_token)
        assert current_user is not None
        assert current_user.email == "test@careeros.com"
        logger.info("Token Parsing OK.")
        
        logger.info("5. Testing invalid token...")
        try:
            deps.get_current_user(db, token="invalidtoken123")
            assert False, "Should have raised HTTPException"
        except Exception as e:
            assert "Could not validate credentials" in str(e)
            logger.info("Invalid token rejected OK.")
        
        logger.info("All authentication tests passed successfully.")
    finally:
        db.close()

if __name__ == "__main__":
    try:
        run_tests()
    except AssertionError as e:
        logger.error(f"Test failed: {e}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        sys.exit(1)

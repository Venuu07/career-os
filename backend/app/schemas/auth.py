from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from app.models.company_member import MemberRole


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenPayload(BaseModel):
    sub: str | None = None


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str | None = None
    company_name: str = Field(..., description="The name of the company to create.")


class CompanyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    name: str
    slug: str


class CompanyMemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    company_id: UUID
    role: MemberRole
    company: CompanyResponse


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    email: EmailStr
    full_name: str | None
    is_active: bool
    memberships: list[CompanyMemberResponse] = []

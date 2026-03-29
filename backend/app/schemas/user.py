from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=64)


class UserOut(BaseModel):
    id: int
    email: str
    is_email_verified: bool = False

    class Config:
        orm_mode = True


class AuthSessionData(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


class LogoutResponseData(BaseModel):
    message: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=64)


class VerifyEmailRequest(BaseModel):
    token: str


class MessageResponseData(BaseModel):
    message: str
    
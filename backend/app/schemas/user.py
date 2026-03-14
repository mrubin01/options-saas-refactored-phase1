from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=64)

class UserRead(BaseModel):
    id: int
    email: EmailStr

    class Config:
        orm_mode = True

class UserOut(BaseModel):
    id: int
    email: str

    class Config:
        orm_mode = True

class LoginResponseData(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

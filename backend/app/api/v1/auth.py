from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.auth.security import hash_password, verify_password
from app.auth.jwt import create_access_token
from app.schemas.user import UserCreate
from fastapi.security import OAuth2PasswordRequestForm
from app.auth.deps import get_current_user
from app.core.middleware.logging import get_logger
from app.schemas.user import UserOut, LoginResponseData
from app.schemas.api import ApiResponse, ApiError
from typing import List
from app.core.exceptions import AppException
from app.core.response import ok
from app.core.security.rate_limit import auth_limiter
from app.core.security.rate_policies import LOGIN_LIMIT, REGISTER_LIMIT, ME_LIMIT
from app.core.security.request_info import get_client_ip
from app.core.error_codes import ErrorCode

logger = get_logger(__name__)
router = APIRouter(tags=["auth"])

@router.post("/register", response_model=ApiResponse[UserOut])
@auth_limiter.limit(REGISTER_LIMIT)
async def register(request: Request, user_in: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_in.email).first():
        raise AppException(
            code=ErrorCode.EMAIL_EXISTS,
            message="Email already registered",
            status_code=400
        )

    user = User(
        email=user_in.email,
        password_hash=hash_password(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    logger.info("New user registered", extra={"email": user.email})

    return ok(
        request=request,
        data=UserOut.from_orm(user),
    )


@router.post("/login", response_model=ApiResponse[LoginResponseData])
@auth_limiter.limit(LOGIN_LIMIT)
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    ip = get_client_ip(request)

    logger.info(
        "AUTH_LOGIN_ATTEMPT",
        extra={"email": form_data.username, "ip": ip},
    )

    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.password_hash):
        logger.warning(
            "AUTH_LOGIN_FAILED",
            extra={"email": form_data.username, "ip": ip},
        )
        raise AppException(
            code=ErrorCode.INVALID_CREDENTIALS,
            message="Invalid email or password",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    token = create_access_token({"sub": str(user.id)})

    logger.info(
        "AUTH_LOGIN_SUCCESS",
        extra={"user_id": user.id, "ip": ip},
    )

    return ok(
        data=LoginResponseData(
            access_token=token,
            token_type="bearer",
            user=UserOut.from_orm(user),
        ),
        request=request,
    )


@router.get("/me", response_model=ApiResponse[UserOut])
@auth_limiter.limit(ME_LIMIT)
async def me(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    return ok(
        request=request,
        data=UserOut.from_orm(current_user),
    )




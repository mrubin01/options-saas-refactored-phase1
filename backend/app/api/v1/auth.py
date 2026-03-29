from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Request, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import ExpiredSignatureError, JWTError
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user
from app.auth.jwt import create_access_token, decode_token, get_token_subject, get_token_type
from app.auth.security import hash_password, verify_password
from app.core.config import settings
from app.core.error_codes import ErrorCode
from app.core.exceptions import AppException
from app.core.middleware.logging import get_logger
from app.core.response import ok
from app.core.security.rate_limit import auth_limiter
from app.core.security.rate_policies import LOGIN_LIMIT, ME_LIMIT, REGISTER_LIMIT
from app.core.security.request_info import get_client_ip
from app.db.database import get_db
from app.models.user import User
from app.schemas.api import ApiResponse
from app.schemas.user import AuthSessionData, LogoutResponseData, UserCreate, UserOut
from app.services.auth_sessions import (
    create_refresh_session,
    get_refresh_session_by_token,
    is_refresh_session_active,
    revoke_refresh_session,
    rotate_refresh_session,
)
from app.services.auth_tokens import create_one_time_token, consume_one_time_token
from app.schemas.user import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
    VerifyEmailRequest,
    MessageResponseData,
)

logger = get_logger(__name__)
router = APIRouter(tags=["auth"])


def build_frontend_url(path: str) -> str:
    base = getattr(settings, "FRONTEND_URL", "http://localhost:5173").rstrip("/")
    return f"{base}{path}"


def log_email_link(purpose: str, email: str, link: str) -> None:
    logger.info(
        "AUTH_EMAIL_LINK",
        extra={
            "purpose": purpose,
            "email": email,
            "link": link,
        },
    )


def set_refresh_cookie(response: Response, refresh_token: str) -> None:
    max_age = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60

    response.set_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        value=refresh_token,
        httponly=True,
        secure=settings.REFRESH_COOKIE_SECURE,
        samesite=settings.REFRESH_COOKIE_SAMESITE,
        domain=settings.REFRESH_COOKIE_DOMAIN,
        path=settings.REFRESH_COOKIE_PATH,
        max_age=max_age,
    )


def clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        domain=settings.REFRESH_COOKIE_DOMAIN,
        path=settings.REFRESH_COOKIE_PATH,
    )


@router.post("/register", response_model=ApiResponse[UserOut])
@auth_limiter.limit(REGISTER_LIMIT)
async def register(request: Request, user_in: UserCreate, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == user_in.email).first()

    if existing_user:
        raise AppException(
            code=ErrorCode.EMAIL_EXISTS,
            message="Email already registered",
            status_code=400,
        )

    user = User(
        email=user_in.email,
        password_hash=hash_password(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    verification_token = create_one_time_token(
        db,
        user=user,
        token_type="verify_email",
        expires_in_minutes=24 * 60,
    )
    verification_link = build_frontend_url(f"/verify-email?token={verification_token}")
    log_email_link("verify_email", user.email, verification_link)

    logger.info("New user registered", extra={"email": user.email})

    return ok(
        request=request,
        data=UserOut.from_orm(user),
    )


@router.post("/login", response_model=ApiResponse[AuthSessionData])
@auth_limiter.limit(LOGIN_LIMIT)
async def login(
    request: Request,
    response: Response,
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

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token, _session = create_refresh_session(db, user)

    set_refresh_cookie(response, refresh_token)

    logger.info(
        "AUTH_LOGIN_SUCCESS",
        extra={"user_id": user.id, "ip": ip},
    )

    return ok(
        data=AuthSessionData(
            access_token=access_token,
            token_type="bearer",
            user=UserOut.from_orm(user),
        ),
        request=request,
    )


@router.post("/refresh", response_model=ApiResponse[AuthSessionData])
async def refresh(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    refresh_token = request.cookies.get(settings.REFRESH_COOKIE_NAME)

    if not refresh_token:
        raise AppException(
            code=ErrorCode.INVALID_REFRESH_TOKEN,
            message="Missing refresh token",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    try:
        payload = decode_token(refresh_token)
    except ExpiredSignatureError:
        raise AppException(
            code=ErrorCode.REFRESH_TOKEN_EXPIRED,
            message="Refresh token expired",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )
    except JWTError:
        raise AppException(
            code=ErrorCode.INVALID_REFRESH_TOKEN,
            message="Invalid refresh token",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    token_type = get_token_type(payload)
    if token_type != "refresh":
        raise AppException(
            code=ErrorCode.INVALID_REFRESH_TOKEN,
            message="Invalid refresh token type",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    user_id = get_token_subject(payload)
    if user_id is None:
        raise AppException(
            code=ErrorCode.INVALID_REFRESH_TOKEN,
            message="Invalid refresh token payload",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    session = get_refresh_session_by_token(db, refresh_token)
    if not session:
        raise AppException(
            code=ErrorCode.SESSION_NOT_FOUND,
            message="Session not found",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    if not is_refresh_session_active(session):
        if session.revoked_at is not None:
            raise AppException(
                code=ErrorCode.REFRESH_TOKEN_REVOKED,
                message="Refresh token revoked",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        raise AppException(
            code=ErrorCode.REFRESH_TOKEN_EXPIRED,
            message="Refresh token expired",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    user = db.get(User, int(user_id))
    if not user:
        raise AppException(
            code=ErrorCode.USER_NOT_FOUND,
            message="User not found",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    session.last_used_at = datetime.now(timezone.utc)
    db.add(session)
    db.commit()

    new_refresh_token, _new_session = rotate_refresh_session(db, session, user)
    new_access_token = create_access_token({"sub": str(user.id)})

    set_refresh_cookie(response, new_refresh_token)

    return ok(
        request=request,
        data=AuthSessionData(
            access_token=new_access_token,
            token_type="bearer",
            user=UserOut.from_orm(user),
        ),
    )


@router.post("/logout", response_model=ApiResponse[LogoutResponseData])
async def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    refresh_token = request.cookies.get(settings.REFRESH_COOKIE_NAME)

    if refresh_token:
        session = get_refresh_session_by_token(db, refresh_token)
        if session and session.revoked_at is None:
            revoke_refresh_session(session, db)

    clear_refresh_cookie(response)

    return ok(
        request=request,
        data=LogoutResponseData(message="Logged out successfully"),
    )


@router.get("/me", response_model=ApiResponse[UserOut])
@auth_limiter.limit(ME_LIMIT)
async def me(
    request: Request,
    current_user: User = Depends(get_current_user),
):
    return ok(
        request=request,
        data=UserOut.from_orm(current_user),
    )


@router.post("/forgot-password", response_model=ApiResponse[MessageResponseData])
async def forgot_password(
    request: Request,
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == payload.email).first()

    if user:
        token = create_one_time_token(
            db,
            user=user,
            token_type="reset_password",
            expires_in_minutes=60,
        )
        reset_link = build_frontend_url(f"/reset-password?token={token}")
        log_email_link("reset_password", user.email, reset_link)

    return ok(
        request=request,
        data=MessageResponseData(
            message="If an account exists for that email, a reset link has been generated."
        ),
    )


@router.post("/reset-password", response_model=ApiResponse[MessageResponseData])
async def reset_password(
    request: Request,
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    token_record = consume_one_time_token(
        db,
        raw_token=payload.token,
        token_type="reset_password",
    )

    if not token_record:
        raise AppException(
            code=ErrorCode.INVALID_RESET_TOKEN,
            message="Invalid or expired reset token",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    user = db.get(User, token_record.user_id)
    if not user:
        raise AppException(
            code=ErrorCode.USER_NOT_FOUND,
            message="User not found",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    user.password_hash = hash_password(payload.new_password)
    db.add(user)
    db.commit()

    return ok(
        request=request,
        data=MessageResponseData(message="Password reset successfully"),
    )


@router.post("/verify-email", response_model=ApiResponse[MessageResponseData])
async def verify_email(
    request: Request,
    payload: VerifyEmailRequest,
    db: Session = Depends(get_db),
):
    token_record = consume_one_time_token(
        db,
        raw_token=payload.token,
        token_type="verify_email",
    )

    if not token_record:
        raise AppException(
            code=ErrorCode.INVALID_VERIFICATION_TOKEN,
            message="Invalid or expired verification token",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    user = db.get(User, token_record.user_id)
    if not user:
        raise AppException(
            code=ErrorCode.USER_NOT_FOUND,
            message="User not found",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    user.is_email_verified = True
    user.email_verified_at = datetime.now(timezone.utc)
    db.add(user)
    db.commit()

    return ok(
        request=request,
        data=MessageResponseData(message="Email verified successfully"),
    )


@router.post("/resend-verification", response_model=ApiResponse[MessageResponseData])
async def resend_verification(
    request: Request,
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == payload.email).first()

    if user and not user.is_email_verified:
        token = create_one_time_token(
            db,
            user=user,
            token_type="verify_email",
            expires_in_minutes=24 * 60,
        )
        verification_link = build_frontend_url(f"/verify-email?token={token}")
        log_email_link("verify_email_resend", user.email, verification_link)

    return ok(
        request=request,
        data=MessageResponseData(
            message="If the account exists and is not yet verified, a verification link has been generated."
        ),
    )


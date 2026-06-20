from typing import Optional

from fastapi import Depends, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import ExpiredSignatureError, JWTError
from sqlalchemy.orm import Session

from app.auth.jwt import decode_token, get_token_subject, get_token_type
from app.core.error_codes import ErrorCode
from app.core.exceptions import AppException
from app.db.database import get_db
from app.models.user import User

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    request: Request,
    token: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Optional[User]:
    if request.method == "OPTIONS":
        return None

    if token is None:
        raise AppException(
            code=ErrorCode.UNAUTHORIZED,
            message="Not authenticated",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    try:
        payload = decode_token(token.credentials)

        if get_token_type(payload) != "access":
            raise AppException(
                code=ErrorCode.UNAUTHORIZED,
                message="Invalid token",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        user_id = get_token_subject(payload)
        if user_id is None:
            raise AppException(
                code=ErrorCode.UNAUTHORIZED,
                message="Invalid token",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

    except ExpiredSignatureError:
        raise AppException(
            code=ErrorCode.UNAUTHORIZED,
            message="Token expired",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )
    except JWTError:
        raise AppException(
            code=ErrorCode.UNAUTHORIZED,
            message="Invalid token",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    user = db.get(User, int(user_id))
    if not user:
        raise AppException(
            code=ErrorCode.UNAUTHORIZED,
            message="Invalid token",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    return user

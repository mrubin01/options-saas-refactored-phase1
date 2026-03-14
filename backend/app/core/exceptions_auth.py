from app.core.exceptions import AppException
from app.core.error_codes import ErrorCode


class InvalidCredentials(AppException):
    def __init__(self):
        super().__init__(
            code=ErrorCode.INVALID_CREDENTIALS,
            status_code=401,
            message="Invalid email or password",
        )

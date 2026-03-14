from enum import StrEnum


class ErrorCode(StrEnum):
    # --- auth ---
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS"
    UNAUTHORIZED = "UNAUTHORIZED"
    TOKEN_EXPIRED = "TOKEN_EXPIRED"
    EMAIL_EXISTS = "EMAIL_EXISTS"

    # --- permissions ---
    FORBIDDEN = "FORBIDDEN"

    # --- resources ---
    NOT_FOUND = "NOT_FOUND"

    # --- validation ---
    VALIDATION_ERROR = "VALIDATION_ERROR"

    # --- rate limit ---
    RATE_LIMITED = "RATE_LIMITED"

    # --- server ---
    INTERNAL_ERROR = "INTERNAL_ERROR"

    # --- users ---
    USER_NOT_FOUND = "USER_NOT_FOUND"
    USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS"

from app.core.config import settings


from app.core.config import settings


def validate_security_settings() -> None:
    if settings.ENVIRONMENT == "production":
        if not settings.FRONTEND_URL.startswith("https://"):
            raise RuntimeError("FRONTEND_URL must use https in production")

        if settings.REFRESH_COOKIE_SECURE is not True:
            raise RuntimeError("REFRESH_COOKIE_SECURE must be true in production")


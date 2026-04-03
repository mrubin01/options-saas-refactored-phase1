from app.core.config import settings


def validate_security_settings() -> None:
    if settings.ENVIRONMENT in {"staging", "production"}:
        if settings.FRONTEND_URL.startswith("http://"):
            raise RuntimeError("FRONTEND_URL must use https in staging/production")

        if not settings.cors_origins_list:
            raise RuntimeError("CORS_ORIGINS must not be empty in staging/production")

        if "*" in settings.cors_origins_list:
            raise RuntimeError("Wildcard CORS origins are not allowed in staging/production")

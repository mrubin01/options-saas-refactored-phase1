from typing import Literal
from pydantic import BaseSettings, validator


class Settings(BaseSettings):
    ENVIRONMENT: Literal["local", "development", "docker", "staging", "production"] = "local"

    # --- security ---
    SECRET_KEY: str = "change-me-in-env"
    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 14

    REFRESH_COOKIE_NAME: str = "refresh_token"
    REFRESH_COOKIE_SECURE: bool = False
    REFRESH_COOKIE_SAMESITE: Literal["lax", "strict", "none"] = "lax"
    REFRESH_COOKIE_DOMAIN: str | None = None
    REFRESH_COOKIE_PATH: str = "/v1/auth"

    FRONTEND_URL: str = "http://localhost:4173"

    # --- database ---
    DATABASE_URL_ADMIN: str = "postgresql+psycopg://options_user:change_me_db_password@localhost:5432/options_saas"
    DATABASE_URL_APP: str = "postgresql+psycopg://options_user:change_me_db_password@localhost:5432/options_saas"

    # --- cors ---
    CORS_ORIGINS: str = (
        "http://localhost:5173,"
        "http://localhost:4173,"
        "http://127.0.0.1:5173,"
        "http://127.0.0.1:4173"
    )

    # --- sentry ---
    SENTRY_DSN: str | None = None
    SENTRY_TRACES_SAMPLE_RATE: float = 0.0

    # --- redis ---
    REDIS_URL: str = "redis://localhost:6379/0"

    # --- one-time token expiry ---
    RESET_PASSWORD_TOKEN_EXPIRE_MINUTES: int = 60
    VERIFY_EMAIL_TOKEN_EXPIRE_MINUTES: int = 24 * 60

    # --- runtime ---
    BACKEND_PORT: int = 8000
    RUN_MIGRATIONS: bool = True

    class Config:  # type: ignore
        env_file = ".env"
        case_sensitive = True

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @validator("SECRET_KEY")
    def validate_secret_key(cls, value: str, values: dict) -> str:
        env = values.get("ENVIRONMENT", "local")
        if env in {"staging", "production"}:
            if value == "change-me-in-env" or len(value) < 32:
                raise ValueError("SECRET_KEY must be set to a strong value outside local development")
        return value

    @validator("REFRESH_COOKIE_SECURE")
    def validate_secure_cookie_for_non_local(cls, value: bool, values: dict) -> bool:
        env = values.get("ENVIRONMENT", "local")
        if env == "production" and value is not True:
            raise ValueError("REFRESH_COOKIE_SECURE must be true in production")
        return value

    @validator("REFRESH_COOKIE_SAMESITE")
    def validate_samesite_secure_combo(cls, value: str, values: dict) -> str:
        secure = values.get("REFRESH_COOKIE_SECURE", False)
        if value == "none" and not secure:
            raise ValueError('REFRESH_COOKIE_SAMESITE="none" requires REFRESH_COOKIE_SECURE=true')
        return value

    @validator("ALGORITHM")
    def validate_algorithm(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("ALGORITHM must not be empty")
        return value.strip()


settings = Settings()

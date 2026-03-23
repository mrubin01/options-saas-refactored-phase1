from pydantic import BaseSettings


class Settings(BaseSettings):
    ENVIRONMENT: str = "local"

    # --- security ---
    SECRET_KEY: str = "9f7b28c1937bd96b06e69077040854d42959ae7fbc785dd69a6b2dc004bcb30d"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # --- database ---
    # Admin (migrations, seeding)  
    DATABASE_URL_ADMIN: str = "postgresql+psycopg://options_admin:strongpsw123@localhost:5432/options_saas"
    # App runtime (read-only)
    DATABASE_URL_APP: str = "postgresql+psycopg://options_app:app_psw_987@localhost:5432/options_saas"
    
    # --- cors ---
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:4173,http://127.0.0.1:5173,http://127.0.0.1:4173"

    # --- sentry (optional) ---
    SENTRY_DSN: str | None = None
    SENTRY_TRACES_SAMPLE_RATE: float = 0.0

    # --- redis ---
    REDIS_URL: str = "redis://localhost:6379/0"

    # --- refresh token ---
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 14
    REFRESH_COOKIE_NAME: str = "refresh_token"
    REFRESH_COOKIE_SECURE: bool = False  # for local, True in prod
    REFRESH_COOKIE_SAMESITE: str = "lax"
    REFRESH_COOKIE_DOMAIN: str | None = None
    REFRESH_COOKIE_PATH: str = "/v1/auth"
    FRONTEND_URL: str = "http://localhost:5173"

    

    class Config:  # type: ignore
        env_file = ".env"
        case_sensitive = True


settings = Settings()


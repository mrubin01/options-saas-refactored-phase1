import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from app.core.config import settings

def init_sentry() -> None:
    # dsn = os.getenv("SENTRY_DSN")
    dsn=settings.SENTRY_DSN # not in the config file at the moment, but we can add it later
    if not dsn:
        return  # Sentry disabled

    sentry_sdk.init(
        dsn=dsn,
        integrations=[
            FastApiIntegration(),
            SqlalchemyIntegration(),
        ],
        #traces_sample_rate=float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0.1")),
        traces_sample_rate=settings.SENTRY_TRACES_SAMPLE_RATE, # not in the config file at the moment
        environment=settings.ENVIRONMENT,
    )


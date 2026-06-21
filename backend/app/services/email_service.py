import resend

from app.core.config import settings
from app.core.middleware.logging import get_logger

logger = get_logger(__name__)


def _send(*, to: str, subject: str, html: str) -> None:
    if not settings.RESEND_API_KEY:
        logger.warning(
            "RESEND_API_KEY not set — email not sent",
            extra={"to": to, "subject": subject},
        )
        return

    resend.api_key = settings.RESEND_API_KEY
    resend.Emails.send({
        "from": settings.EMAIL_FROM,
        "to": to,
        "subject": subject,
        "html": html,
    })


def send_verification_email(to_email: str, link: str) -> None:
    _send(
        to=to_email,
        subject="Verify your OptionStacker email",
        html=f"""
        <p>Welcome to OptionStacker!</p>
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="{link}">Verify email</a></p>
        <p>This link expires in 24 hours.</p>
        <p>If you did not create an account, you can ignore this email.</p>
        """,
    )


def send_password_reset_email(to_email: str, link: str) -> None:
    _send(
        to=to_email,
        subject="Reset your OptionStacker password",
        html=f"""
        <p>You requested a password reset for your OptionStacker account.</p>
        <p><a href="{link}">Reset password</a></p>
        <p>This link expires in 1 hour.</p>
        <p>If you did not request this, you can ignore this email.</p>
        """,
    )

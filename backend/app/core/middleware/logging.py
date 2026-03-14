import logging
import sys
from pythonjsonlogger.json import JsonFormatter
from contextvars import ContextVar

logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

request_id_ctx: ContextVar[str | None] = ContextVar("request_id", default=None)

class RequestIdFilter(logging.Filter):
    def filter(self, record):
        record.request_id = request_id_ctx.get()
        return True
    
def setup_logging(level=logging.INFO):
    handler = logging.StreamHandler(sys.stdout)

    formatter = JsonFormatter(
        "%(asctime)s %(levelname)s %(name)s %(message)s %(request_id)s"
    )

    # from database.py
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

    handler.setFormatter(formatter)
    handler.addFilter(RequestIdFilter())

    root = logging.getLogger()
    root.setLevel(level)
    root.handlers.clear()
    root.addHandler(handler)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)


from fastapi.exceptions import RequestValidationError

def format_validation_errors(exc: RequestValidationError):
    return [
        {
            "field": ".".join(str(loc) for loc in err["loc"]),
            "message": err["msg"],
            "type": err["type"],
        }
        for err in exc.errors()
    ]

from fastapi import Request


def get_client_ip(request: Request) -> str | None:
    """
    Safely extract client IP.
    Handles:
    - proxies
    - tests (no client)
    - local dev
    """

    # real world: behind nginx / cloudflare
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()

    if request.client:
        return request.client.host

    return None

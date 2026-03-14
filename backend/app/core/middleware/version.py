from fastapi import Request

async def version_middleware(request: Request, call_next):
    response = await call_next(request)
    request.state.api_version = request.url.path.split("/")[1]  # v1, v2
    return response

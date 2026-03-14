from slowapi import Limiter
from slowapi.util import get_remote_address

# generic limiter (already used)
api_limiter = Limiter(key_func=get_remote_address)

# strict auth limiter
auth_limiter = Limiter(key_func=get_remote_address)

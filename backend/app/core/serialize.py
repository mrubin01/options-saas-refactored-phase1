from typing import Any
from fastapi.encoders import jsonable_encoder

def serialize_model(obj: Any):
    """
    Convert Pydantic models / datetimes / UUIDs / Decimals / Enums / ORM objects
    into JSON-serializable primitives for JSONResponse.
    """
    return jsonable_encoder(obj)

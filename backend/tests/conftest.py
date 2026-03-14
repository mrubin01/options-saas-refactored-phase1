import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Add backend/ to PYTHONPATH so "import app" works
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from app.main import app


@pytest.fixture(scope="session")
def client():
    return TestClient(app)


@pytest.fixture(scope="session")
def auth_headers(client):
    """
    Returns Authorization headers for tests.
    Adjust this to hit your real login endpoint if needed.
    """

    # Option A: if auth is disabled in dev/test
    return {}

    # Option B: real login flow (recommended later)
    # resp = client.post(
    #     "/v1/auth/login",
    #     json={"email": "test@example.com", "password": "testpassword"},
    # )
    # token = resp.json()["data"]["access_token"]
    # return {"Authorization": f"Bearer {token}"}

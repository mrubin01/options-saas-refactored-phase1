import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from app.main import app


TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "testpassword123"


@pytest.fixture(scope="session")
def client():
    return TestClient(app)


@pytest.fixture(scope="session")
def auth_headers(client: TestClient):
    register_response = client.post(
        "/v1/auth/register",
        json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
        },
    )

    if register_response.status_code not in (200, 400):
        raise AssertionError(
            f"Unexpected register status: {register_response.status_code} {register_response.text}"
        )

    login_response = client.post(
        "/v1/auth/login",
        data={
            "username": TEST_EMAIL,
            "password": TEST_PASSWORD,
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    assert login_response.status_code == 200, login_response.text

    payload = login_response.json()
    assert payload["success"] is True
    assert payload["data"] is not None
    assert "access_token" in payload["data"]

    token = payload["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}

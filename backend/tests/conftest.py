import sys
from pathlib import Path
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from app.main import app


TEST_PASSWORD = "testpassword123!"


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(scope="session")
def auth_headers(client: TestClient):
    test_email = f"test-{uuid4().hex[:12]}@example.com"

    register_response = client.post(
        "/v1/auth/register",
        json={
            "email": test_email,
            "password": TEST_PASSWORD,
        },
    )

    assert register_response.status_code == 200, register_response.text

    login_response = client.post(
        "/v1/auth/login",
        data={
            "username": test_email,
            "password": TEST_PASSWORD,
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    assert login_response.status_code == 200, login_response.text

    payload = login_response.json()
    assert payload["success"] is True, payload
    assert payload["data"] is not None, payload
    assert "access_token" in payload["data"], payload

    token = payload["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}

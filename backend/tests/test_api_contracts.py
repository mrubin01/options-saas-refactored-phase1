import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


# ---- CONFIG ----
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "testpassword"


# ---- HELPERS ----

def assert_api_response_shape(resp_json):
    assert isinstance(resp_json, dict)

    # Must always have these 3 keys
    assert "success" in resp_json
    assert "data" in resp_json
    assert "error" in resp_json

    assert isinstance(resp_json["success"], bool)

    # Exactly one of data / error must be non-null
    if resp_json["success"]:
        assert resp_json["error"] is None
    else:
        assert resp_json["data"] is None
        assert isinstance(resp_json["error"], dict)
        assert "code" in resp_json["error"]
        assert "message" in resp_json["error"]


# ---- FIXTURES ----

@pytest.fixture(scope="session")
def auth_token():
    """
    Logs in once and returns a valid JWT token
    """

    res = client.post(
        "/v1/auth/login",
        data={
            "username": TEST_EMAIL,
            "password": TEST_PASSWORD,
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    assert res.status_code == 200

    payload = res.json()

    assert payload["success"] is True
    assert payload["data"] is not None
    assert "access_token" in payload["data"]

    return payload["data"]["access_token"]

@pytest.fixture
def auth_headers(auth_token):
    return {
        "Authorization": f"Bearer {auth_token}"
    }


# ---- CONTRACT TESTS ----

def test_auth_me_contract(auth_headers):
    res = client.get("/v1/auth/me", headers=auth_headers)
    assert res.status_code == 200

    data = res.json()
    assert_api_response_shape(data)

    # Extra sanity check
    assert data["success"] is True
    assert "id" in data["data"]
    assert "email" in data["data"]


def test_covered_calls_contract(auth_headers):
    res = client.get("/v1/covered-calls", headers=auth_headers)
    assert res.status_code == 200

    data = res.json()
    assert_api_response_shape(data)

    if data["success"]:
        payload = data["data"]
        assert "items" in payload
        assert "limit" in payload
        assert "offset" in payload

        if payload["items"]:
            row = payload["items"][0]
            assert "contract" in row
            assert "ticker" in row
            assert "exchange" in row
            assert "expiry_date" in row
            assert "current_price" in row
            assert "strike_price" in row


def test_put_options_contract(auth_headers):
    res = client.get("/v1/put-options", headers=auth_headers)
    assert res.status_code == 200

    data = res.json()
    assert_api_response_shape(data)

    if data["success"]:
        payload = data["data"]
        assert "items" in payload
        assert "limit" in payload
        assert "offset" in payload


def test_spread_options_contract(auth_headers):
    res = client.get("/v1/spread-options", headers=auth_headers)
    assert res.status_code == 200

    data = res.json()
    assert_api_response_shape(data)

    if data["success"]:
        payload = data["data"]
        assert "items" in payload
        assert "limit" in payload
        assert "offset" in payload


def test_unauthorized_contract():
    """
    Verify unauthorized responses are ALSO wrapped correctly
    """
    res = client.get("/v1/covered-calls")
    assert res.status_code == 401

    data = res.json()
    assert_api_response_shape(data)

    assert data["success"] is False
    assert data["error"]["code"] is not None

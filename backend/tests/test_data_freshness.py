from types import SimpleNamespace

from fastapi.testclient import TestClient

from app.auth.deps import get_current_user
from app.db.database import get_db
from app.main import app
from app.services import data_freshness as data_freshness_service

from typing import cast
from sqlalchemy.orm import Session


def test_get_data_freshness_returns_all_strategy_keys(monkeypatch):
    calls: list[str] = []

    def fake_get_table_freshness(db, model):
        calls.append(model.__name__)
        return {
            "last_updated": None,
            "row_count": 0,
        }

    monkeypatch.setattr(
        data_freshness_service,
        "_get_table_freshness",
        fake_get_table_freshness,
    )

    result = data_freshness_service.get_data_freshness(db=cast(Session, object()))

    assert result == {
        "covered_calls": {
            "last_updated": None,
            "row_count": 0,
        },
        "put_options": {
            "last_updated": None,
            "row_count": 0,
        },
        "spread_options": {
            "last_updated": None,
            "row_count": 0,
        },
    }

    assert set(calls) == {
        "CoveredCall",
        "PutOption",
        "SpreadOption",
    }


def test_data_freshness_endpoint_returns_wrapped_response(monkeypatch):
    from app.api.v1 import data_freshness as data_freshness_api

    fake_data = {
        "covered_calls": {
            "last_updated": "2026-06-14T10:30:00Z",
            "row_count": 10,
        },
        "put_options": {
            "last_updated": "2026-06-14T10:31:00Z",
            "row_count": 20,
        },
        "spread_options": {
            "last_updated": "2026-06-14T10:32:00Z",
            "row_count": 30,
        },
    }

    def fake_get_data_freshness(db):
        return fake_data

    def override_get_db():
        yield object()

    def override_get_current_user():
        return SimpleNamespace(id=1, email="test@example.com")

    monkeypatch.setattr(
        data_freshness_api,
        "get_data_freshness",
        fake_get_data_freshness,
    )

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user

    try:
        client = TestClient(app)
        response = client.get("/v1/data-freshness")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200

    body = response.json()

    assert body["success"] is True
    assert body["data"] == fake_data

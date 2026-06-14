from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

from fastapi.testclient import TestClient

from app.auth.deps import get_current_user
from app.db.database import get_db
from app.main import app
from app.services import ingestion_status as ingestion_status_service
from typing import cast
from sqlalchemy.orm import Session


def make_freshness(last_updated, row_count):
    return {
        "last_updated": last_updated,
        "row_count": row_count,
    }


def test_get_ingestion_status_returns_fresh_when_all_tables_are_recent(monkeypatch):
    now = datetime.now(timezone.utc)

    fake_freshness = {
        "covered_calls": make_freshness(now - timedelta(minutes=30), 10),
        "put_options": make_freshness(now - timedelta(minutes=45), 20),
        "spread_options": make_freshness(now - timedelta(minutes=60), 30),
    }

    monkeypatch.setattr(
        ingestion_status_service,
        "get_data_freshness",
        lambda db: fake_freshness,
    )

    result = ingestion_status_service.get_ingestion_status(db=cast(Session, object()))

    assert result["overall_status"] == "fresh"
    assert result["strategies"]["covered_calls"]["status"] == "fresh"
    assert result["strategies"]["put_options"]["status"] == "fresh"
    assert result["strategies"]["spread_options"]["status"] == "fresh"
    assert result["thresholds"] == {
        "fresh_minutes": 180,
        "aging_minutes": 1440,
    }


def test_get_ingestion_status_returns_aging_when_any_table_is_aging(monkeypatch):
    now = datetime.now(timezone.utc)

    fake_freshness = {
        "covered_calls": make_freshness(now - timedelta(minutes=30), 10),
        "put_options": make_freshness(now - timedelta(hours=8), 20),
        "spread_options": make_freshness(now - timedelta(minutes=60), 30),
    }

    monkeypatch.setattr(
        ingestion_status_service,
        "get_data_freshness",
        lambda db: fake_freshness,
    )

    result = ingestion_status_service.get_ingestion_status(db=cast(Session, object()))

    assert result["overall_status"] == "aging"
    assert result["strategies"]["put_options"]["status"] == "aging"


def test_get_ingestion_status_returns_stale_when_any_table_is_stale(monkeypatch):
    now = datetime.now(timezone.utc)

    fake_freshness = {
        "covered_calls": make_freshness(now - timedelta(minutes=30), 10),
        "put_options": make_freshness(now - timedelta(hours=8), 20),
        "spread_options": make_freshness(now - timedelta(days=2), 30),
    }

    monkeypatch.setattr(
        ingestion_status_service,
        "get_data_freshness",
        lambda db: fake_freshness,
    )

    result = ingestion_status_service.get_ingestion_status(db=cast(Session, object()))

    assert result["overall_status"] == "stale"
    assert result["strategies"]["spread_options"]["status"] == "stale"


def test_get_ingestion_status_returns_empty_when_any_table_has_no_rows(monkeypatch):
    now = datetime.now(timezone.utc)

    fake_freshness = {
        "covered_calls": make_freshness(now - timedelta(minutes=30), 10),
        "put_options": make_freshness(now - timedelta(minutes=30), 0),
        "spread_options": make_freshness(now - timedelta(minutes=30), 30),
    }

    monkeypatch.setattr(
        ingestion_status_service,
        "get_data_freshness",
        lambda db: fake_freshness,
    )

    result = ingestion_status_service.get_ingestion_status(db=cast(Session, object()))

    assert result["overall_status"] == "empty"
    assert result["strategies"]["put_options"]["status"] == "empty"


def test_ingestion_status_endpoint_returns_wrapped_response(monkeypatch):
    from app.api.v1 import ingestion_status as ingestion_status_api

    fake_data = {
        "overall_status": "fresh",
        "thresholds": {
            "fresh_minutes": 180,
            "aging_minutes": 1440,
        },
        "strategies": {
            "covered_calls": {
                "status": "fresh",
                "last_updated": "2026-06-14T10:30:00Z",
                "age_minutes": 30,
                "row_count": 10,
            },
            "put_options": {
                "status": "fresh",
                "last_updated": "2026-06-14T10:30:00Z",
                "age_minutes": 30,
                "row_count": 20,
            },
            "spread_options": {
                "status": "fresh",
                "last_updated": "2026-06-14T10:30:00Z",
                "age_minutes": 30,
                "row_count": 30,
            },
        },
    }

    def fake_get_ingestion_status(db):
        return fake_data

    def override_get_db():
        yield object()

    def override_get_current_user():
        return SimpleNamespace(id=1, email="test@example.com")

    monkeypatch.setattr(
        ingestion_status_api,
        "get_ingestion_status",
        fake_get_ingestion_status,
    )

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user

    try:
        client = TestClient(app)
        response = client.get("/v1/ingestion-status")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200

    body = response.json()

    assert body["success"] is True
    assert body["data"] == fake_data
    
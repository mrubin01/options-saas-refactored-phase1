def test_create_and_list_watchlist_items(client, auth_headers):
    create_res = client.post(
        "/v1/watchlist",
        headers=auth_headers,
        json={
            "strategy_type": "covered_calls",
            "contract": "TEST260619C00100001",
            "ticker": "TEST",
            "exchange": 1,
        },
    )
    assert create_res.status_code == 201, create_res.text
    created = create_res.json()
    assert created["success"] is True
    assert created["data"]["contract"] == "TEST260619C00100001"

    list_res = client.get("/v1/watchlist", headers=auth_headers)
    assert list_res.status_code == 200, list_res.text
    payload = list_res.json()
    assert payload["success"] is True
    assert isinstance(payload["data"], list)
    assert len(payload["data"]) >= 1


def test_prevent_duplicate_watchlist_items(client, auth_headers):
    body = {
        "strategy_type": "covered_calls",
        "contract": "TEST260619C00100002",
        "ticker": "TEST",
        "exchange": 1,
    }

    first = client.post("/v1/watchlist", headers=auth_headers, json=body)
    assert first.status_code == 201, first.text

    second = client.post("/v1/watchlist", headers=auth_headers, json=body)
    assert second.status_code == 409, second.text


def test_delete_watchlist_item(client, auth_headers):
    create_res = client.post(
        "/v1/watchlist",
        headers=auth_headers,
        json={
            "strategy_type": "covered_calls",
            "contract": "TEST260619C00100003",
            "ticker": "TEST",
            "exchange": 1,
        },
    )
    assert create_res.status_code == 201, create_res.text
    item_id = create_res.json()["data"]["id"]

    delete_res = client.delete(f"/v1/watchlist/{item_id}", headers=auth_headers)
    assert delete_res.status_code == 204, delete_res.text
    
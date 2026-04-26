def test_create_and_list_saved_screeners(client, auth_headers):
    create_res = client.post(
        "/v1/saved-screeners",
        headers=auth_headers,
        json={
            "name": "High Premium Tech",
            "strategy_type": "covered_calls",
            "config_json": {
                "filters": {"exchange": 1, "sector": "Technology"},
                "sort": {"field": "premium_per_contract", "direction": "desc"},
            },
        },
    )
    assert create_res.status_code == 201, create_res.text
    created = create_res.json()
    assert created["success"] is True
    assert created["data"]["name"] == "High Premium Tech"

    list_res = client.get("/v1/saved-screeners", headers=auth_headers)
    assert list_res.status_code == 200, list_res.text
    payload = list_res.json()
    assert payload["success"] is True
    assert isinstance(payload["data"], list)
    assert len(payload["data"]) >= 1


def test_prevent_duplicate_saved_screener_names_per_strategy(client, auth_headers):
    body = {
        "name": "My Screener",
        "strategy_type": "covered_calls",
        "config_json": {"filters": {}, "sort": None},
    }

    first = client.post("/v1/saved-screeners", headers=auth_headers, json=body)
    assert first.status_code == 201, first.text

    second = client.post("/v1/saved-screeners", headers=auth_headers, json=body)
    assert second.status_code == 409, second.text


def test_update_and_delete_saved_screener(client, auth_headers):
    create_res = client.post(
        "/v1/saved-screeners",
        headers=auth_headers,
        json={
            "name": "Temporary",
            "strategy_type": "put_options",
            "config_json": {"filters": {"exchange": 1}, "sort": None},
        },
    )
    assert create_res.status_code == 201, create_res.text
    screener_id = create_res.json()["data"]["id"]

    update_res = client.put(
        f"/v1/saved-screeners/{screener_id}",
        headers=auth_headers,
        json={
            "name": "Temporary Updated",
            "config_json": {"filters": {"exchange": 2}, "sort": {"field": "open_interest", "direction": "desc"}},
        },
    )
    assert update_res.status_code == 200, update_res.text
    assert update_res.json()["data"]["name"] == "Temporary Updated"

    delete_res = client.delete(f"/v1/saved-screeners/{screener_id}", headers=auth_headers)
    assert delete_res.status_code == 204, delete_res.text
    
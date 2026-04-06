def normalize_response(payload: dict) -> dict:
    assert isinstance(payload, dict)

    return {
        "success": payload.get("success"),
        "error_is_none": payload.get("error") is None,
        "meta": {
            "version": payload.get("meta", {}).get("version"),
        },
        "data_is_list": isinstance(payload.get("data"), list),
    }


def test_v1_covered_calls_contract(client, auth_headers, snapshot):
    r = client.get("/v1/covered-calls", headers=auth_headers)
    assert r.status_code == 200
    snapshot.assert_match(normalize_response(r.json()))


def test_v1_put_options_contract(client, auth_headers, snapshot):
    r = client.get("/v1/put-options", headers=auth_headers)
    assert r.status_code == 200
    snapshot.assert_match(normalize_response(r.json()))


def test_v1_spread_options_contract(client, auth_headers, snapshot):
    r = client.get("/v1/spread-options", headers=auth_headers)
    assert r.status_code == 200
    snapshot.assert_match(normalize_response(r.json()))
    
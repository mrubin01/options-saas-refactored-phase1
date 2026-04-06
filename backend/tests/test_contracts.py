def normalize_response(payload: dict) -> dict:
    assert isinstance(payload, dict)

    normalized = {
        "success": payload.get("success"),
        "error_is_none": payload.get("error") is None,
        "meta": {
            "version": payload.get("meta", {}).get("version"),
        },
    }

    data = payload.get("data")
    normalized["data_is_list"] = isinstance(data, list)

    if isinstance(data, list):
        normalized["has_rows"] = len(data) > 0
        if data:
            row = data[0]
            normalized["row_keys"] = sorted(
                [
                    key
                    for key in [
                        "contract",
                        "ticker",
                        "exchange",
                        "expiry_date",
                        "strike_price",
                        "current_price",
                    ]
                    if key in row
                ]
            )
        else:
            normalized["row_keys"] = []
    else:
        normalized["has_rows"] = False
        normalized["row_keys"] = []

    return normalized


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
    
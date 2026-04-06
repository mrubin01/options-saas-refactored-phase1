def normalize_response(payload: dict) -> dict:
    assert isinstance(payload, dict)

    normalized = {
        "success": payload.get("success"),
        "error": payload.get("error"),
        "meta": {
            "version": payload.get("meta", {}).get("version"),
        },
    }

    data = payload.get("data")

    if isinstance(data, list):
        normalized_rows = []
        for row in data[:3]:
            normalized_rows.append(
                {
                    "contract": row.get("contract"),
                    "ticker": row.get("ticker"),
                    "exchange": row.get("exchange"),
                    "expiry_date": row.get("expiry_date"),
                    "strike_price": row.get("strike_price"),
                }
            )
        normalized["data"] = normalized_rows
        normalized["data_count"] = len(data)
    else:
        normalized["data"] = data

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

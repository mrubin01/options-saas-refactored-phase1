def assert_api_response_shape(resp_json):
    assert isinstance(resp_json, dict)

    assert "success" in resp_json
    assert "data" in resp_json
    assert "error" in resp_json

    assert isinstance(resp_json["success"], bool)

    if resp_json["success"]:
        assert resp_json["error"] is None
    else:
        assert resp_json["data"] is None
        assert isinstance(resp_json["error"], dict)
        assert "code" in resp_json["error"]
        assert "message" in resp_json["error"]


def test_auth_me_contract(client, auth_headers):
    res = client.get("/v1/auth/me", headers=auth_headers)
    assert res.status_code == 200

    data = res.json()
    assert_api_response_shape(data)

    assert data["success"] is True
    assert "id" in data["data"]
    assert "email" in data["data"]


def test_covered_calls_contract(client, auth_headers):
    res = client.get("/v1/covered-calls", headers=auth_headers)
    assert res.status_code == 200

    data = res.json()
    assert_api_response_shape(data)

    if data["success"]:
        payload = data["data"]
        assert isinstance(payload, list)

        if payload:
            row = payload[0]
            assert "contract" in row
            assert "ticker" in row
            assert "exchange" in row
            assert "expiry_date" in row
            assert "current_price" in row
            assert "strike_price" in row
            assert "rel_std_deviation" in row
            assert "spread_premium_price_and_bid" in row
            assert "spread_strike_price" in row
            assert "bid_per_share" in row
            assert "premium_per_contract" in row
            assert "spread_bid_ask" in row
            assert "open_interest" in row
            assert "impl_volatility" in row
            assert "ratio_bid_strike" in row
            assert "highest_price" in row
            assert "avg_price" in row
            assert "lowest_price" in row
            assert "main_trend" in row
            assert "beta" in row
            assert "sector" in row
            assert "industry" in row


def test_put_options_contract(client, auth_headers):
    res = client.get("/v1/put-options", headers=auth_headers)
    assert res.status_code == 200

    data = res.json()
    assert_api_response_shape(data)

    if data["success"]:
        payload = data["data"]
        assert isinstance(payload, list)

        if payload:
            row = payload[0]
            assert "contract" in row
            assert "ticker" in row
            assert "exchange" in row
            assert "expiry_date" in row
            assert "current_price" in row
            assert "strike_price" in row
            assert "rel_std_deviation" in row
            assert "spread_premium_price_and_bid" in row
            assert "spread_strike_price" in row
            assert "bid_per_share" in row
            assert "premium_per_contract" in row
            assert "spread_bid_ask" in row
            assert "open_interest" in row
            assert "impl_volatility" in row
            assert "ratio_bid_strike" in row
            assert "highest_price" in row
            assert "avg_price" in row
            assert "lowest_price" in row
            assert "main_trend" in row
            assert "beta" in row
            assert "sector" in row
            assert "industry" in row



def test_spread_options_contract(client, auth_headers):
    res = client.get("/v1/spread-options", headers=auth_headers)
    assert res.status_code == 200

    data = res.json()
    assert_api_response_shape(data)

    if data["success"]:
        payload = data["data"]
        assert isinstance(payload, list)

        if payload:
            row = payload[0]
            assert "contract" in row
            assert "ticker" in row
            assert "exchange" in row
            assert "expiry_date" in row
            assert "current_price" in row
            assert "strike_price" in row


def test_unauthorized_contract(client):
    res = client.get("/v1/covered-calls")
    assert res.status_code == 401

    data = res.json()
    assert_api_response_shape(data)

    assert data["success"] is False
    assert data["error"]["code"] is not None
    
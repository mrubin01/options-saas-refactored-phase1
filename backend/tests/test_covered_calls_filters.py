import pytest


def test_list_covered_calls_accepts_existing_basic_filters(
    client,
    auth_headers,
):
    response = client.get(
        "/v1/covered-calls",
        params={
            "ticker": "AAPL",
            "limit": 10,
            "offset": 0,
        },
        headers=auth_headers,
    )

    assert response.status_code == 200

    body = response.json()
    assert "data" in body
    assert isinstance(body["data"], list)


def test_list_covered_calls_accepts_dte_range_filters(
    client,
    auth_headers,
):
    response = client.get(
        "/v1/covered-calls",
        params={
            "days_to_expiration_min": 7,
            "days_to_expiration_max": 45,
            "limit": 50,
            "offset": 0,
        },
        headers=auth_headers,
    )

    assert response.status_code == 200

    body = response.json()
    assert "data" in body
    assert isinstance(body["data"], list)

    for item in body["data"]:
        days_to_expiration = item.get("days_to_expiration")
        if days_to_expiration is not None:
            assert days_to_expiration >= 7
            assert days_to_expiration <= 45


def test_list_covered_calls_accepts_premium_range_filters(
    client,
    auth_headers,
):
    response = client.get(
        "/v1/covered-calls",
        params={
            "premium_per_contract_min": 50,
            "premium_per_contract_max": 500,
            "limit": 50,
            "offset": 0,
        },
        headers=auth_headers,
    )

    assert response.status_code == 200

    body = response.json()
    assert "data" in body
    assert isinstance(body["data"], list)

    for item in body["data"]:
        premium = item.get("premium_per_contract")
        if premium is not None:
            assert premium >= 50
            assert premium <= 500


def test_list_covered_calls_accepts_open_interest_range_filters(
    client,
    auth_headers,
):
    response = client.get(
        "/v1/covered-calls",
        params={
            "open_interest_min": 100,
            "open_interest_max": 10000,
            "limit": 50,
            "offset": 0,
        },
        headers=auth_headers,
    )

    assert response.status_code == 200

    body = response.json()
    assert "data" in body
    assert isinstance(body["data"], list)

    for item in body["data"]:
        open_interest = item.get("open_interest")
        if open_interest is not None:
            assert open_interest >= 100
            assert open_interest <= 10000


def test_list_covered_calls_accepts_implied_volatility_range_filters(
    client,
    auth_headers,
):
    response = client.get(
        "/v1/covered-calls",
        params={
            "impl_volatility_min": 0,
            "impl_volatility_max": 200,
            "limit": 50,
            "offset": 0,
        },
        headers=auth_headers,
    )

    assert response.status_code == 200

    body = response.json()
    assert "data" in body
    assert isinstance(body["data"], list)

    for item in body["data"]:
        impl_volatility = item.get("impl_volatility")
        if impl_volatility is not None:
            assert impl_volatility >= 0
            assert impl_volatility <= 200


def test_list_covered_calls_accepts_option_yield_range_filters(
    client,
    auth_headers,
):
    response = client.get(
        "/v1/covered-calls",
        params={
            "option_yield_min": 0,
            "option_yield_max": 20,
            "limit": 50,
            "offset": 0,
        },
        headers=auth_headers,
    )

    assert response.status_code == 200

    body = response.json()
    assert "data" in body
    assert isinstance(body["data"], list)

    for item in body["data"]:
        option_yield = item.get("option_yield")
        if option_yield is not None:
            assert option_yield >= 0
            assert option_yield <= 20


def test_list_covered_calls_accepts_sort_by_dte(
    client,
    auth_headers,
):
    response = client.get(
        "/v1/covered-calls",
        params={
            "sort_by": "days_to_expiration",
            "sort_dir": "asc",
            "limit": 50,
            "offset": 0,
        },
        headers=auth_headers,
    )

    assert response.status_code == 200

    body = response.json()
    assert "data" in body
    assert isinstance(body["data"], list)

    dte_values = [
        item["days_to_expiration"]
        for item in body["data"]
        if item.get("days_to_expiration") is not None
    ]

    assert dte_values == sorted(dte_values)


def test_list_covered_calls_accepts_sort_by_open_interest_desc(
    client,
    auth_headers,
):
    response = client.get(
        "/v1/covered-calls",
        params={
            "sort_by": "open_interest",
            "sort_dir": "desc",
            "limit": 50,
            "offset": 0,
        },
        headers=auth_headers,
    )

    assert response.status_code == 200

    body = response.json()
    assert "data" in body
    assert isinstance(body["data"], list)

    open_interest_values = [
        item["open_interest"]
        for item in body["data"]
        if item.get("open_interest") is not None
    ]

    assert open_interest_values == sorted(open_interest_values, reverse=True)


def test_list_covered_calls_rejects_invalid_sort_field(
    client,
    auth_headers,
):
    response = client.get(
        "/v1/covered-calls",
        params={
            "sort_by": "invalid_field",
            "sort_dir": "desc",
        },
        headers=auth_headers,
    )

    assert response.status_code == 422


def test_list_covered_calls_rejects_invalid_sort_direction(
    client,
    auth_headers,
):
    response = client.get(
        "/v1/covered-calls",
        params={
            "sort_by": "days_to_expiration",
            "sort_dir": "sideways",
        },
        headers=auth_headers,
    )

    assert response.status_code == 422


def test_list_covered_calls_rejects_negative_dte_min(
    client,
    auth_headers,
):
    response = client.get(
        "/v1/covered-calls",
        params={
            "days_to_expiration_min": -1,
        },
        headers=auth_headers,
    )

    assert response.status_code == 422


def test_list_covered_calls_rejects_negative_open_interest_min(
    client,
    auth_headers,
):
    response = client.get(
        "/v1/covered-calls",
        params={
            "open_interest_min": -1,
        },
        headers=auth_headers,
    )

    assert response.status_code == 422


def test_list_covered_calls_rejects_limit_above_maximum(
    client,
    auth_headers,
):
    response = client.get(
        "/v1/covered-calls",
        params={
            "limit": 5000,
        },
        headers=auth_headers,
    )

    assert response.status_code == 422


def test_list_covered_calls_rejects_negative_offset(
    client,
    auth_headers,
):
    response = client.get(
        "/v1/covered-calls",
        params={
            "offset": -1,
        },
        headers=auth_headers,
    )

    assert response.status_code == 422
    
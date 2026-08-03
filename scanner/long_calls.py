import Assets
from typing import Any
import config
import math
import functions


def scan_long_calls(
    ticker: Assets.Equity | Assets.ETF,
    exchange: int,
    option_date: str,
    min_ask: float,
    symbol: str,
    current_price: float,
    lowest_price: float,
    highest_price: float,
    avg_price: float,
    avg_price_7d: float,
    avg_price_30d: float,
    trend: int,
    rel_std_deviation: float,
    historical_volatility: float,
    sector: str | None = None,
    industry: str | None = None,
    beta: float | None = None,
) -> list[dict[str, Any]]:

    matched_contracts = []

    calls = functions.get_alpaca_option_chain(symbol, option_date, "call")
    if calls is None or calls.empty:
        return []

    main_trend = functions.compute_main_trend(current_price, avg_price, avg_price_7d, avg_price_30d, trend)
    dte = functions.days_to_expiration(option_date)
    if dte <= 0:
        return []

    for row in calls.itertuples(index=False):
        ask = row.ask
        bid = row.bid

        if isinstance(ask, float) and math.isnan(ask):
            continue
        if ask < min_ask:
            continue

        spread_bid_ask = round(ask - bid, 2)
        if isinstance(spread_bid_ask, float) and math.isnan(spread_bid_ask):
            continue

        # Skip options with very wide spreads relative to ask (poor liquidity)
        if ask > 0 and (spread_bid_ask / ask) > 1.0:
            continue

        # Moneyness: positive = OTM for calls (strike above current price)
        moneyness = round(((float(row.strike) - current_price) / current_price) * 100, 2)

        # Skip very deep OTM calls — unlikely to be profitable at 10% move
        if moneyness > 20.0:
            continue

        # Profit at 5% and 10% stock moves (intrinsic value at expiry)
        price_5pct = current_price * 1.05
        price_10pct = current_price * 1.10
        intrinsic_5pct = max(0.0, price_5pct - float(row.strike))
        intrinsic_10pct = max(0.0, price_10pct - float(row.strike))
        profit_5pct = round(intrinsic_5pct - ask, 2)
        profit_10pct = round(intrinsic_10pct - ask, 2)

        # Require the 10% move scenario to be profitable
        if profit_10pct <= 0:
            continue

        return_5pct = round((profit_5pct / ask) * 100, 2) if ask > 0 else 0.0
        return_10pct = round((profit_10pct / ask) * 100, 2) if ask > 0 else 0.0

        iv_decimal = float(row.impliedVolatility)
        iv_hv_ratio = round(iv_decimal / historical_volatility, 2) if historical_volatility > 0 else None

        otm = round(abs(float(row.strike) - current_price), 2)
        try:
            sigma_distance = functions.sigma_distance_to_strike(
                current_price, float(row.strike), iv_decimal, dte
            )
        except Exception:
            continue

        est_delta = functions.estimate_delta(
            "call", current_price, row.strike, dte, config.RISK_FREE_RATE, row.impliedVolatility
        )
        break_even = round(float(row.strike) + ask, 2)

        contract = {
            "ticker": ticker.symbol,
            "exchange": exchange,
            "contract": row.contractSymbol,
            "expiry_date": option_date,
            "days_to_expiration": dte,
            "current_price": round(current_price, 2),
            "coeff_variation": rel_std_deviation,
            "otm": otm,
            "strike_price": round(float(row.strike), 2),
            "moneyness": moneyness,
            "sigma_distance": round(sigma_distance, 2),
            "ask_per_share": round(ask, 2),
            "premium_per_contract": round(ask * 100, 2),
            "spread_bid_ask": spread_bid_ask,
            "break_even": break_even,
            "open_interest": 0,
            "impl_volatility": round(iv_decimal * 100, 2),
            "delta": est_delta,
            "highest_price": highest_price,
            "avg_price": avg_price,
            "lowest_price": lowest_price,
            "main_trend": main_trend,
            "iv_hv_ratio": iv_hv_ratio,
            "ex_dividend_date": None,
            "earnings_date": None,
            "profit_5pct": profit_5pct,
            "return_5pct": return_5pct,
            "profit_10pct": profit_10pct,
            "return_10pct": return_10pct,
        }

        if exchange in [0, 1]:
            contract["sector"] = sector
            contract["industry"] = industry
            contract["beta"] = beta

        matched_contracts.append(contract)

    return matched_contracts


if __name__ == "__main__":
    raise RuntimeError("This module is not meant to be run directly")

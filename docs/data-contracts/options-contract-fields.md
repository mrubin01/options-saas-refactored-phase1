# Options Contract Data Contract

This document defines the stable field contract shared by:

- scanner output files
- backend SQLAlchemy models
- backend API schemas
- frontend TypeScript types
- frontend tables
- frontend filters
- saved screeners
- metric glossary

The goal is to avoid silent regressions caused by inconsistent field names such as `days_to_exp` vs `days_to_expiration`, or `implied_volatility` vs `impl_volatility`.

---

## Shared strategy types

The platform currently supports three option strategy datasets:

| Strategy | Backend route | Frontend page |
|---|---|---|
| Covered Calls | `/v1/covered-calls` | `/covered-calls` |
| Put Options | `/v1/puts` | `/put-options` |
| Spread Options | `/v1/spreads` | `/spread-options` |

---

## Stable contract fields

These are the canonical field names expected across the application.

| Field | Type | Nullable | Description |
|---|---:|---:|---|
| `ticker` | string | no | Underlying stock or ETF ticker. |
| `exchange` | number | no | Exchange identifier. `0 = NYSE`, `1 = NASDAQ`, `2 = ARCA`. |
| `contract` | string | no | Unique option contract identifier. |
| `expiry_date` | date/string | no | Contract expiry date. |
| `current_price` | number | yes | Latest available underlying price. |
| `strike_price` | number | yes | Option strike price. |
| `days_to_expiration` | number | yes | Number of calendar days until expiry. |
| `coeff_variation` | number | yes | Relative price variation metric. |
| `max_profit` | number | yes | Estimated maximum profit. |
| `max_profit_per_contract` | number | yes | Estimated maximum profit for one contract. |
| `otm` | number | yes | Out-of-the-money distance. |
| `moneyness` | number | yes | Relationship between current price and strike price. |
| `sigma_distance` | number | yes | Strike distance in volatility-adjusted terms. |
| `break_even` | number | yes | Approximate break-even price. |
| `option_yield` | number | yes | Option premium yield. |
| `roc` | number | yes | Return on capital. |
| `tot_return` | number | yes | Estimated total return. |
| `delta` | number | yes | Option delta. |
| `spread_bid_ask` | number | yes | Bid/ask spread. |
| `open_interest` | number | yes | Number of outstanding contracts. |
| `impl_volatility` | number | yes | Implied volatility. |
| `bid_per_share` | number | yes | Quoted bid per option share. |
| `premium_per_contract` | number | yes | Premium for one contract. |
| `sector` | string | yes | Underlying company sector. Usually absent for ARCA ETFs. |
| `industry` | string | yes | Underlying company industry. Usually absent for ARCA ETFs. |
| `highest_price` | number | yes | Highest underlying price in scanner lookback period. |
| `avg_price` | number | yes | Average underlying price in scanner lookback period. |
| `lowest_price` | number | yes | Lowest underlying price in scanner lookback period. |
| `main_trend` | string/number | yes | Scanner-derived trend value. |
| `beta` | number | yes | Underlying beta. Usually absent for ARCA ETFs. |

---

## Canonical names

Use these names everywhere.

| Use this | Do not use |
|---|---|
| `days_to_expiration` | `days_to_exp`, `dte` |
| `option_yield` | `yield_pct`, `yield` |
| `impl_volatility` | `implied_volatility`, `iv` |
| `spread_bid_ask` | `bid_ask_spread`, `spread` |
| `premium_per_contract` | `premium`, `contract_premium` |
| `bid_per_share` | `bid`, `bid_price` |
| `tot_return` | `total_return` |
| `coeff_variation` | `coefficient_variation` |
| `main_trend` | `trend` |

---

## Covered Calls contract

Covered Calls should support the full shared contract field set.

Required identity fields:

```text
ticker
exchange
contract
expiry_date
